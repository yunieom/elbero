import { apiBaseUrl } from "@/shared/config/api-base-url";

import type {
  JourneyContractErrorApiDto,
  JourneyContractMetaApiDto,
  JourneyPlanApiDto,
  JourneyPlanResultApiDto,
} from "./journey.api.types";

export interface JourneyPlanResponse {
  data: JourneyPlanApiDto;
  warnings: JourneyContractErrorApiDto[];
  meta: JourneyContractMetaApiDto;
}

export class JourneyApiError extends Error {
  constructor(
    message: string,
    readonly kind: "contract" | "network" | "invalid_response",
    readonly contractError: JourneyContractErrorApiDto | null = null,
    readonly meta: JourneyContractMetaApiDto | null = null,
  ) {
    super(message);
    this.name = "JourneyApiError";
  }
}

export async function fetchJourneyPlan(
  originStationCode: string,
  destinationStationCode: string,
  signal?: AbortSignal,
): Promise<JourneyPlanResponse> {
  const query = new URLSearchParams({
    originStationCode,
    destinationStationCode,
  });
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/journeys/plan?${query}`, {
      headers: { accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new JourneyApiError("네트워크에 연결할 수 없습니다.", "network");
  }
  const result = (await response
    .json()
    .catch(() => null)) as JourneyPlanResultApiDto | null;
  if (!result) {
    throw new JourneyApiError(
      "서버 응답을 확인할 수 없습니다.",
      "invalid_response",
    );
  }
  if (!response.ok || !result.ok) {
    if (!result.ok) {
      throw new JourneyApiError(
        result.error.message,
        "contract",
        result.error,
        result.meta,
      );
    }
    throw new JourneyApiError(
      "안전 경로를 불러오지 못했습니다.",
      "invalid_response",
    );
  }
  return result;
}
