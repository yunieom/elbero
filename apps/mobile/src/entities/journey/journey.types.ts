export type JourneyStatus = "operational" | "out_of_service" | "unknown";
export type PlatformGapLevel = "green" | "yellow" | "red";

export interface JourneyPlatformGap {
  distanceCm: number;
  level: PlatformGapLevel;
  label: string;
}

export type StationAccessPhase = "entry" | "exit";
export type StationAccessKind =
  "surface_elevator" | "gate" | "platform_elevator";

export interface JourneyStationAccess {
  phase: StationAccessPhase;
  kind: StationAccessKind;
  location: string | null;
  fromFloor: string | null;
  toFloor: string | null;
  direction: string | null;
  facilityIds: string[];
  source: string;
  verifiedAt: string;
}

export interface JourneyStep {
  id: string;
  order: number;
  type: string;
  stationName: string;
  instruction: string;
  stationAccess: JourneyStationAccess | null;
  platformGap: JourneyPlatformGap | null;
  trainSegment: JourneyStepTrainSegment | null;
}

export interface JourneyStepTrainSegment {
  lineName: string;
  direction: string;
  originStationName: string;
  destinationStationName: string;
  boardingPosition: JourneyDoorPosition | null;
  alightingPosition: JourneyDoorPosition | null;
  positionBasis: "destination_elevator" | "unverified";
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
