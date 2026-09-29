export type JourneyStatus = "operational" | "out_of_service" | "unknown";
export type PlatformGapLevel = "green" | "yellow" | "red";

export interface JourneyPlatformGap {
  distanceCm: number;
  level: PlatformGapLevel;
  label: string;
}

export interface JourneyStep {
  id: string;
  order: number;
  type: string;
  stationName: string;
  instruction: string;
  platformGap: JourneyPlatformGap | null;
}

export interface JourneyFacilityGroup {
  id: string;
  label: string;
  status: JourneyStatus;
}

export interface JourneyRoute {
  id: string;
  label: string;
  status: JourneyStatus;
  isRecommended: boolean;
  transferStation: string | null;
  blockingReasons: string[];
  facilityGroups: JourneyFacilityGroup[];
  steps: JourneyStep[];
  summary: JourneySummary;
  trainSegments: JourneyTrainSegment[];
  validationIssues: string[];
}

export interface JourneyDoorPosition {
  carNumber: number;
  doorNumber: number;
}

export interface JourneyTrainSegment {
  order: number;
  lineName: string;
  direction: string;
  originStationName: string;
  destinationStationName: string;
  boardingPosition: JourneyDoorPosition | null;
  alightingPosition: JourneyDoorPosition | null;
  positionBasis: "destination_elevator" | "unverified";
  platformGap: JourneyPlatformGap | null;
}

export interface JourneySummary {
  lineNames: string[];
  directions: string[];
  transferCount: number;
  elevatorCount: number;
}

export interface JourneyPlan {
  journeyId: string;
  originName: string;
  destinationName: string;
  dataVersion: string;
  verifiedAt: string;
  selectionReason: string;
  statusCheckedAt: string;
  maxSourceDelayMinutes: number;
  notice: string;
  route: JourneyRoute;
}
