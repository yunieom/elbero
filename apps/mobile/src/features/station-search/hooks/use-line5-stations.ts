import { useEffect, useState } from 'react';

import { fetchLine5Stations } from '../api/stations.api';
import type { Station } from '@/entities/station';

export function useLine5Stations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);
    fetchLine5Stations(controller.signal)
      .then(setStations)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setErrorMessage(
          error instanceof Error ? error.message : '역 목록을 불러오지 못했습니다.',
        );
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [requestKey]);

  return {
    stations,
    isLoading,
    errorMessage,
    retry: () => setRequestKey((current) => current + 1),
  };
}
