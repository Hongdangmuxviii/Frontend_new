const STORAGE_KEY = 'fontify-generation-jobs';

export type StoredGenerationJob = {
  jobId: number;
  fontFileId: number;
  fontName: string;
  requestedAt: string;
};

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredGenerationJobs(): StoredGenerationJob[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredGenerationJob[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveStoredGenerationJob(job: StoredGenerationJob) {
  if (!canUseStorage()) return;

  const current = getStoredGenerationJobs();
  const next = [job, ...current.filter((item) => item.jobId !== job.jobId)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeStoredGenerationJob(jobId: number) {
  if (!canUseStorage()) return;
  const next = getStoredGenerationJobs().filter((item) => item.jobId !== jobId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
