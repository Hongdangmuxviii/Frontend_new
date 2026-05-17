type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
  timeoutMs?: number;
};

type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | boolean | undefined> & {
    DEV?: boolean;
  };
};

const env = (import.meta as ImportMetaWithEnv).env ?? {};
const rawApiBaseUrl =
  typeof env.VITE_API_BASE_URL === 'string' ? env.VITE_API_BASE_URL : undefined;
const fallbackApiBaseUrl = env.DEV ? '/api/v1' : 'http://localhost:8000/api/v1';
const rawProxyTarget =
  typeof env.VITE_API_PROXY_TARGET === 'string' ? env.VITE_API_PROXY_TARGET : undefined;

export const API_BASE_URL =
  (rawApiBaseUrl ?? fallbackApiBaseUrl).replace(/\/$/, '');

export const API_ASSET_ORIGIN = (() => {
  if (rawProxyTarget) {
    return rawProxyTarget.replace(/\/$/, '');
  }

  if (rawApiBaseUrl && /^https?:\/\//.test(rawApiBaseUrl)) {
    return new URL(rawApiBaseUrl).origin;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:8000';
})();

const DEV_USER_ID = env.VITE_DEV_USER_ID ?? 'dev-user-001';
const API_REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveApiAssetUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ASSET_ORIGIN}${normalizedPath}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const body = options.body;
  const timeoutMs = options.timeoutMs ?? API_REQUEST_TIMEOUT_MS;
  const controller = options.signal ? null : new AbortController();
  const signal = options.signal ?? controller?.signal;
  const timeoutId =
    timeoutMs > 0 && controller
      ? window.setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

  if (!(body instanceof FormData) && body != null && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  if (!headers.has('x-user-id')) {
    headers.set('x-user-id', DEV_USER_ID);
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers,
      signal,
      body:
        body instanceof FormData || typeof body === 'string' || body == null
          ? body
          : JSON.stringify(body),
    });
    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(response.statusText || 'API request failed', response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('API response timed out.');
    }
    throw error;
  } finally {
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
    }
  }
}
