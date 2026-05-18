import type {
  ApiDownloadItem,
  ApiFontFileItem,
  ApiGeneratedFontItem,
  ApiGenerationCreateResponse,
  ApiMeResponse,
  ApiRatingItem,
  ApiGenerationStatus,
} from './backendTypes';
import { resolveApiAssetUrl } from './client';
import type { StoredGenerationJob } from './generationStorage';
import type {
  EnglishFontCard,
  FontFilterKey,
  TopFont,
  UserOwnedFont,
} from '../types/font';
import type { PendingReviewFont, ReviewCard } from '../types/review';
import type { UserActivityStat, UserProfile } from '../types/user';
import type { WorkItem, WorkPhase, WorkTimelineLog, WorkTimelineState } from '../types/work';

const fallbackAvatarSrc = '/images/my-page/profile-avatar.png';
const statLikeIconSrc = '/images/my-page/activity-like-icon.svg';
const statReviewIconSrc = '/images/my-page/activity-review-icon.png';
const statOwnedIconSrc = '/images/my-page/activity-owned-font-icon.svg';

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function daysSince(dateValue: string) {
  const createdAt = new Date(dateValue).getTime();
  if (Number.isNaN(createdAt)) return 0;
  return Math.max(0, Math.floor((Date.now() - createdAt) / 86_400_000));
}

function parseBackendDate(dateValue: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateValue);
  return new Date(hasTimezone ? dateValue : `${dateValue}Z`);
}

function formatDateTime(dateValue: string | null) {
  if (!dateValue) return 'Pending';
  const date = parseBackendDate(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function mapBackendStatusToPhase(status: string, progress: number): WorkPhase {
  const normalized = status.toUpperCase();
  if (normalized.includes('FAIL') || normalized.includes('ERROR')) return 'failed';
  if (normalized.includes('PREVIEW_READY')) return 'preview_ready';
  if (normalized.includes('COMPLETE') || normalized.includes('DONE') || progress >= 100) return 'completed';
  if (normalized.includes('PENDING') || normalized.includes('QUEUE')) return 'queued';
  if (progress < 25) return 'analyzing';
  if (progress < 75) return 'retraining';
  return 'finalizing';
}

function getFailedStageIndexFromStatus(status: ApiGenerationStatus) {
  if (status.generated_font_url) return 3;
  if (status.preview_image_urls.length > 0) return 3;
  return 0;
}

function timelineStateForPhase(
  phase: WorkPhase,
  index: number,
  failedStageIndex = 0,
): WorkTimelineState {
  if (phase === 'failed') {
    if (index < failedStageIndex) return 'done';
    if (index === failedStageIndex) return 'failed';
    return 'waiting';
  }
  const activeIndexByPhase: Record<WorkPhase, number> = {
    queued: 0,
    analyzing: 0,
    preview_ready: 1,
    retraining: 2,
    finalizing: 3,
    completed: 4,
    failed: 0,
  };
  const activeIndex = activeIndexByPhase[phase];
  if (phase === 'completed' || index < activeIndex) return 'done';
  if (index === activeIndex) return 'active';
  return 'waiting';
}

function buildWorkLogs(
  jobId: number,
  requestedAtValue: string,
  phase: WorkPhase,
  failedStageIndex: number,
  failReason?: string | null,
): WorkTimelineLog[] {
  const requestedAt = formatDateTime(requestedAtValue);
  const steps = [
    {
      title: '작업 요청 접수',
      detail: `${requestedAt}에 생성 요청이 등록되었습니다.`,
    },
    {
      title: '영문 스타일 분석',
      detail: '선택한 영문 폰트 스타일을 분석하고 한글 구조로 변환하고 있습니다.',
    },
    {
      title: 'AI 재학습',
      detail: '생성된 미리보기 세트를 기반으로 전체 폰트 출력을 다듬고 있습니다.',
    },
    {
      title: '2,350자 완성',
      detail:
        phase === 'failed'
          ? failReason ?? '생성 작업이 실패했습니다.'
          : phase === 'completed'
            ? '최종 폰트 파일이 생성되어 다운로드할 수 있습니다.'
            : '완료 후 TTF 다운로드 URL이 연결됩니다.',
    },
  ];

  return steps.map((step, index) => ({
    id: `${jobId}-log-${index + 1}`,
    time: index === 0 ? requestedAt : 'Pending',
    title: phase === 'failed' && index === failedStageIndex ? '생성 실패' : step.title,
    detail: step.detail,
    state: timelineStateForPhase(phase, index, failedStageIndex),
  }));
}

function mapPreviewUrlsToLetters(urls: string[]) {
  if (urls.length === 0) return undefined;
  const fallback = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];
  return urls.map((url, index) => {
    const filename = url.split('/').pop() ?? '';
    const letter = decodeURIComponent(filename).replace('.png', '');
    return letter || fallback[index] || `미리보기 ${index + 1}`;
  });
}

export function mapGenerationStatusToWorkItem(
  storedJob: StoredGenerationJob,
  status: ApiGenerationStatus,
): WorkItem {
  const isFailed =
    status.status.toUpperCase().includes('FAIL') ||
    status.status.toUpperCase().includes('ERROR');
  const progressPercent =
    isFailed && status.preview_image_urls.length === 0 && !status.generated_font_url
      ? 0
      : clampPercent(status.progress);
  const phase = mapBackendStatusToPhase(status.status, progressPercent);
  const hasPreview = status.preview_image_urls.length > 0;
  const failedStageIndex = getFailedStageIndexFromStatus(status);

  return {
    id: String(status.job_id),
    title: storedJob.fontName || `Fontify 작업 #${status.job_id}`,
    updatedAt: `요청 시간: ${formatDateTime(storedJob.requestedAt)}`,
    progressPercent,
    phase,
    statusLabel: status.status,
    failReason: status.fail_reason,
    sample: 'Aa',
    previewLetters: hasPreview ? mapPreviewUrlsToLetters(status.preview_image_urls) : undefined,
    previewImageUrls: hasPreview ? status.preview_image_urls.map((url) => resolveApiAssetUrl(url) ?? url) : undefined,
    downloadUrl: resolveApiAssetUrl(status.generated_font_url),
    generatedFontId: status.generated_font_id,
    sourceFontId: storedJob.fontFileId || null,
    sourceFontName: storedJob.fontName,
    logs: buildWorkLogs(status.job_id, storedJob.requestedAt, phase, failedStageIndex, status.fail_reason),
  };
}

export function mapGenerationCreateResponseToStoredJob(
  created: ApiGenerationCreateResponse,
  font: Pick<EnglishFontCard, 'id' | 'name'>,
): StoredGenerationJob {
  return {
    jobId: created.job_id,
    fontFileId: Number(font.id),
    fontName: font.name,
    requestedAt: created.requested_at,
  };
}

export function mapMeToUserProfile(me: ApiMeResponse): UserProfile {
  return {
    name: me.nickname || me.email,
    joinedDaysLabel: `Fontify와 함께한지 ${daysSince(me.created_at)}일째`,
    avatarSrc: fallbackAvatarSrc,
  };
}

export function mapUserStats(params: {
  ratingsCount: number;
  generationsCount: number;
  downloadsCount: number;
}): UserActivityStat[] {
  return [
    {
      id: 'likes',
      iconSrc: statLikeIconSrc,
      label: '좋아요',
      value: String(params.downloadsCount),
    },
    {
      id: 'reviews',
      iconSrc: statReviewIconSrc,
      label: '작성한 리뷰',
      value: String(params.ratingsCount),
      href: '#/reviews',
    },
    {
      id: 'working-fonts',
      iconSrc: statOwnedIconSrc,
      label: '작업중인 폰트',
      value: String(params.generationsCount),
      iconVariant: 'darkOnWhite',
      href: '#/my-works',
    },
  ];
}

export function mapDownloadToOwnedFont(item: ApiDownloadItem): UserOwnedFont {
  return {
    id: String(item.generated_font_id ?? item.download_id),
    title: item.font_name,
    kind: '무료',
    company: 'Fontify',
    sampleFontFamily: 'Pretendard, sans-serif',
  };
}

function inferFontType(name: string): FontFilterKey {
  const lower = name.toLowerCase();
  if (lower.includes('script') || lower.includes('hand')) return 'Handwriting';
  if (lower.includes('display') || lower.includes('black')) return 'Display';
  if (lower.includes('serif') || lower.includes('merriweather') || lower.includes('playfair')) return 'Serif';
  return 'Sans Serif';
}

export function getFontAssetPath(item: ApiFontFileItem | null | undefined) {
  if (!item) return '';
  return item.file_url || item.file_path || '';
}

export function formatVariantName(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getFontFamilyName(item: ApiFontFileItem | null | undefined) {
  if (!item) return '';
  if (item.name?.trim()) return item.name.trim();

  const assetPath = getFontAssetPath(item);
  const segments = assetPath.split('/').filter(Boolean);
  const folderName = segments.length >= 2 ? segments[segments.length - 2] : '';
  if (folderName) return formatVariantName(folderName);

  const filename = segments[segments.length - 1] ?? '';
  const withoutExtension = filename.replace(/\.[^.]+$/, '');
  const [rawFamilyName] = withoutExtension.split('-');
  return formatVariantName(rawFamilyName) || `Font ${item.font_file_id}`;
}

export function getFontVariantLabel(item: ApiFontFileItem | null | undefined) {
  if (!item) return '';

  const assetPath = getFontAssetPath(item);
  const filename = assetPath.split('/').pop() ?? '';
  const withoutExtension = filename.replace(/\.[^.]+$/, '');
  const [, ...variantParts] = withoutExtension.split('-');
  const variantName = formatVariantName(variantParts.join(' '));

  return variantName || 'Regular';
}

export function getFontDisplayName(item: ApiFontFileItem | null | undefined) {
  if (!item) return '';
  const familyName = getFontFamilyName(item);
  const variantName = getFontVariantLabel(item);

  if (familyName && variantName) return `${familyName} ${variantName}`;
  if (familyName) return familyName;

  return `Font ${item.font_file_id}`;
}

export function mapFontFileToEnglishFont(item: ApiFontFileItem): EnglishFontCard {
  const displayName = getFontDisplayName(item);
  const type = inferFontType(displayName);
  return {
    id: String(item.font_file_id),
    name: displayName,
    creator: 'Fontify',
    previewFamily: `${displayName}, Pretendard, sans-serif`,
    type,
    preview: 'Font Preview',
    // Tag support is temporarily disabled until the backend provides real tag data.
    tags: [],
  };
}

export function mapGeneratedFontToTopFont(item: ApiGeneratedFontItem, index: number): TopFont {
  const backgrounds = ['#1f1f1f', '#33475b', '#44576c', '#748496', '#b85700'];
  const title = item.name?.trim() || `Generated Font #${item.generated_font_id}`;
  return {
    id: String(item.generated_font_id),
    rank: index + 1,
    preview: title.slice(0, 2) || 'Aa',
    previewBackground: backgrounds[index % backgrounds.length],
    title,
    creator: 'Fontify',
    tags: [{ label: '생성폰트', tone: 'blue' }],
    likes: 0,
  };
}

export function mapRatingToReview(item: ApiRatingItem): ReviewCard {
  return {
    id: String(item.rating_id),
    title: item.font_name,
    rating: item.score,
    sample: item.font_name,
    body: item.comment ?? '작성한 리뷰 내용이 없습니다.',
    date: `${formatDateTime(item.rated_at)} 작성`,
  };
}

export function mapDownloadToPendingReviewFont(item: ApiDownloadItem, index: number): PendingReviewFont {
  return {
    id: String(item.generated_font_id ?? item.download_id),
    label: '理쒓렐 ?ㅼ슫濡쒕뱶',
    name: item.font_name,
    tone: index === 0 ? 'primary' : 'soft',
    mark: index === 0 ? 'quote' : 'lines',
  };
}


