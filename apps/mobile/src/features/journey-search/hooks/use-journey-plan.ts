import { useEffect, useState } from "react";

import type { JourneyPlan } from "@/entities/journey";

import { fetchJourneyPlan, JourneyApiError } from "../api/journey.api";
import {
  createStoredJourneySnapshot,
  decideStoredJourneyRecovery,
  type StoredJourneySnapshot,
} from "../model/journey-snapshot";
import { toJourneyPlan } from "../model/journey.mapper";
import { journeySnapshotRepository } from "../repository/journey-snapshot.repository";

export type JourneyRecoveryMode = "live" | "stored" | "offline" | "stale";

export function useJourneyPlan(
  originStationCode: string,
  destinationStationCode: string,
) {
  const [journey, setJourney] = useState<JourneyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<JourneyApiError | null>(null);
  const [requestKey, setRequestKey] = useState(0);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<JourneyRecoveryMode>("live");
  const [storageNotice, setStorageNotice] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadJourney() {
      setIsLoading(true);
      setJourney(null);
      setError(null);
      setStorageNotice(null);
      setSavedAt(null);
      setRecoveryMode("live");
      let matchingSnapshot: StoredJourneySnapshot | null = null;

      const stored = await journeySnapshotRepository.read();
      if (!active) return;
      if (stored.storageUnavailable) {
        setStorageNotice(
          "저장 공간을 사용할 수 없어 이번 여정은 자동 복구되지 않습니다.",
        );
      }
      if (stored.discardedCorrupted) {
        setStorageNotice("손상된 저장 여정을 삭제하고 새 경로를 조회합니다.");
      }
      if (
        stored.snapshot?.originStationCode === originStationCode &&
        stored.snapshot.destinationStationCode === destinationStationCode
      ) {
        const decision = decideStoredJourneyRecovery({
          snapshot: stored.snapshot,
          isOnline: false,
        });
        if (decision.canShowStoredDirections) {
          matchingSnapshot = stored.snapshot;
          setJourney(stored.snapshot.journey);
          setSavedAt(stored.snapshot.savedAt);
          setRecoveryMode(
            decision.canTrustStoredFacilityStatus ? "stored" : "stale",
          );
        } else {
          try {
            await journeySnapshotRepository.remove();
            setStorageNotice(
              "현재 앱과 호환되지 않는 저장 여정을 삭제했습니다.",
            );
          } catch {
            setStorageNotice("호환되지 않는 저장 여정을 삭제하지 못했습니다.");
          }
        }
      }

      try {
        const response = await fetchJourneyPlan(
          originStationCode,
          destinationStationCode,
          controller.signal,
        );
        if (!active) return;
        const freshJourney = toJourneyPlan(response.data, response.warnings);
        const nextSnapshot = createStoredJourneySnapshot({
          journey: freshJourney,
          originStationCode,
          destinationStationCode,
        });
        let saved = true;
        try {
          await journeySnapshotRepository.write(nextSnapshot);
        } catch {
          saved = false;
          setStorageNotice(
            "경로는 표시하지만 저장 공간 오류로 자동 복구용 저장은 하지 못했습니다.",
          );
        }
        if (!active) return;
        setJourney(freshJourney);
        setSavedAt(saved ? nextSnapshot.savedAt : null);
        setRecoveryMode("live");
      } catch (caught: unknown) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        if (!active) return;
        const apiError =
          caught instanceof JourneyApiError
            ? caught
            : new JourneyApiError(
                caught instanceof Error
                  ? caught.message
                  : "엘리베이터 경로를 불러오지 못했습니다.",
                "invalid_response",
              );
        if (apiError.kind === "network" && matchingSnapshot) {
          setJourney(matchingSnapshot.journey);
          setRecoveryMode("offline");
          setError(null);
        } else {
          setJourney(null);
          setError(apiError);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadJourney();
    return () => {
      active = false;
      controller.abort();
    };
  }, [destinationStationCode, originStationCode, requestKey]);

  return {
    journey,
    isLoading,
    error,
    savedAt,
    recoveryMode,
    storageNotice,
    retry: () => setRequestKey((current) => current + 1),
  };
}
