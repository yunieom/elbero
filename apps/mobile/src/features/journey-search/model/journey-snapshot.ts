import {
  decideJourneySnapshotRecovery,
  JOURNEY_CONTRACT_VERSION,
  JOURNEY_SNAPSHOT_SCHEMA_VERSION,
  type JourneyRecoveryDecision,
  type JourneySnapshot,
} from "@elbero/contracts";

import type { JourneyPlan } from "@/entities/journey";

export const JOURNEY_SNAPSHOT_MAX_AGE_MS = 60 * 60 * 1000;

export interface StoredJourneySnapshot extends JourneySnapshot {
  journey: JourneyPlan;
}

export function createStoredJourneySnapshot(input: {
  journey: JourneyPlan;
  originStationCode: string;
  destinationStationCode: string;
  currentStepOrder: number;
  now?: string;
}): StoredJourneySnapshot {
  const savedAt = input.now ?? new Date().toISOString();
  const expiresAt = new Date(
    Date.parse(savedAt) + JOURNEY_SNAPSHOT_MAX_AGE_MS,
  ).toISOString();
  const route = input.journey.route;
  return {
    snapshotSchemaVersion: JOURNEY_SNAPSHOT_SCHEMA_VERSION,
    contractVersion: JOURNEY_CONTRACT_VERSION,
    snapshotId: `${input.journey.journeyId}:${savedAt}`,
    savedAt,
    expiresAt,
    journeyId: input.journey.journeyId,
    originStationCode: input.originStationCode,
    destinationStationCode: input.destinationStationCode,
    selectedRouteId: route.id,
    currentStepOrder: input.currentStepOrder,
    dataVersion: input.journey.dataVersion,
    statusCheckedAt: input.journey.statusCheckedAt,
    payload: {
      originName: input.journey.originName,
      destinationName: input.journey.destinationName,
      route: {
        id: route.id,
        label: route.label,
        facilityStatus: route.status,
        steps: route.steps.map((step) => ({
          id: step.id,
          order: step.order,
          type: step.type,
          stationName: step.stationName,
          instruction: step.instruction,
        })),
      },
    },
    journey: input.journey,
  };
}

export function updateStoredJourneyStep(
  snapshot: StoredJourneySnapshot,
  currentStepOrder: number,
  now = new Date().toISOString(),
): StoredJourneySnapshot {
  return {
    ...snapshot,
    currentStepOrder,
    savedAt: now,
  };
}

export function parseStoredJourneySnapshot(
  value: string,
): StoredJourneySnapshot | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return isStoredJourneySnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function decideStoredJourneyRecovery(input: {
  snapshot: StoredJourneySnapshot;
  isOnline: boolean;
  currentDataVersion?: string | null;
  now?: string;
}): JourneyRecoveryDecision {
  return decideJourneySnapshotRecovery(input.snapshot, {
    isOnline: input.isOnline,
    isSnapshotValid: isStoredJourneySnapshot(input.snapshot),
    now: input.now ?? new Date().toISOString(),
    currentContractVersion: JOURNEY_CONTRACT_VERSION,
    currentSnapshotSchemaVersion: JOURNEY_SNAPSHOT_SCHEMA_VERSION,
    currentDataVersion: input.currentDataVersion ?? null,
  });
}

function isStoredJourneySnapshot(
  value: unknown,
): value is StoredJourneySnapshot {
  if (!isRecord(value) || !isRecord(value.journey)) return false;
  const journey = value.journey;
  if (!isRecord(journey.route) || !Array.isArray(journey.route.steps)) {
    return false;
  }
  return (
    typeof value.snapshotSchemaVersion === "number" &&
    typeof value.contractVersion === "string" &&
    typeof value.snapshotId === "string" &&
    isIsoDate(value.savedAt) &&
    isIsoDate(value.expiresAt) &&
    typeof value.journeyId === "string" &&
    typeof value.originStationCode === "string" &&
    typeof value.destinationStationCode === "string" &&
    typeof value.selectedRouteId === "string" &&
    typeof value.currentStepOrder === "number" &&
    typeof value.dataVersion === "string" &&
    isIsoDate(value.statusCheckedAt) &&
    typeof journey.journeyId === "string" &&
    typeof journey.originName === "string" &&
    typeof journey.destinationName === "string" &&
    journey.route.steps.length > 0
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDate(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
