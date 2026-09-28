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
