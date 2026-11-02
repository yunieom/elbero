import assert from "node:assert/strict";
import test from "node:test";

import {
  createStoredJourneySnapshot,
  decideStoredJourneyRecovery,
  parseStoredJourneySnapshot,
} from "./journey-snapshot.ts";

const now = "2026-10-01T01:00:00.000Z";
const journey = {
  journeyId: "journey-1",
  originName: "답십리",
  destinationName: "굽은다리",
  dataVersion: "line-5-v1",
  verifiedAt: "2026-09-30",
  selectionReason: "검증된 경로",
  statusCheckedAt: now,
  maxSourceDelayMinutes: 60,
  notice: "상태 정보는 지연될 수 있습니다.",
  warnings: [],
  route: {
    id: "route-1",
    label: "5호선",
    status: "operational",
    isRecommended: true,
    transferStation: null,
    blockingReasons: [],
    facilityGroups: [],
    steps: [
      {
        id: "step-1",
        order: 1,
        type: "entry",
        stationName: "답십리",
        instruction: "진입",
        stationAccess: null,
        platformGap: null,
        trainSegment: null,
      },
      {
        id: "step-2",
        order: 2,
        type: "train",
        stationName: "답십리",
        instruction: "이동",
        stationAccess: null,
        platformGap: null,
        trainSegment: null,
      },
    ],
    summary: {
      lineNames: ["5호선"],
      directions: ["하남검단산행"],
      transferCount: 0,
      elevatorCount: 2,
    },
    trainSegments: [],
    validationIssues: [],
  },
};

function makeSnapshot() {
  return createStoredJourneySnapshot({
    journey,
    originStationCode: "2543",
    destinationStationCode: "2551",
    now,
  });
}

test("snapshot에 전체 여정과 저장 시각을 기록하고 복구한다", () => {
  const snapshot = makeSnapshot();
  const parsed = parseStoredJourneySnapshot(JSON.stringify(snapshot));
  assert.equal(parsed?.journey.originName, "답십리");
  assert.equal(parsed?.currentStepOrder, 1);
  assert.equal(parsed?.savedAt, now);
});

test("손상 snapshot은 복구하지 않는다", () => {
  assert.equal(parseStoredJourneySnapshot("{broken"), null);
  assert.equal(
    parseStoredJourneySnapshot(JSON.stringify({ savedAt: now })),
    null,
  );
});

test("만료된 snapshot은 오프라인에서 안내만 허용하고 상태는 신뢰하지 않는다", () => {
  const decision = decideStoredJourneyRecovery({
    snapshot: makeSnapshot(),
    isOnline: false,
    now: "2026-10-01T02:00:01.000Z",
  });
  assert.equal(decision.action, "resume_offline_limited");
  assert.equal(decision.canShowStoredDirections, true);
  assert.equal(decision.canTrustStoredFacilityStatus, false);
});

test("데이터 버전이 바뀌면 온라인에서 새로 조회한다", () => {
  const decision = decideStoredJourneyRecovery({
    snapshot: makeSnapshot(),
    isOnline: true,
    currentDataVersion: "line-5-v2",
    now: "2026-10-01T01:10:00.000Z",
  });
  assert.equal(decision.action, "refresh_then_resume");
  assert.equal(decision.canTrustStoredFacilityStatus, false);
});
