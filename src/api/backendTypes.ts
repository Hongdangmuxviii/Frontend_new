export type ApiMeResponse = {
  user_id: string;
  email: string;
  nickname: string;
  created_at: string;
};

export type ApiMeUpdateRequest = {
  nickname: string;
};

export type ApiMeUpdateResponse = {
  user_id: string;
  nickname: string;
  updated_at: string;
};

export type ApiRatingItem = {
  rating_id: number;
  generated_font_id: number;
  font_name: string;
  score: number;
  comment: string | null;
  rated_at: string;
};

export type ApiGenerationJobItem = {
  job_id: number;
  status: string;
  progress: number;
  similarity_percent: number | null;
  requested_at: string;
  finished_at: string | null;
  font_name: string;
};

export type ApiGenerationStatus = {
  job_id: number;
  status: string;
  progress: number;
  similarity_percent: number | null;
  fail_reason: string | null;
  preview_image_urls: string[];
  generated_font_id: number | null;
  generated_font_url: string | null;
};

export type ApiGenerationCreateResponse = {
  job_id: number;
  status: string;
  requested_at: string;
};

export type ApiDownloadItem = {
  download_id: number;
  font_id: number | null;
  generated_font_id: number | null;
  font_name: string;
  file_url: string;
  downloaded_at: string;
};

export type ApiFontFileItem = {
  font_file_id: number;
  font_family_id?: number | null;
  name?: string | null;
  weight?: number | null;
  style?: string | null;
  file_url?: string | null;
  file_path?: string | null;
};

export type ApiGeneratedFontItem = {
  generated_font_id: number;
  name?: string | null;
  file_url: string;
};

export type ApiDownloadResponse = {
  file_url: string;
};

export type ApiRateRequest = {
  score: number;
  comment?: string | null;
};

export type ApiRateResponse = {
  rating_id: number;
  score: number;
  comment: string | null;
};
