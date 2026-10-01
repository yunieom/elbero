import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  parseStoredJourneySnapshot,
  type StoredJourneySnapshot,
} from "../model/journey-snapshot";

export const JOURNEY_SNAPSHOT_STORAGE_KEY = "elbero.current-journey.v1";

export interface JourneySnapshotReadResult {
  snapshot: StoredJourneySnapshot | null;
  discardedCorrupted: boolean;
  storageUnavailable: boolean;
}

export const journeySnapshotRepository = {
  async read(): Promise<JourneySnapshotReadResult> {
    let raw: string | null;
    try {
      raw = await AsyncStorage.getItem(JOURNEY_SNAPSHOT_STORAGE_KEY);
    } catch {
      return {
        snapshot: null,
        discardedCorrupted: false,
        storageUnavailable: true,
      };
    }
    if (raw === null) {
      return {
        snapshot: null,
        discardedCorrupted: false,
        storageUnavailable: false,
      };
    }
    const snapshot = parseStoredJourneySnapshot(raw);
    if (!snapshot) {
      try {
        await AsyncStorage.removeItem(JOURNEY_SNAPSHOT_STORAGE_KEY);
      } catch {
        return {
          snapshot: null,
          discardedCorrupted: false,
          storageUnavailable: true,
        };
      }
      return {
        snapshot: null,
        discardedCorrupted: true,
        storageUnavailable: false,
      };
    }
    return {
      snapshot,
      discardedCorrupted: false,
      storageUnavailable: false,
    };
  },

  async write(snapshot: StoredJourneySnapshot): Promise<void> {
    await AsyncStorage.setItem(
      JOURNEY_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  },

  async remove(): Promise<void> {
    await AsyncStorage.removeItem(JOURNEY_SNAPSHOT_STORAGE_KEY);
  },
};
