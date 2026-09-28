import { apiBaseUrl } from '@/shared/config/api-base-url';

import type { Station } from '@/entities/station';

export async function fetchLine5Stations(signal?: AbortSignal): Promise<Station[]> {
  const response = await fetch(`${apiBaseUrl}/journeys/line-5/stations`, {
    headers: { accept: 'application/json' },
    signal,
  });
  if (!response.ok) {
    throw new Error('역 목록을 불러오지 못했습니다.');
  }
  return (await response.json()) as Station[];
}
