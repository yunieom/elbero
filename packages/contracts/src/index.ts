export type ElevatorOperatingStatus =
  | 'operational'
  | 'out_of_service'
  | 'unknown';

export interface HealthResponse {
  status: 'ok';
  service: 'elbero-api';
}

export interface ElevatorStatus {
  facilityId: string;
  status: ElevatorOperatingStatus;
  observedAt: string | null;
  source: string;
}

export type {
  AccessibilityDataPackage,
  AccessibilityEntityId,
  AccessibilityFacility,
  AccessibilityFacilityType,
  AccessiblePath,
  AccessiblePathType,
  FacilityOperatingStatus,
  FacilityStatusObservation,
  MappingStatus,
  PathDirectionCondition,
  PathSegment,
  Place,
  PlaceType,
  Platform,
  PlatformBoardingPoint,
  PlatformDirection,
  RailLine,
  SourceEvidence,
  SourceSystem,
  Station,
  StationLine,
  UnmappedSourceRecord,
  VehicleDoorPosition,
  VerificationStatus,
} from './accessibility-domain.js';

export {
  decideJourneySnapshotRecovery,
  JOURNEY_CONTRACT_VERSION,
  JOURNEY_ERROR_CODE,
  JOURNEY_ERROR_POLICY,
  JOURNEY_RECOVERY_ACTION,
  JOURNEY_SNAPSHOT_SCHEMA_VERSION,
} from './journey-runtime.js';

export type {
  JourneyContractError,
  JourneyContractMeta,
  JourneyContractResult,
  JourneyErrorCategory,
  JourneyErrorCode,
  JourneyErrorPolicy,
  JourneyRecoveryAction,
  JourneyRecoveryContext,
  JourneyRecoveryDecision,
  JourneyRecoveryReason,
  JourneySnapshot,
  JourneySnapshotFacilityStatus,
  JourneySnapshotPayload,
  JourneySnapshotStep,
} from './journey-runtime.js';
