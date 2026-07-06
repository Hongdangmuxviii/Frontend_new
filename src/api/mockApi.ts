import type {
  ApiDownloadItem,
  ApiDownloadResponse,
  ApiFontFileItem,
  ApiGeneratedFontItem,
  ApiGenerationCreateResponse,
  ApiGenerationJobItem,
  ApiGenerationStatus,
  ApiMeResponse,
  ApiMeUpdateRequest,
  ApiMeUpdateResponse,
  ApiRateRequest,
  ApiRateResponse,
  ApiRatingItem,
} from './backendTypes';

type DevLoginResponse = {
  user_id: string;
  email: string;
  nickname: string;
  created_at?: string;
};

type HandwritingUploadResponse = {
  handwriting_id: number;
  image_url: string;
  submitted_at?: string;
};

const now = '2026-07-06T09:30:00Z';

const mockMe: ApiMeResponse = {
  user_id: 'mock-user-001',
  email: 'designer@fontify.mock',
  nickname: 'Fontify Designer',
  created_at: '2026-03-02T10:00:00Z',
};

const mockFonts: ApiFontFileItem[] = [
  { font_file_id: 101, font_family_id: 1, name: 'Ubuntu Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/ubuntu-regular.ttf' },
  { font_file_id: 102, font_family_id: 1, name: 'Ubuntu Bold', weight: 700, style: 'normal', file_url: '/mock-fonts/ubuntu-bold.ttf' },
  { font_file_id: 201, font_family_id: 2, name: 'Merriweather Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/merriweather-regular.ttf' },
  { font_file_id: 202, font_family_id: 2, name: 'Merriweather Bold', weight: 700, style: 'normal', file_url: '/mock-fonts/merriweather-bold.ttf' },
  { font_file_id: 301, font_family_id: 3, name: 'Playfair Display Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/playfair-display-regular.ttf' },
  { font_file_id: 302, font_family_id: 3, name: 'Playfair Display Italic', weight: 400, style: 'italic', file_url: '/mock-fonts/playfair-display-italic.ttf' },
  { font_file_id: 401, font_family_id: 4, name: 'Lato Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/lato-regular.ttf' },
  { font_file_id: 402, font_family_id: 4, name: 'Lato Black', weight: 900, style: 'normal', file_url: '/mock-fonts/lato-black.ttf' },
  { font_file_id: 501, font_family_id: 5, name: 'Montserrat SemiBold', weight: 600, style: 'normal', file_url: '/mock-fonts/montserrat-semibold.ttf' },
  { font_file_id: 601, font_family_id: 6, name: 'Nanum Pen Script Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/nanum-pen-script.ttf' },
  { font_file_id: 701, font_family_id: 7, name: 'Black Han Sans Regular', weight: 900, style: 'normal', file_url: '/mock-fonts/black-han-sans.ttf' },
  { font_file_id: 801, font_family_id: 8, name: 'Noto Sans KR Regular', weight: 400, style: 'normal', file_url: '/mock-fonts/noto-sans-kr.ttf' },
];

const mockGeneratedFonts: ApiGeneratedFontItem[] = [
  { generated_font_id: 9001, name: 'Ubuntu Hangul 6', file_url: '/mock-fonts/generated-ubuntu-hangul.ttf' },
  { generated_font_id: 9002, name: 'Merriweather Korean Serif', file_url: '/mock-fonts/generated-merriweather-kr.ttf' },
  { generated_font_id: 9003, name: 'Playfair Hangul Display', file_url: '/mock-fonts/generated-playfair-kr.ttf' },
  { generated_font_id: 9004, name: 'Lato Gothic KR', file_url: '/mock-fonts/generated-lato-kr.ttf' },
  { generated_font_id: 9005, name: 'Montserrat Rounded Hangul', file_url: '/mock-fonts/generated-montserrat-kr.ttf' },
];

const mockJobs: ApiGenerationJobItem[] = [
  {
    job_id: 7001,
    status: 'RETRAINING',
    progress: 62,
    similarity_percent: 88,
    requested_at: '2026-07-06T08:40:00Z',
    finished_at: null,
    font_name: 'Merriweather Korean Serif',
  },
  {
    job_id: 7002,
    status: 'COMPLETED',
    progress: 100,
    similarity_percent: 91,
    requested_at: '2026-07-05T14:20:00Z',
    finished_at: '2026-07-05T14:48:00Z',
    font_name: 'Ubuntu Hangul 6',
  },
  {
    job_id: 7003,
    status: 'QUEUED',
    progress: 8,
    similarity_percent: null,
    requested_at: '2026-07-06T09:12:00Z',
    finished_at: null,
    font_name: 'Nanum Pen Script Regular',
  },
];

const mockStatuses: Record<number, ApiGenerationStatus> = {
  7001: {
    job_id: 7001,
    status: 'RETRAINING',
    progress: 62,
    similarity_percent: 88,
    fail_reason: null,
    preview_image_urls: [],
    generated_font_id: null,
    generated_font_url: null,
  },
  7002: {
    job_id: 7002,
    status: 'COMPLETED',
    progress: 100,
    similarity_percent: 91,
    fail_reason: null,
    preview_image_urls: [],
    generated_font_id: 9001,
    generated_font_url: '/mock-fonts/generated-ubuntu-hangul.ttf',
  },
  7003: {
    job_id: 7003,
    status: 'QUEUED',
    progress: 8,
    similarity_percent: null,
    fail_reason: null,
    preview_image_urls: [],
    generated_font_id: null,
    generated_font_url: null,
  },
};

const mockDownloads: ApiDownloadItem[] = [
  {
    download_id: 3001,
    font_id: null,
    generated_font_id: 9001,
    font_name: 'Ubuntu Hangul 6',
    file_url: '/mock-fonts/generated-ubuntu-hangul.ttf',
    downloaded_at: '2026-07-05T15:02:00Z',
  },
  {
    download_id: 3002,
    font_id: null,
    generated_font_id: 9002,
    font_name: 'Merriweather Korean Serif',
    file_url: '/mock-fonts/generated-merriweather-kr.ttf',
    downloaded_at: '2026-07-04T11:18:00Z',
  },
  {
    download_id: 3003,
    font_id: null,
    generated_font_id: 9004,
    font_name: 'Lato Gothic KR',
    file_url: '/mock-fonts/generated-lato-kr.ttf',
    downloaded_at: '2026-07-02T16:45:00Z',
  },
];

const mockRatings: ApiRatingItem[] = [
  {
    rating_id: 4001,
    generated_font_id: 9001,
    font_name: 'Ubuntu Hangul 6',
    score: 5,
    comment: 'UI에서도 또렷하고 한글 자간이 안정적입니다.',
    rated_at: '2026-07-05T16:10:00Z',
  },
  {
    rating_id: 4002,
    generated_font_id: 9002,
    font_name: 'Merriweather Korean Serif',
    score: 4,
    comment: '본문보다 포스터/브랜딩 시안에 잘 어울렸습니다.',
    rated_at: '2026-07-04T12:30:00Z',
  },
];

function pageItems<T>(items: T[], page = 1, limit = items.length) {
  const start = Math.max(0, page - 1) * limit;
  return items.slice(start, start + limit);
}

function findFont(fontId: number | string) {
  const numericId = Number(fontId);
  return mockFonts.find((font) => font.font_file_id === numericId) ?? mockFonts[0];
}

function findGeneratedFont(fontId: number | string) {
  const numericId = Number(fontId);
  return mockGeneratedFonts.find((font) => font.generated_font_id === numericId) ?? mockGeneratedFonts[0];
}

export const mockFontifyApi = {
  signup(): Promise<DevLoginResponse> {
    return Promise.resolve({ ...mockMe });
  },
  login(): Promise<DevLoginResponse> {
    return Promise.resolve({ ...mockMe });
  },
  devLogin(): Promise<DevLoginResponse> {
    return Promise.resolve({ ...mockMe });
  },
  getMe(): Promise<ApiMeResponse> {
    return Promise.resolve({ ...mockMe });
  },
  updateMe(payload: ApiMeUpdateRequest): Promise<ApiMeUpdateResponse> {
    return Promise.resolve({
      user_id: mockMe.user_id,
      nickname: payload.nickname,
      updated_at: now,
    });
  },
  getMyRatings(): Promise<ApiRatingItem[]> {
    return Promise.resolve([...mockRatings]);
  },
  getMyGenerations(): Promise<ApiGenerationJobItem[]> {
    return Promise.resolve([...mockJobs]);
  },
  getMyDownloads(): Promise<ApiDownloadItem[]> {
    return Promise.resolve([...mockDownloads]);
  },
  listFonts(params: { page?: number; limit?: number } = {}): Promise<ApiFontFileItem[]> {
    return Promise.resolve(pageItems(mockFonts, params.page, params.limit));
  },
  getFont(fontId: number | string): Promise<ApiFontFileItem> {
    return Promise.resolve(findFont(fontId));
  },
  downloadGeneratedFont(fontId: number | string): Promise<ApiDownloadResponse> {
    return Promise.resolve({ file_url: findGeneratedFont(fontId).file_url });
  },
  downloadGenerationJob(jobId: number | string): Promise<ApiDownloadResponse> {
    const status = mockStatuses[Number(jobId)];
    return Promise.resolve({
      file_url: status?.generated_font_url ?? mockGeneratedFonts[0].file_url,
    });
  },
  tagFont(): Promise<{ message: string }> {
    return Promise.resolve({ message: 'mock tagged' });
  },
  listGeneratedFonts(params: { page?: number; limit?: number } = {}): Promise<ApiGeneratedFontItem[]> {
    return Promise.resolve(pageItems(mockGeneratedFonts, params.page, params.limit));
  },
  getGeneratedFont(fontId: number | string): Promise<ApiGeneratedFontItem> {
    return Promise.resolve(findGeneratedFont(fontId));
  },
  rateGeneratedFont(_fontId: number | string, payload: ApiRateRequest): Promise<ApiRateResponse> {
    return Promise.resolve({
      rating_id: Date.now(),
      score: payload.score,
      comment: payload.comment ?? null,
    });
  },
  listGeneratedFontRatings(fontId: number | string): Promise<ApiRatingItem[]> {
    const numericId = Number(fontId);
    return Promise.resolve(mockRatings.filter((rating) => rating.generated_font_id === numericId));
  },
  createGoogleGeneration(_fontFileId: number): Promise<ApiGenerationCreateResponse> {
    return Promise.resolve({
      job_id: 7001,
      status: 'RETRAINING',
      requested_at: now,
    });
  },
  createHandwritingGeneration(): Promise<ApiGenerationCreateResponse> {
    return Promise.resolve({
      job_id: 7003,
      status: 'QUEUED',
      requested_at: now,
    });
  },
  getGenerationStatus(jobId: number | string): Promise<ApiGenerationStatus> {
    return Promise.resolve(mockStatuses[Number(jobId)] ?? mockStatuses[7001]);
  },
  uploadHandwriting(): Promise<HandwritingUploadResponse> {
    return Promise.resolve({
      handwriting_id: 8101,
      image_url: '/images/mock/handwriting-upload.png',
      submitted_at: now,
    });
  },
};
