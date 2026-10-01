import type { JourneyPlan, JourneyStep } from "@/entities/journey";

export const journeyReportTypes = [
  { value: "wrong_route", label: "잘못된 이동 동선" },
  { value: "wrong_facility", label: "잘못된 시설 정보" },
  { value: "facility_status", label: "승강기 상태 오류" },
  { value: "platform_gap", label: "승강장 간격 오류" },
  { value: "other", label: "기타" },
] as const;

export type JourneyReportType = (typeof journeyReportTypes)[number]["value"];

export interface JourneyReportDraft {
  recipient: string;
  type: JourneyReportType;
  description: string;
  journey: JourneyPlan;
  step: JourneyStep;
}

export interface JourneyReportMail {
  recipient: string;
  subject: string;
  body: string;
  mailtoUrl: string | null;
  clipboardText: string;
}

export function buildJourneyReportMail(
  draft: JourneyReportDraft,
): JourneyReportMail {
  const reportType =
    journeyReportTypes.find((item) => item.value === draft.type)?.label ??
    "기타";
  const facilityIds = draft.step.stationAccess?.facilityIds ?? [];
  const subject = `[엘베로 오류 제보] ${draft.step.stationName} · ${reportType}`;
  const body = [
    "아래 안내 정보의 확인을 요청합니다.",
    "",
    `[오류 유형] ${reportType}`,
    `[사용자 설명] ${draft.description.trim()}`,
    "",
    "[재현 정보]",
    `여정: ${draft.journey.originName} → ${draft.journey.destinationName}`,
    `여정 ID: ${draft.journey.journeyId}`,
    `데이터 버전: ${draft.journey.dataVersion}`,
    `경로 ID: ${draft.journey.route.id}`,
    `단계: ${draft.step.order} · ${draft.step.type}`,
    `역: ${draft.step.stationName}`,
    `안내: ${draft.step.instruction}`,
    `시설 ID: ${facilityIds.length > 0 ? facilityIds.join(", ") : "없음"}`,
    "",
    "※ 현재 위치나 이동 이력은 포함되지 않았습니다.",
  ].join("\n");
  const recipient = draft.recipient.trim();
  const mailtoUrl = recipient
    ? `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null;
  const clipboardText = [
    `받는 사람: ${recipient || "미설정"}`,
    `제목: ${subject}`,
    "",
    body,
  ].join("\n");

  return { recipient, subject, body, mailtoUrl, clipboardText };
}
