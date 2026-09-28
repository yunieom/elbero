import { useEffect, useState } from 'react';

import type { JourneyPlan } from '@/entities/journey';

import { fetchJourneyPlan } from '../api/journey.api';
import { toJourneyPlan } from '../model/journey.mapper';

export function useJourneyPlan(
  originStationCode: string,
  destinationStationCode: string,
) {
  const [journey, setJourney] = useState<JourneyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);
    fetchJourneyPlan(originStationCode, destinationStationCode, controller.signal)
      .then(toJourneyPlan)
      .then(setJourney)
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : '안전 경로를 불러오지 못했습니다.',
        );
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [destinationStationCode, originStationCode, requestKey]);

  return {
    journey,
    isLoading,
    errorMessage,
    retry: () => setRequestKey((current) => current + 1),
  };
}
