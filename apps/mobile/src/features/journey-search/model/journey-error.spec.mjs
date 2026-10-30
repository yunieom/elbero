import assert from "node:assert/strict";
import test from "node:test";

import { presentJourneyError } from "./journey-error.ts";

function contractError(code, retryable = false) {
  return {
    kind: "contract",
    message: code,
    contractError: { code, retryable, message: code },
  };
}

test("미지원·데이터 누락·상태 미확인 오류를 서로 다르게 안내한다", () => {
  assert.equal(
    presentJourneyError(contractError("UNSUPPORTED_JOURNEY")).title,
    "아직 지원하지 않는 여정이에요",
  );
  assert.equal(
    presentJourneyError(contractError("DATA_MISSING")).title,
    "엘리베이터 경로 정보가 부족해요",
  );
  assert.equal(
    presentJourneyError(contractError("FACILITY_STATUS_UNKNOWN", true)).title,
    "승강기 상태를 확인할 수 없어요",
  );
});

test("운행 중지로 엘리베이터 경로가 없으면 대체 경로 재탐색을 제안한다", () => {
  const presentation = presentJourneyError(
    contractError("NO_ACCESSIBLE_ROUTE"),
  );
  assert.equal(presentation.action, "retry");
  assert.equal(presentation.actionLabel, "대체 경로 다시 찾기");
});

test("네트워크 오류는 저장 여정 존재 여부를 설명한다", () => {
  const presentation = presentJourneyError({
    kind: "network",
    message: "offline",
    contractError: null,
  });
  assert.match(presentation.description, /저장된 여정/);
});
