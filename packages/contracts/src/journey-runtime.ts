export const JOURNEY_CONTRACT_VERSION = '1.0' as const;
export const JOURNEY_SNAPSHOT_SCHEMA_VERSION = 1 as const;

export const JOURNEY_ERROR_CODE = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNSUPPORTED_JOURNEY: 'UNSUPPORTED_JOURNEY',
  SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',
  SOURCE_TIMEOUT: 'SOURCE_TIMEOUT',
  DATA_MISSING: 'DATA_MISSING',
  DATA_CONFLICT: 'DATA_CONFLICT',
  FACILITY_STATUS_UNKNOWN: 'FACILITY_STATUS_UNKNOWN',
  NO_ACCESSIBLE_ROUTE: 'NO_ACCESSIBLE_ROUTE',
  DATA_VERSION_UNSUPPORTED: 'DATA_VERSION_UNSUPPORTED',
  SNAPSHOT_CORRUPTED: 'SNAPSHOT_CORRUPTED',
  SNAPSHOT_EXPIRED: 'SNAPSHOT_EXPIRED',
} as const;

export type JourneyErrorCode =
  (typeof JOURNEY_ERROR_CODE)[keyof typeof JOURNEY_ERROR_CODE];

export type JourneyErrorCategory =
  | 'invalid_request'
  | 'unsupported'
  | 'source_failure'
  | 'incomplete_data'
  | 'unavailable_status'
  | 'no_route'
  | 'version'
  | 'storage';

export interface JourneyContractMeta {
  contractVersion: string;
  requestId: string;
  generatedAt: string;
  dataVersion: string | null;
}

export interface JourneyContractError {
  code: JourneyErrorCode;
  category: JourneyErrorCategory;
  message: string;
  retryable: boolean;
  details: Record<string, string | number | boolean | null>;
}

export type JourneyContractResult<T> =
  | {
      ok: true;
      data: T;
      warnings: JourneyContractError[];
      meta: JourneyContractMeta;
    }
  | {
      ok: false;
      error: JourneyContractError;
      meta: JourneyContractMeta;
    };

export interface JourneyErrorPolicy {
  category: JourneyErrorCategory;
  retryable: boolean;
  httpStatus: 400 | 409 | 422 | 503;
  mobileFallback:
    | 'fix_request'
    | 'show_unsupported'
    | 'retry'
    | 'show_incomplete'
    | 'show_unknown_status'
    | 'show_no_safe_route'
    | 'refresh_data'
    | 'discard_snapshot';
}

export const JOURNEY_ERROR_POLICY: Record<JourneyErrorCode, JourneyErrorPolicy> = {
  INVALID_REQUEST: {
    category: 'invalid_request',
    retryable: false,
    httpStatus: 400,
    mobileFallback: 'fix_request',
  },
  UNSUPPORTED_JOURNEY: {
    category: 'unsupported',
    retryable: false,
    httpStatus: 422,
    mobileFallback: 'show_unsupported',
  },
  SOURCE_UNAVAILABLE: {
    category: 'source_failure',
    retryable: true,
    httpStatus: 503,
    mobileFallback: 'retry',
  },
  SOURCE_TIMEOUT: {
    category: 'source_failure',
    retryable: true,
    httpStatus: 503,
    mobileFallback: 'retry',
  },
  DATA_MISSING: {
    category: 'incomplete_data',
    retryable: false,
    httpStatus: 422,
    mobileFallback: 'show_incomplete',
  },
  DATA_CONFLICT: {
    category: 'incomplete_data',
    retryable: false,
    httpStatus: 409,
    mobileFallback: 'show_incomplete',
  },
  FACILITY_STATUS_UNKNOWN: {
    category: 'unavailable_status',
    retryable: true,
    httpStatus: 503,
    mobileFallback: 'show_unknown_status',
  },
  NO_ACCESSIBLE_ROUTE: {
    category: 'no_route',
    retryable: false,
    httpStatus: 422,
    mobileFallback: 'show_no_safe_route',
  },
  DATA_VERSION_UNSUPPORTED: {
    category: 'version',
    retryable: true,
    httpStatus: 409,
    mobileFallback: 'refresh_data',
  },
  SNAPSHOT_CORRUPTED: {
    category: 'storage',
    retryable: false,
    httpStatus: 409,
    mobileFallback: 'discard_snapshot',
  },
  SNAPSHOT_EXPIRED: {
    category: 'storage',
    retryable: true,
    httpStatus: 409,
    mobileFallback: 'refresh_data',
  },
};

export type JourneySnapshotFacilityStatus =
  | 'operational'
  | 'out_of_service'
  | 'unknown';

export interface JourneySnapshotStep {
  id: string;
  order: number;
  type: string;
  stationName: string;
  instruction: string;
}

export interface JourneySnapshotPayload {
  originName: string;
  destinationName: string;
  route: {
    id: string;
    label: string;
    facilityStatus: JourneySnapshotFacilityStatus;
    steps: JourneySnapshotStep[];
  };
}

export interface JourneySnapshot {
  snapshotSchemaVersion: number;
  contractVersion: string;
  snapshotId: string;
  savedAt: string;
  expiresAt: string;
  journeyId: string;
  originStationCode: string;
  destinationStationCode: string;
  selectedRouteId: string;
  currentStepOrder: number;
  dataVersion: string;
  statusCheckedAt: string;
  payload: JourneySnapshotPayload;
}

export const JOURNEY_RECOVERY_ACTION = {
  RESUME_FRESH: 'resume_fresh',
  RESUME_OFFLINE_LIMITED: 'resume_offline_limited',
  REFRESH_THEN_RESUME: 'refresh_then_resume',
  DISCARD: 'discard',
} as const;

export type JourneyRecoveryAction =
  (typeof JOURNEY_RECOVERY_ACTION)[keyof typeof JOURNEY_RECOVERY_ACTION];

export type JourneyRecoveryReason =
  | 'compatible'
  | 'offline_stale'
  | 'snapshot_stale'
  | 'schema_incompatible'
  | 'contract_incompatible'
  | 'snapshot_corrupted';

export interface JourneyRecoveryContext {
  isOnline: boolean;
  isSnapshotValid: boolean;
  now: string;
  currentContractVersion: string;
  currentSnapshotSchemaVersion: number;
  currentDataVersion: string | null;
}

export interface JourneyRecoveryDecision {
  action: JourneyRecoveryAction;
  reason: JourneyRecoveryReason;
  canShowStoredDirections: boolean;
  canTrustStoredFacilityStatus: boolean;
}

function majorVersion(version: string): string | null {
  const match = /^(\d+)\./.exec(version);
  return match?.[1] ?? null;
}

export function decideJourneySnapshotRecovery(
  snapshot: JourneySnapshot,
  context: JourneyRecoveryContext,
): JourneyRecoveryDecision {
  const expiresAt = Date.parse(snapshot.expiresAt);
  const now = Date.parse(context.now);
  const snapshotMajor = majorVersion(snapshot.contractVersion);
  const currentMajor = majorVersion(context.currentContractVersion);

  if (
    !context.isSnapshotValid ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(now)
  ) {
    return {
      action: JOURNEY_RECOVERY_ACTION.DISCARD,
      reason: 'snapshot_corrupted',
      canShowStoredDirections: false,
      canTrustStoredFacilityStatus: false,
    };
  }

  if (
    snapshot.snapshotSchemaVersion !== context.currentSnapshotSchemaVersion
  ) {
    return {
      action: JOURNEY_RECOVERY_ACTION.DISCARD,
      reason: 'schema_incompatible',
      canShowStoredDirections: false,
      canTrustStoredFacilityStatus: false,
    };
  }

  if (
    snapshotMajor === null ||
    currentMajor === null ||
    snapshotMajor !== currentMajor
  ) {
    return {
      action: JOURNEY_RECOVERY_ACTION.DISCARD,
      reason: 'contract_incompatible',
      canShowStoredDirections: false,
      canTrustStoredFacilityStatus: false,
    };
  }

  const isExpired = expiresAt <= now;
  const hasDataVersionChanged =
    context.currentDataVersion !== null &&
    context.currentDataVersion !== snapshot.dataVersion;

  if (isExpired || hasDataVersionChanged) {
    if (context.isOnline) {
      return {
        action: JOURNEY_RECOVERY_ACTION.REFRESH_THEN_RESUME,
        reason: 'snapshot_stale',
        canShowStoredDirections: true,
        canTrustStoredFacilityStatus: false,
      };
    }

    return {
      action: JOURNEY_RECOVERY_ACTION.RESUME_OFFLINE_LIMITED,
      reason: 'offline_stale',
      canShowStoredDirections: true,
      canTrustStoredFacilityStatus: false,
    };
  }

  return {
    action: JOURNEY_RECOVERY_ACTION.RESUME_FRESH,
    reason: 'compatible',
    canShowStoredDirections: true,
    canTrustStoredFacilityStatus: true,
  };
}
