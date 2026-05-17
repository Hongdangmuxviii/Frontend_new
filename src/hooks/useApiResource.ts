import { useEffect, useState } from 'react';

type ApiResourceState<T> = {
  data: T;
  isLoading: boolean;
  error: string;
};

const resourceDataCache = new Map<string, unknown>();
const resourceErrorCache = new Map<string, string>();
const resourceInflightCache = new Map<string, Promise<unknown>>();

export function useApiResource<T>(
  fallbackData: T,
  loader: () => Promise<T>,
  dependencies: unknown[] = [],
) {
  const resourceKey = JSON.stringify(dependencies);
  const [state, setState] = useState<ApiResourceState<T>>({
    data: resourceDataCache.has(resourceKey)
      ? (resourceDataCache.get(resourceKey) as T)
      : fallbackData,
    isLoading:
      !resourceDataCache.has(resourceKey) &&
      !resourceErrorCache.has(resourceKey),
    error: resourceErrorCache.get(resourceKey) ?? '',
  });

  useEffect(() => {
    let isMounted = true;

    if (resourceDataCache.has(resourceKey)) {
      setState({
        data: resourceDataCache.get(resourceKey) as T,
        isLoading: false,
        error: resourceErrorCache.get(resourceKey) ?? '',
      });
      return () => {
        isMounted = false;
      };
    }

    setState((current) => ({
      data: current.data,
      isLoading: true,
      error: '',
    }));

    const inflightRequest =
      resourceInflightCache.get(resourceKey) ??
      loader().then((data) => {
        resourceDataCache.set(resourceKey, data);
        resourceErrorCache.delete(resourceKey);
        resourceInflightCache.delete(resourceKey);
        return data;
      });

    resourceInflightCache.set(resourceKey, inflightRequest);

    inflightRequest
      .then((data) => {
        if (!isMounted) return;
        setState({ data: data as T, isLoading: false, error: '' });
      })
      .catch((error: unknown) => {
        resourceInflightCache.delete(resourceKey);
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : 'API request failed.';
        resourceErrorCache.set(resourceKey, message);
        setState({ data: fallbackData, isLoading: false, error: message });
      });

    return () => {
      isMounted = false;
    };
    // loader and fallbackData are intentionally controlled by the caller's dependency key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey]);

  return state;
}
