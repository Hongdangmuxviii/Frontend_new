export type WorkPhase =
  | 'queued'
  | 'analyzing'
  | 'preview_ready'
  | 'retraining'
  | 'finalizing'
  | 'completed'
  | 'failed';

export type WorkTimelineState = 'done' | 'active' | 'waiting' | 'failed';

export type WorkTimelineLog = {
  id: string;
  time: string;
  title: string;
  detail: string;
  state: WorkTimelineState;
};

export type WorkItem = {
  id: string;
  title: string;
  updatedAt: string;
  progressPercent: number;
  phase: WorkPhase;
  statusLabel: string;
  failReason?: string | null;
  queueLabel?: string;
  sample: string;
  previewLetters?: string[];
  previewImageUrls?: string[];
  downloadUrl?: string;
  generatedFontId?: number | null;
  sourceFontId?: number | null;
  sourceFontName?: string;
  logs: WorkTimelineLog[];
};
