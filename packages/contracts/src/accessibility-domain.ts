export type AccessibilityEntityId = string;

export type SourceSystem = "kric" | "seoul_metro" | "manual_verification";

export type MappingStatus = "mapped" | "partial" | "unmapped";

export type VerificationStatus = "verified" | "unverified" | "conflict";

export interface SourceEvidence {
  sourceSystem: SourceSystem;
  dataset: string;
  rawRecordKey: string | null;
  collectedAt: string | null;
  observedAt: string | null;
  verificationStatus: VerificationStatus;
}

export interface RailLine {
  id: AccessibilityEntityId;
  operatorCode: string;
  sourceLineCode: string;
  name: string;
  evidence: SourceEvidence[];
}

export interface Station {
  id: AccessibilityEntityId;
  name: string;
  aliases: string[];
  evidence: SourceEvidence[];
}

export interface StationLine {
  id: AccessibilityEntityId;
  stationId: AccessibilityEntityId;
  lineId: AccessibilityEntityId;
  sourceStationCode: string;
  sequence: number | null;
  previousStationLineId: AccessibilityEntityId | null;
  nextStationLineId: AccessibilityEntityId | null;
  evidence: SourceEvidence[];
}

export interface PlatformDirection {
  previousStationLineId: AccessibilityEntityId | null;
  nextStationLineId: AccessibilityEntityId | null;
  terminalStationLineId: AccessibilityEntityId | null;
  sourceUpDownCode: string | null;
  displayLabel: string;
}

export interface Platform {
  id: AccessibilityEntityId;
  stationLineId: AccessibilityEntityId;
  sourcePlatformNumber: string;
  floor: string | null;
  direction: PlatformDirection;
  evidence: SourceEvidence[];
}

export type PlaceType =
  | "surface_exit"
  | "concourse"
  | "fare_gate"
  | "platform"
  | "transfer_area"
  | "other";

export interface Place {
  id: AccessibilityEntityId;
  stationLineId: AccessibilityEntityId;
  type: PlaceType;
  name: string;
  floor: string | null;
  exitNumber: string | null;
  platformId: AccessibilityEntityId | null;
  evidence: SourceEvidence[];
}

export type AccessibilityFacilityType = "elevator";

export interface AccessibilityFacility {
  id: AccessibilityEntityId;
  stationLineId: AccessibilityEntityId;
  type: AccessibilityFacilityType;
  name: string;
  operatingSection: string | null;
  locationDescription: string | null;
  servedPlaceIds: AccessibilityEntityId[];
  evidence: SourceEvidence[];
}

export interface VehicleDoorPosition {
  carNumber: number;
  doorNumber: number;
}

export interface PlatformBoardingPoint {
  id: AccessibilityEntityId;
  platformId: AccessibilityEntityId;
  position: VehicleDoorPosition;
  adjacentFacilityIds: AccessibilityEntityId[];
  gapDistanceCm: number | null;
  recommended: boolean;
  evidence: SourceEvidence[];
}

export interface PathDirectionCondition {
  incomingStationLineId: AccessibilityEntityId | null;
  outgoingStationLineId: AccessibilityEntityId | null;
  terminalStationLineId: AccessibilityEntityId | null;
  sourcePreviousStationCode: string | null;
  sourceNextStationCode: string | null;
}

export type AccessiblePathType = "entry" | "exit" | "transfer";

export interface AccessiblePath {
  id: AccessibilityEntityId;
  stationLineId: AccessibilityEntityId;
  type: AccessiblePathType;
  sourcePathManagementNumber: string;
  fromPlaceId: AccessibilityEntityId | null;
  toPlaceId: AccessibilityEntityId | null;
  directionCondition: PathDirectionCondition;
  segmentIds: AccessibilityEntityId[];
  evidence: SourceEvidence[];
}

export interface PathSegment {
  id: AccessibilityEntityId;
  pathId: AccessibilityEntityId;
  order: number;
  fromPlaceId: AccessibilityEntityId | null;
  toPlaceId: AccessibilityEntityId | null;
  facilityId: AccessibilityEntityId | null;
  instruction: string;
  rawInstruction: string;
  mappingStatus: MappingStatus;
  evidence: SourceEvidence[];
}

export type FacilityOperatingStatus =
  "operational" | "out_of_service" | "unknown";

export interface FacilityStatusObservation {
  id: AccessibilityEntityId;
  facilityId: AccessibilityEntityId;
  status: FacilityOperatingStatus;
  sourceStatus: string | null;
  observedAt: string | null;
  collectedAt: string;
  expiresAt: string | null;
  evidence: SourceEvidence[];
}

export interface UnmappedSourceRecord {
  id: AccessibilityEntityId;
  sourceSystem: SourceSystem;
  dataset: string;
  rawRecordKey: string | null;
  fieldNames: string[];
  reason: string;
  collectedAt: string | null;
}

export interface AccessibilityDataPackage {
  schemaVersion: number;
  dataVersion: string;
  generatedAt: string;
  lines: RailLine[];
  stations: Station[];
  stationLines: StationLine[];
  platforms: Platform[];
  places: Place[];
  facilities: AccessibilityFacility[];
  boardingPoints: PlatformBoardingPoint[];
  paths: AccessiblePath[];
  pathSegments: PathSegment[];
  statusObservations: FacilityStatusObservation[];
  unmappedSourceRecords: UnmappedSourceRecord[];
}
