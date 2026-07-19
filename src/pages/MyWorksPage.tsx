import { useEffect, useState, type CSSProperties } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { USE_MOCKS } from '../api/client';
import { getStoredGenerationJobs, removeStoredGenerationJob } from '../api/generationStorage';
import { fontifyApi } from '../api/fontifyApi';
import { mapGenerationStatusToWorkItem } from '../api/mappers';
import { mockWorkItems } from '../mocks/works';
import type { WorkItem, WorkTimelineLog } from '../types/work';

const progressSteps = ['영문 분석', '14자 한글 생성', 'AI 재학습', '11,172자 완성'] as const;
const fallbackPreviewLetters = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];
const totalGlyphCount = 11172;
const WORKS_PAGE_SIZE = 3;
const progressStepLabels = ['영문 분석', '14자 생성', 'AI 재구성 (약 10분)', '11,172자 완성'] as const;

void progressSteps;

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getStepProgress(totalProgress: number, index: number) {
  const stepStart = index * 25;
  return clampPercent(((totalProgress - stepStart) / 25) * 100);
}

function getFailedStageIndex(work: WorkItem) {
  if (work.downloadUrl) return 3;
  if (work.previewImageUrls?.length || work.previewLetters?.length) return 2;
  return 0;
}

function hasPreviewGeneratedBeforeFailure(work: WorkItem) {
  return work.phase === 'failed' && getFailedStageIndex(work) >= 2;
}

function getProcessStageState(work: WorkItem, index: number) {
  if (work.phase === 'failed') {
    const failedStageIndex = getFailedStageIndex(work);
    if (index < failedStageIndex) return 'done';
    if (index === failedStageIndex) return 'failed';
    return 'waiting';
  }
  if (work.phase === 'queued') return 'waiting';
  if (work.phase === 'analyzing') return index === 0 ? 'active' : 'waiting';
  if (work.phase === 'preview_ready') return index < 2 ? 'done' : 'waiting';
  if (work.phase === 'retraining') return index < 2 ? 'done' : index === 2 ? 'active' : 'waiting';
  if (work.phase === 'finalizing') return index < 3 ? 'done' : 'active';
  return 'done';
}

function getProcessStageStatus(work: WorkItem, index: number) {
  if (work.phase === 'failed') {
    const failedStageIndex = getFailedStageIndex(work);
    if (index < failedStageIndex) return '완료';
    return index === failedStageIndex ? '실패' : '대기';
  }

  const state = getProcessStageState(work, index);
  if (state === 'done') return '완료';
  if (state === 'active') return `진행 중 (${getStepProgress(work.progressPercent, index)}%)`;
  return '대기';
}

function getPhaseMessage(work: WorkItem) {
  if (work.phase === 'failed') {
    return {
      title: hasPreviewGeneratedBeforeFailure(work) ? '미리보기 생성 후 최종 생성 실패' : '생성 요청 실패',
      body:
        work.failReason ??
        '작업이 완료되기 전에 중단되었습니다. 백엔드 응답과 요청 로그를 확인해 주세요.',
    };
  }

  if (work.phase === 'queued') {
    return {
      title: '영문 분석 준비 중',
      body: '이전 작업이 끝나면 스타일 분석과 한글 미리보기 생성이 자동으로 시작됩니다.',
    };
  }

  if (work.phase === 'analyzing') {
    return {
      title: '영문 스타일 추출 중',
      body: '선택한 영문 폰트의 곡선, 굵기, 기울기, 자간 특징을 분석하고 있습니다.',
    };
  }

  if (work.phase === 'preview_ready') {
    return {
      title: '14자 한글 미리보기 생성 완료',
      body: '스타일 확인용 14자가 생성되었습니다. 곧 전체 글자 재학습 단계로 넘어갑니다.',
    };
  }

  if (work.phase === 'retraining') {
    return {
      title: 'AI 재학습 중',
      body: '14자 미리보기를 기준으로 전체 한글 글리프의 스타일과 일관성을 학습하고 있습니다.',
    };
  }

  if (work.phase === 'finalizing') {
    return {
      title: '전체 글자 세트 빌드 중',
      body: '학습된 글리프를 폰트 파일로 빌드하고 있습니다. 완료되면 다운로드가 활성화됩니다.',
    };
  }

  return {
    title: '폰트 생성 완료',
    body: '완성 페이지에서 미리보기와 다운로드를 확인할 수 있습니다.',
  };
}

function isPreviewAvailable(work: WorkItem) {
  const phaseCanShowPreview =
    work.phase === 'preview_ready' ||
    work.phase === 'retraining' ||
    work.phase === 'finalizing' ||
    work.phase === 'completed';
  const hasPreviewData = Boolean(work.previewImageUrls?.length || work.previewLetters?.length);

  return (
    work.phase !== 'queued' &&
    work.phase !== 'analyzing' &&
    (hasPreviewData || (USE_MOCKS && phaseCanShowPreview))
  );
}

function buildSelectedUrl(work: WorkItem) {
  if (work.phase !== 'completed' || (!work.jobId && !work.generatedFontId)) return '';

  const params = new URLSearchParams();
  if (work.jobId) params.set('jobId', String(work.jobId));
  if (work.generatedFontId) params.set('generatedFontId', String(work.generatedFontId));
  if (work.sourceFontId) params.set('sourceFontId', String(work.sourceFontId));
  if (work.sourceFontName) params.set('family', work.sourceFontName);

  return `#/selected?${params.toString()}`;
}

function getGeneratedPreviewCount(work: WorkItem) {
  if (!isPreviewAvailable(work)) return 0;
  if (!USE_MOCKS) {
    return Math.min(14, Math.max(work.previewImageUrls?.length ?? 0, work.previewLetters?.length ?? 0));
  }
  if (work.phase === 'completed') return fallbackPreviewLetters.length;
  return Math.min(fallbackPreviewLetters.length, Math.max(10, Math.ceil((clampPercent(work.progressPercent) / 100) * 14)));
}

function getPreviewScanDelay(index: number) {
  if (index <= 2) return 0;
  if (index <= 6) return 760;
  if (index <= 9) return 1520;
  return 0;
}

function ProgressStepper({ work }: { work: WorkItem }) {
  const normalizedProgress = clampPercent(work.progressPercent);

  return (
    <div className="workStepper" aria-label="폰트 생성 진행 단계">
      <div className="workStepper__track" aria-hidden="true">
        <span style={{ width: `${normalizedProgress}%` }} />
      </div>
      <div className="workStepper__items">
        {progressStepLabels.map((step, index) => {
          const state = getProcessStageState(work, index);

          return (
            <div className={`workStepper__item is-${state}`} key={step}>
              <div className="workStepper__dot">
                {state === 'done' ? '✓' : state === 'failed' ? '!' : `0${index + 1}`}
              </div>
              <p>
                <strong>{step}</strong>
                <span>{getProcessStageStatus(work, index)}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewGrid({ work }: { work: WorkItem }) {
  const normalizedProgress = clampPercent(work.progressPercent);
  const generatedCount = getGeneratedPreviewCount(work);
  const previewLetters = work.previewLetters?.slice(0, 14) ?? [];
  const previewImages = work.previewImageUrls?.slice(0, 14) ?? [];
  const slotCount = USE_MOCKS ? fallbackPreviewLetters.length : Math.max(previewLetters.length, previewImages.length);
  const letters = Array.from({ length: slotCount }, (_, index) =>
    previewLetters[index] ?? (USE_MOCKS ? fallbackPreviewLetters[index] : ''),
  );

  return (
    <section className="workPreview">
      <header className="workPreview__header">
        <div>
          <h3>14자 한글 폰트 미리보기</h3>
          <p>
            <span aria-hidden="true" />
            {isPreviewAvailable(work) ? '1차 자소 렌더링 중...' : '영문 스타일 분석 대기 중...'}
          </p>
        </div>
        <div className="workPreview__score">
          <span>STYLE MATCHING INDEX</span>
          <div aria-hidden="true">
            <i style={{ width: `${normalizedProgress}%` }} />
          </div>
          <strong>{normalizedProgress}%</strong>
        </div>
      </header>

      <div className="workPreview__grid" aria-label="한글 미리보기 글자">
        {letters.map((letter, index) => {
          const imageUrl = previewImages[index];
          const isGenerated = index < generatedCount;
          const scanDelay = getPreviewScanDelay(index);

          return (
            <div
              className={`workPreview__letter ${isGenerated ? 'is-generated' : 'is-pending'}`}
              key={`${letter}-${index}`}
              style={isGenerated ? ({ '--scan-delay': `${scanDelay}ms` } as CSSProperties) : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {imageUrl && isGenerated ? <img src={imageUrl} alt={`${letter} 미리보기`} /> : <strong>{isGenerated ? letter : ''}</strong>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WorkTimeline({ logs }: { logs: WorkTimelineLog[] }) {
  return (
    <section className="workTimeline" aria-label="작업 타임라인">
      <header>
        <h3>상세 타임라인</h3>
        <p>백엔드 상태와 요청 로그를 기준으로 작업 기록을 표시합니다.</p>
      </header>
      <ol>
        {logs.map((log) => (
          <li className={`is-${log.state}`} key={log.id}>
            <span>{log.time}</span>
            <div>
              <strong>{log.title}</strong>
              <p>{log.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WorkHeroCard({
  work,
  timelineOpen,
  onToggleTimeline,
  onDelete,
}: {
  work: WorkItem;
  timelineOpen: boolean;
  onToggleTimeline: () => void;
  onDelete: () => void;
}) {
  const selectedUrl = buildSelectedUrl(work);
  const completedHref = selectedUrl || work.downloadUrl || '#';
  const completedDisabled = !selectedUrl && !work.downloadUrl;

  return (
    <article className="workActiveCard">
      <header className="workActiveCard__header">
        <div className="workActiveCard__identity" aria-hidden="true">
          <span>Aa</span>
          <i>→</i>
          <strong>가</strong>
        </div>
        <div className="workActiveCard__meta">
          <h2>{work.title}</h2>
          <p>{work.updatedAt}</p>
        </div>
        <span className={`workActiveCard__status ${work.phase === 'failed' ? 'is-failed' : ''}`}>
          {work.statusLabel}
        </span>
      </header>

      <ProgressStepper work={work} />
      <PreviewGrid work={work} />

      <div className="workActiveCard__actions">
        {work.phase === 'completed' ? (
          <a
            className="is-primary"
            href={completedHref}
            aria-disabled={completedDisabled}
            onClick={(event) => {
              if (completedDisabled) event.preventDefault();
            }}
          >
            완성 폰트 보기
          </a>
        ) : (
          <button className="is-primary" type="button" onClick={onToggleTimeline} aria-expanded={timelineOpen}>
            {timelineOpen ? '진행 현황 닫기' : '진행 현황 상세 보기'}
          </button>
        )}

        {work.phase === 'failed' ? (
          <a href="#/english-fonts">다시 시도</a>
        ) : work.phase === 'completed' ? (
          <button type="button" onClick={onDelete}>
            내역 삭제
          </button>
        ) : (
          <button type="button">{work.statusLabel === 'QUEUED' ? '작업 취소' : '학습 중단'}</button>
        )}
      </div>

      {timelineOpen ? <WorkTimeline logs={work.logs} /> : null}
    </article>
  );
}

function FullSetCard({ work }: { work: WorkItem }) {
  const normalizedProgress = clampPercent(work.progressPercent);
  const generatedGlyphs = Math.max(14, Math.round((normalizedProgress / 100) * totalGlyphCount));
  const phaseMessage = getPhaseMessage(work);

  return (
    <section className="workFullSetCard">
      <div className="workFullSetCard__copy">
        <span>FULL SET</span>
        <h2>전체 11,172자 한글 완성하기</h2>
        <p>
          지금은 스타일 확인용 기초 <strong>14자</strong>만 무료로 생성됩니다. 포인트를 사용하면 전체 한글 글자 세트로 완성하고
          TTF/OTF로 내보낼 수 있어요.
        </p>
        <div className="workFullSetCard__progress">
          <small>{generatedGlyphs.toLocaleString()} / 11,172자 생성됨</small>
          <small>{Math.max(0.1, normalizedProgress / 100).toFixed(1)}%</small>
          <i aria-hidden="true">
            <b style={{ width: `${Math.max(1, normalizedProgress)}%` }} />
          </i>
        </div>
        <p className="workFullSetCard__note">{phaseMessage.title}</p>
      </div>
      <div className="workFullSetCard__points">
        <strong>
          5,000 <span>P</span>
        </strong>
        <p>보유 포인트 2,026 P</p>
        <button type="button">포인트로 완성하기</button>
        <a href="#/points">포인트 충전하기</a>
      </div>
    </section>
  );
}

function WaitingWorkList({
  works,
  activeWorkId,
  onSelect,
}: {
  works: WorkItem[];
  activeWorkId: string;
  onSelect: (workId: string) => void;
}) {
  if (works.length === 0) return null;

  return (
    <section className="workWaitingList">
      <h2>
        대기 중인 작업 <span>{works.length}</span>
      </h2>
      <div className="workWaitingList__panel">
        {works.map((work, index) => (
          <button
            className={`workQueueItem ${work.id === activeWorkId ? 'is-active' : ''}`}
            type="button"
            onClick={() => onSelect(work.id)}
            key={work.id}
          >
            <span className="workQueueItem__sample">{work.sample}</span>
            <span className="workQueueItem__copy">
              <strong>{work.title}</strong>
              <small>{work.phase === 'queued' ? work.updatedAt : getPhaseMessage(work).title}</small>
            </span>
            <span className="workQueueItem__stage">{work.queueLabel ?? `STAGE ${String(index + 1).padStart(2, '0')}`}</span>
            <i aria-hidden="true">›</i>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkListStatus({ title, body }: { title: string; body: string }) {
  return (
    <section className="workListStatus">
      <h2>{title}</h2>
      <p>{body}</p>
      <a href="#/english-fonts">새 작업 요청하기</a>
    </section>
  );
}

export default function MyWorksPage() {
  const [activeWorkId, setActiveWorkId] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [workItems, setWorkItems] = useState<WorkItem[]>(mockWorkItems);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCount, setActiveCount] = useState(0);
  const [queuedCount, setQueuedCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let isPolling = false;

    const loadJobs = async () => {
      if (isPolling) return;
      isPolling = true;

      try {
        const jobs = await fontifyApi.getMyGenerations();
        const storedJobs = getStoredGenerationJobs();
        const sortedJobs = [...jobs].sort(
          (left, right) => new Date(right.requested_at).getTime() - new Date(left.requested_at).getTime(),
        );
        const nextTotalPages = Math.max(1, Math.ceil(sortedJobs.length / WORKS_PAGE_SIZE));
        const safePage = Math.min(currentPage, nextTotalPages);
        const visibleJobs = sortedJobs.slice(
          (safePage - 1) * WORKS_PAGE_SIZE,
          safePage * WORKS_PAGE_SIZE,
        );

        if (sortedJobs.length === 0) {
          if (!isMounted) return;
          setWorkItems([]);
          setLoadError('');
          setActiveCount(0);
          setQueuedCount(0);
          setTotalPages(1);
          return;
        }

        const results = await Promise.allSettled(
          visibleJobs.map(async (job) => {
            const status = await fontifyApi.getGenerationStatus(job.job_id);
            const storedJob = storedJobs.find((item) => item.jobId === job.job_id);

            return mapGenerationStatusToWorkItem(
              {
                jobId: job.job_id,
                fontFileId: storedJob?.fontFileId ?? 0,
                fontName: storedJob?.fontName ?? job.font_name,
                requestedAt: job.requested_at,
              },
              status,
            );
          }),
        );

        const resolvedItems = results
          .filter((result): result is PromiseFulfilledResult<WorkItem> => result.status === 'fulfilled')
          .map((result) => result.value);
        const failedCount = results.length - resolvedItems.length;

        if (!isMounted) return;
        setActiveCount(sortedJobs.filter((job) => !job.status.toUpperCase().includes('QUEUE')).length);
        setQueuedCount(sortedJobs.filter((job) => job.status.toUpperCase().includes('QUEUE')).length);
        setTotalPages(nextTotalPages);
        if (safePage !== currentPage) {
          setCurrentPage(safePage);
        }
        setWorkItems(resolvedItems);
        setLoadError(
          failedCount > 0
            ? `${failedCount}개의 작업 상태를 불러오지 못했습니다. 응답 가능한 작업만 표시합니다.`
            : '',
        );
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : '작업 상태를 불러오지 못했습니다.');
        setWorkItems([]);
      } finally {
        isPolling = false;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadJobs();
    const polling = window.setInterval(() => {
      void loadJobs();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(polling);
    };
  }, [currentPage]);

  useEffect(() => {
    if (workItems.length === 0) {
      setActiveWorkId('');
      return;
    }

    setActiveWorkId((current) => {
      if (current && workItems.some((work) => work.id === current)) return current;
      return workItems.find((work) => work.phase !== 'queued')?.id ?? workItems[0].id;
    });
  }, [workItems]);

  const activeWork = workItems.find((work) => work.id === activeWorkId) ?? workItems[0];
  const waitingWorks = activeWork ? workItems.filter((work) => work.id !== activeWork.id) : [];

  const handleDeleteWork = (workId: string) => {
    removeStoredGenerationJob(Number(workId));
    setWorkItems((current) => current.filter((work) => work.id !== workId));
    setTimelineOpen(false);
  };

  return (
    <div className="myWorksPage">
      <Header variant="home" activeNav="english" />
      <main className="myWorksPage__main">
        <section className="myWorksPage__title">
          <h1>작업 중인 폰트</h1>
          <span>
            진행 중 {activeCount} · 대기 {queuedCount}
          </span>
        </section>

        {isLoading ? (
          <WorkListStatus title="작업을 불러오는 중" body="작업 목록과 진행 로그를 준비하고 있습니다." />
        ) : loadError && workItems.length === 0 ? (
          <WorkListStatus title="작업을 불러오지 못했습니다" body={loadError} />
        ) : workItems.length === 0 || !activeWork ? (
          <WorkListStatus
            title="진행 중인 작업이 없습니다"
            body="새로운 영문 폰트를 선택해 한글 폰트 생성 작업을 시작해 보세요."
          />
        ) : (
          <div className="myWorksPage__stack">
            {loadError ? <WorkListStatus title="일부 작업만 표시 중입니다" body={loadError} /> : null}
            <WorkHeroCard
              work={activeWork}
              timelineOpen={timelineOpen}
              onToggleTimeline={() => setTimelineOpen((current) => !current)}
              onDelete={() => handleDeleteWork(activeWork.id)}
            />
            <FullSetCard work={activeWork} />
            <WaitingWorkList
              works={waitingWorks}
              activeWorkId={activeWork.id}
              onSelect={(workId) => {
                setActiveWorkId(workId);
                setTimelineOpen(false);
              }}
            />
            {totalPages > 1 ? (
              <div className="myWorksPage__pagination" aria-label="작업중인 폰트 페이지네이션">
                <button
                  type="button"
                  className="myWorksPage__pageBtn"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </button>
                <span className="myWorksPage__pageStatus">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className="myWorksPage__pageBtn"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  다음
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
