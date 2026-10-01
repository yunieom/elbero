import assert from "node:assert/strict";
import test from "node:test";

import { deliverJourneyReportWith } from "./journey-report-delivery-core.ts";

const mail = {
  mailtoUrl: "mailto:report@example.com?subject=test",
  clipboardText: "받는 사람과 제보 내용",
};

test("메일 앱을 사용할 수 있으면 작성 화면을 연다", async () => {
  const opened = [];
  const copied = [];
  const result = await deliverJourneyReportWith(mail, {
    canOpenUrl: async () => true,
    openUrl: async (url) => opened.push(url),
    copyText: async (value) => copied.push(value),
  });

  assert.equal(result, "mail_opened");
  assert.deepEqual(opened, [mail.mailtoUrl]);
  assert.deepEqual(copied, []);
});

test("메일 앱이 없으면 받는 주소와 내용을 복사한다", async () => {
  const copied = [];
  const result = await deliverJourneyReportWith(mail, {
    canOpenUrl: async () => false,
    openUrl: async () => assert.fail("메일 앱을 열면 안 됩니다."),
    copyText: async (value) => copied.push(value),
  });

  assert.equal(result, "copied");
  assert.deepEqual(copied, [mail.clipboardText]);
});

test("메일 앱 열기에서 오류가 나도 복사 대안으로 이어진다", async () => {
  const copied = [];
  const result = await deliverJourneyReportWith(mail, {
    canOpenUrl: async () => true,
    openUrl: async () => {
      throw new Error("no mail app");
    },
    copyText: async (value) => copied.push(value),
  });

  assert.equal(result, "copied");
  assert.deepEqual(copied, [mail.clipboardText]);
});
