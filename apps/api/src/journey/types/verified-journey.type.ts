import type { ElevatorStatus } from '../../elevator-status/types/seoul-elevator-status.type.js';
import type { PlatformGapInfo } from '../platform-gap.js';

export const JOURNEY_STEP_TYPE = {
  ENTRY: 'entry',
  GATE: 'gate',
  ELEVATOR: 'elevator',
  TRAIN: 'train',
  TRANSFER: 'transfer',
  EXIT: 'exit',
} as const;

export type JourneyStepType =
  (typeof JOURNEY_STEP_TYPE)[keyof typeof JOURNEY_STEP_TYPE];

export const STATION_ACCESS_PHASE = {
  ENTRY: 'entry',
  EXIT: 'exit',
} as const;

export type StationAccessPhase =
  (typeof STATION_ACCESS_PHASE)[keyof typeof STATION_ACCESS_PHASE];

export const STATION_ACCESS_KIND = {
  SURFACE_ELEVATOR: 'surface_elevator',
  GATE: 'gate',
  PLATFORM_ELEVATOR: 'platform_elevator',
} as const;

export type StationAccessKind =
  (typeof STATION_ACCESS_KIND)[keyof typeof STATION_ACCESS_KIND];

export interface StationAccessDetail {
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

export interface VerifiedFacilityRef {
  id: string;
  stationCode: string;
  stationName: string;
  role: string;
  sourceFacilityName: string | null;
  expectedOperatingSection: string | null;
  expectedLocation: string | null;
}

export interface FacilityRequirementGroup {
  id: string;
  label: string;
  policy: 'all' | 'any';
  facilities: VerifiedFacilityRef[];
}

export interface VerifiedJourneyStep {
  order: number;
  type: JourneyStepType;
  stationName: string;
  instruction: string;
  facilityGroupId?: string;
  evidence: string;
  stationAccess?: StationAccessDetail;
  platformGap?: PlatformGapInfo;
  trainSegment?: VerifiedTrainSegment;
}

export interface JourneyDoorPosition {
  carNumber: number;
  doorNumber: number;
}

export interface VerifiedTrainSegment {
  lineName: string;
  direction: string;
  originStationName: string;
  destinationStationName: string;
  boardingPosition: JourneyDoorPosition | null;
  alightingPosition: JourneyDoorPosition | null;
  positionBasis: 'destination_elevator' | 'unverified';
}

export interface VerifiedRouteCandidate {
  id: string;
  label: string;
  priority: number;
  transferStation: string | null;
  lines: string[];
  facilityGroups: FacilityRequirementGroup[];
  steps: VerifiedJourneyStep[];
}

export interface VerifiedJourneyDefinition {
  id: string;
  originStationCode: string;
  originStationName: string;
  destinationStationCode: string;
  destinationStationName: string;
  dataVersion: string;
  verifiedAt: string;
  candidates: VerifiedRouteCandidate[];
}

export interface EvaluatedFacility {
  id: string;
  stationCode: string;
  stationName: string;
  role: string;
  status: ElevatorStatus;
  sourceStatus: string | null;
  sourceFacilityName: string | null;
  matchStatus: 'verified' | 'unmatched';
}

export interface EvaluatedFacilityGroup {
  id: string;
  label: string;
  policy: 'all' | 'any';
  status: ElevatorStatus;
  facilities: EvaluatedFacility[];
}
