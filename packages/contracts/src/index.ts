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
