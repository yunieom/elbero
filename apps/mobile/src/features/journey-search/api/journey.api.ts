import { apiBaseUrl } from "@/shared/config/api-base-url";

import type {
  JourneyPlanApiDto,
  JourneyPlanResultApiDto,
} from "./journey.api.types";

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
    headers: { accept: "application/json" },
    signal,
  });
  const result = (await response
    .json()
    .catch(() => null)) as JourneyPlanResultApiDto | null;
  if (!response.ok || !result || !result.ok) {
    throw new Error(
      result && !result.ok
        ? result.error.message
        : "안전 경로를 불러오지 못했습니다.",
    );
  }
  return result.data;
}
