import { apiBaseUrl } from '@/shared/config/api-base-url';

import type { JourneyPlanApiDto } from './journey.api.types';

export async function fetchJourneyPlan(
  originStationCode: string,
  destinationStationCode: string,
  signal?: AbortSignal,
): Promise<JourneyPlanApiDto> {
  const query = new URLSearchParams({
    originStationCode,
    destinationStationCode,
  });
  const response = await fetch(`${apiBaseUrl}/journeys/plan?${query}`, {
    headers: { accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(errorBody?.message || '안전 경로를 불러오지 못했습니다.');
  }
  return (await response.json()) as JourneyPlanApiDto;
}
