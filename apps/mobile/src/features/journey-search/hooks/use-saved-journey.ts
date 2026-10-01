import { useCallback, useEffect, useState } from "react";

import { decideStoredJourneyRecovery } from "../model/journey-snapshot";
import { journeySnapshotRepository } from "../repository/journey-snapshot.repository";

export interface SavedJourneyPreview {
  originStationCode: string;
  destinationStationCode: string;
  originName: string;
  destinationName: string;
  currentStepOrder: number;
  savedAt: string;
  isStatusStale: boolean;
}

export function useSavedJourney() {
  const [savedJourney, setSavedJourney] = useState<SavedJourneyPreview | null>(
    null,
  );
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await journeySnapshotRepository.read();
    if (result.storageUnavailable) {
      setRecoveryMessage(
        "저장 공간을 사용할 수 없어 이전 여정을 복구하지 못했습니다.",
      );
      setSavedJourney(null);
      return;
    }
    if (result.discardedCorrupted) {
      setRecoveryMessage("손상된 저장 여정을 삭제했습니다.");
      setSavedJourney(null);
      return;
    }
    if (!result.snapshot) {
      setSavedJourney(null);
      return;
    }
    const decision = decideStoredJourneyRecovery({
      snapshot: result.snapshot,
      isOnline: false,
    });
    if (!decision.canShowStoredDirections) {
      try {
        await journeySnapshotRepository.remove();
        setRecoveryMessage("현재 앱과 호환되지 않는 저장 여정을 삭제했습니다.");
      } catch {
        setRecoveryMessage("호환되지 않는 저장 여정을 삭제하지 못했습니다.");
      }
      setSavedJourney(null);
      return;
    }
    setSavedJourney({
      originStationCode: result.snapshot.originStationCode,
      destinationStationCode: result.snapshot.destinationStationCode,
      originName: result.snapshot.journey.originName,
      destinationName: result.snapshot.journey.destinationName,
      currentStepOrder: result.snapshot.currentStepOrder,
      savedAt: result.snapshot.savedAt,
      isStatusStale: !decision.canTrustStoredFacilityStatus,
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { savedJourney, recoveryMessage, refresh };
}
