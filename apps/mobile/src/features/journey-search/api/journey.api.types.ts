interface JourneyStationApiDto {
  stationCode: string;
  stationName: string;
}

interface JourneyPlatformGapApiDto {
  distanceCm: number;
  level: "green" | "yellow" | "red";
  label: string;
}

interface JourneyStepApiDto {
  order: number;
  type: string;
  stationName: string;
  instruction: string;
  evidence: string;
  platformGap: JourneyPlatformGapApiDto | null;
}

interface JourneyFacilityGroupApiDto {
  id: string;
  label: string;
  status: "operational" | "out_of_service" | "unknown";
}

interface JourneyRouteApiDto {
  id: string;
  label: string;
  status: "operational" | "out_of_service" | "unknown";
  recommended: boolean;
  transferStation: string | null;
  blockingReasons: string[];
  facilityGroups: JourneyFacilityGroupApiDto[];
  steps: JourneyStepApiDto[];
}

export interface JourneyPlanApiDto {
  journeyId: string;
  origin: JourneyStationApiDto;
  destination: JourneyStationApiDto;
  dataVersion: string;
  verifiedAt: string;
  recommendedRouteId: string | null;
  selectionReason: string;
  statusCheckedAt: string;
  maxSourceDelayMinutes: number;
  notice: string;
  candidates: JourneyRouteApiDto[];
}

interface JourneyContractErrorApiDto {
  code: string;
  category: string;
  message: string;
  retryable: boolean;
  details: Record<string, string | number | boolean | null>;
}

interface JourneyContractMetaApiDto {
  contractVersion: string;
  requestId: string;
  generatedAt: string;
  dataVersion: string | null;
}

export type JourneyPlanResultApiDto =
  | {
      ok: true;
      data: JourneyPlanApiDto;
      warnings: JourneyContractErrorApiDto[];
      meta: JourneyContractMetaApiDto;
    }
  | {
      ok: false;
      error: JourneyContractErrorApiDto;
      meta: JourneyContractMetaApiDto;
    };
