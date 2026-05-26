import { apiRequest } from './client';
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
    return apiRequest<DevLoginResponse>('/auth/signup', { method: 'POST', body: payload });
  },
  login(payload: LoginRequest) {
    return apiRequest<DevLoginResponse>('/auth/login', { method: 'POST', body: payload });
  },
  devLogin() {
    return apiRequest<DevLoginResponse>('/auth/dev-login', {
      method: 'POST',
      body: { user_id: 'dev-user-001', email: 'dev@example.com', nickname: 'Dev User' },
    });
  },
  getMe() {
    return apiRequest<ApiMeResponse>('/users/me');
  },
  updateMe(payload: ApiMeUpdateRequest) {
    return apiRequest<ApiMeUpdateResponse>('/users/me', { method: 'PATCH', body: payload });
  },
  getMyRatings() {
    return apiRequest<ApiRatingItem[]>('/users/me/ratings');
  },
  getMyGenerations() {
    return apiRequest<ApiGenerationJobItem[]>('/users/me/generations');
  },
  getMyDownloads() {
    return apiRequest<ApiDownloadItem[]>('/users/me/downloads');
  },
  listFonts(params: { page?: number; limit?: number } = {}) {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 100),
    });
    return apiRequest<ApiFontFileItem[]>(`/fonts?${search.toString()}`);
  },
  getFont(fontId: number | string) {
    return apiRequest<ApiFontFileItem>(`/fonts/${fontId}`);
  },
  downloadGeneratedFont(fontId: number | string) {
    return apiRequest<ApiDownloadResponse>(`/fonts/${fontId}/download`, { method: 'POST' });
  },
  downloadGenerationJob(jobId: number | string) {
    return apiRequest<ApiDownloadResponse>(`/jobs/${jobId}/download`, { method: 'POST' });
  },
  tagFont(fontId: number | string) {
    return apiRequest<{ message: string }>(`/fonts/${fontId}/tag`, { method: 'POST' });
  },
  listGeneratedFonts(params: { page?: number; limit?: number } = {}) {
    const search = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    });
    return apiRequest<ApiGeneratedFontItem[]>(`/generated_fonts?${search.toString()}`);
  },
  getGeneratedFont(fontId: number | string) {
    return apiRequest<ApiGeneratedFontItem>(`/generated_fonts/${fontId}`);
  },
  rateGeneratedFont(fontId: number | string, payload: ApiRateRequest) {
    return apiRequest<ApiRateResponse>(`/generated_fonts/${fontId}/rate`, {
      method: 'POST',
      body: payload,
    });
  },
  listGeneratedFontRatings(fontId: number | string) {
    return apiRequest<ApiRatingItem[]>(`/generated_fonts/${fontId}/rate`);
  },
  createGoogleGeneration(fontFileId: number) {
    return apiRequest<ApiGenerationCreateResponse>('/generations/google', {
      method: 'POST',
      body: { font_file_id: fontFileId },
      timeoutMs: 0,
    });
  },
  createHandwritingGeneration(handwritingId: number) {
    return apiRequest<ApiGenerationCreateResponse>('/generations/handwriting', {
      method: 'POST',
      body: { handwriting_id: handwritingId },
      timeoutMs: 0,
    });
  },
  getGenerationStatus(jobId: number | string) {
    return apiRequest<ApiGenerationStatus>(`/generations/${jobId}`);
  },
  uploadHandwriting(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return apiRequest<HandwritingUploadResponse>('/handwriting/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
