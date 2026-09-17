export const ELEVATOR_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_SERVICE: 'out_of_service',
  UNKNOWN: 'unknown',
} as const;

export type ElevatorStatus =
  (typeof ELEVATOR_STATUS)[keyof typeof ELEVATOR_STATUS];

export interface SeoulElevatorFacilityRow {
  STN_CD: string;
  STN_NM: string;
  ELVTR_NM: string;
  OPR_SEC: string;
  INSTL_PSTN: string;
  USE_YN: string;
  ELVTR_SE: string;
}

export interface SeoulElevatorStatusSnapshot {
  checkedAt: string;
  expiresAt: number;
  rows: SeoulElevatorFacilityRow[];
}
