import { useEffect, useState } from 'react';
import type { ResourceStatus } from '@/types/domain';

interface ResourceState<T> { data: T; error: string | null; status: ResourceStatus; isLoading: boolean; isEmpty: boolean; refetch: () => void; }

export function useResourceState<T>(loader: () => Promise<T>, emptyValue: T, isEmpty: (data: T) => boolean): ResourceState<T> {
  const [data, setData] = useState<T>(emptyValue);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ResourceStatus>('idle');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'loading');
    setError(null);
    loader()
      .then((next) => {
        if (!active) return;
        setData(next);
        setStatus(isEmpty(next) ? 'empty' : 'success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro inesperado');
        setStatus('error');
      });
    return () => { active = false; };
  }, [loader, isEmpty, version]);

  return { data, error, status, isLoading: status === 'loading', isEmpty: status === 'empty', refetch: () => setVersion((v) => v + 1) };
}
