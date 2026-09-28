export type JourneyStatus = 'operational' | 'out_of_service' | 'unknown';
export type PlatformGapLevel = 'green' | 'yellow' | 'red';

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
  evidence: string;
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
