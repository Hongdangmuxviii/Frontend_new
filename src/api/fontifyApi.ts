import { apiRequest, USE_MOCKS } from './client';
import { mockFontifyApi } from './mockApi';
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

type SignupRequest = {
  google_id_token: string;
};

type LoginRequest = {
  google_id_token: string;
};

type HandwritingUploadResponse = {
  handwriting_id: number;
  image_url: string;
  submitted_at?: string;
};

export const fontifyApi = {
  signup(payload: SignupRequest) {
    if (USE_MOCKS) return mockFontifyApi.signup();
    return apiRequest<DevLoginResponse>('/auth/signup', { method: 'POST', body: payload });
  },
  login(payload: LoginRequest) {
    if (USE_MOCKS) return mockFontifyApi.login();
    return apiRequest<DevLoginResponse>('/auth/login', { method: 'POST', body: payload });
  },
  devLogin() {
    if (USE_MOCKS) return mockFontifyApi.devLogin();
    return apiRequest<DevLoginResponse>('/auth/dev-login', {
      method: 'POST',
      body: { user_id: 'dev-user-001', email: 'dev@example.com', nickname: 'Dev User' },
    });
  },
  getMe() {
    if (USE_MOCKS) return mockFontifyApi.getMe();
    return apiRequest<ApiMeResponse>('/users/me');
  },
  updateMe(payload: ApiMeUpdateRequest) {
    if (USE_MOCKS) return mockFontifyApi.updateMe(payload);
    return apiRequest<ApiMeUpdateResponse>('/users/me', { method: 'PATCH', body: payload });
  },
  getMyRatings() {
    if (USE_MOCKS) return mockFontifyApi.getMyRatings();
    return apiRequest<ApiRatingItem[]>('/users/me/ratings');
  },
  getMyGenerations() {
    if (USE_MOCKS) return mockFontifyApi.getMyGenerations();
    return apiRequest<ApiGenerationJobItem[]>('/users/me/generations');
  },
  getMyDownloads() {
    if (USE_MOCKS) return mockFontifyApi.getMyDownloads();
    return apiRequest<ApiDownloadItem[]>('/users/me/downloads');
  },
  listFonts(params: { page?: number; limit?: number } = {}) {
    if (USE_MOCKS) return mockFontifyApi.listFonts(params);
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 100),
    });
    return apiRequest<ApiFontFileItem[]>(`/fonts?${search.toString()}`);
  },
  getFont(fontId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.getFont(fontId);
    return apiRequest<ApiFontFileItem>(`/fonts/${fontId}`);
  },
  downloadGeneratedFont(fontId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.downloadGeneratedFont(fontId);
    return apiRequest<ApiDownloadResponse>(`/fonts/${fontId}/download`, { method: 'POST' });
  },
  downloadGenerationJob(jobId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.downloadGenerationJob(jobId);
    return apiRequest<ApiDownloadResponse>(`/generations/jobs/${jobId}/download`, { method: 'POST' });
  },
  tagFont(fontId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.tagFont();
    return apiRequest<{ message: string }>(`/fonts/${fontId}/tag`, { method: 'POST' });
  },
  listGeneratedFonts(params: { page?: number; limit?: number } = {}) {
    if (USE_MOCKS) return mockFontifyApi.listGeneratedFonts(params);
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    return apiRequest<ApiGeneratedFontItem[]>(`/generated_fonts?${search.toString()}`);
  },
  getGeneratedFont(fontId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.getGeneratedFont(fontId);
    return apiRequest<ApiGeneratedFontItem>(`/generated_fonts/${fontId}`);
  },
  rateGeneratedFont(fontId: number | string, payload: ApiRateRequest) {
    if (USE_MOCKS) return mockFontifyApi.rateGeneratedFont(fontId, payload);
    return apiRequest<ApiRateResponse>(`/generated_fonts/${fontId}/rate`, {
      method: 'POST',
      body: payload,
    });
  },
  listGeneratedFontRatings(fontId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.listGeneratedFontRatings(fontId);
    return apiRequest<ApiRatingItem[]>(`/generated_fonts/${fontId}/rate`);
  },
  createGoogleGeneration(fontFileId: number) {
    if (USE_MOCKS) return mockFontifyApi.createGoogleGeneration(fontFileId);
    return apiRequest<ApiGenerationCreateResponse>('/generations/google', {
      method: 'POST',
      body: { font_file_id: fontFileId },
      timeoutMs: 0,
    });
  },
  createHandwritingGeneration(handwritingId: number) {
    if (USE_MOCKS) return mockFontifyApi.createHandwritingGeneration();
    return apiRequest<ApiGenerationCreateResponse>('/generations/handwriting', {
      method: 'POST',
      body: { handwriting_id: handwritingId },
      timeoutMs: 0,
    });
  },
  getGenerationStatus(jobId: number | string) {
    if (USE_MOCKS) return mockFontifyApi.getGenerationStatus(jobId);
    return apiRequest<ApiGenerationStatus>(`/generations/${jobId}`);
  },
  uploadHandwriting(image: File) {
    if (USE_MOCKS) return mockFontifyApi.uploadHandwriting();
    const formData = new FormData();
    formData.append('image', image);
    return apiRequest<HandwritingUploadResponse>('/handwriting/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
