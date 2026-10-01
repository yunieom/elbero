import assert from "node:assert/strict";
import test from "node:test";

import { buildJourneyReportMail } from "./journey-report.ts";

const journey = {
  journeyId: "journey-2543-2551",
  originName: "답십리",
  destinationName: "굽은다리",
  dataVersion: "line-5-v1",
  route: { id: "route-5-main" },
};

const step = {
  order: 3,
  type: "elevator",
  stationName: "굽은다리",
  instruction: "1번 출구 쪽 지상 엘리베이터를 이용하세요.",
  stationAccess: { facilityIds: ["EL-2551-01"] },
};

test("메일에 재현 가능한 여정·단계·시설 정보를 포함한다", () => {
  const mail = buildJourneyReportMail({
    recipient: "report@example.com",
    type: "wrong_facility",
    description: "실제로는 2번 출구 쪽입니다.",
    journey,
    step,
  });

  assert.match(mail.body, /journey-2543-2551/);
  assert.match(mail.body, /line-5-v1/);
  assert.match(mail.body, /단계: 3/);
  assert.match(mail.body, /EL-2551-01/);
  assert.match(mail.mailtoUrl, /^mailto:report@example\.com/);
});

test("시설 ID가 없는 단계도 명시적으로 기록한다", () => {
  const mail = buildJourneyReportMail({
    recipient: "report@example.com",
    type: "wrong_route",
    description: "동선이 반대입니다.",
    journey,
    step: { ...step, stationAccess: null },
  });
  assert.match(mail.body, /시설 ID: 없음/);
});

test("메일 주소가 없으면 복사용 내용은 만들고 mailto는 만들지 않는다", () => {
  const mail = buildJourneyReportMail({
    recipient: "",
    type: "other",
    description: "확인이 필요합니다.",
    journey,
    step,
  });
  assert.equal(mail.mailtoUrl, null);
  assert.match(mail.clipboardText, /받는 사람: 미설정/);
});

test("제보에는 위치 좌표나 위치 이력을 추가하지 않는다", () => {
  const mail = buildJourneyReportMail({
    recipient: "report@example.com",
    type: "wrong_route",
    description: "확인이 필요합니다.",
    journey,
    step,
  });
  assert.doesNotMatch(mail.body, /latitude|longitude|GPS|위도|경도/u);
  assert.match(mail.body, /현재 위치나 이동 이력은 포함되지 않았습니다/);
});
