import type { JourneyReportMail } from "../model/journey-report";

export type JourneyReportDeliveryResult = "mail_opened" | "copied";

export interface JourneyReportDeliveryDependencies {
  canOpenUrl: (url: string) => Promise<boolean>;
  openUrl: (url: string) => Promise<void>;
  copyText: (value: string) => Promise<void>;
}

export async function deliverJourneyReportWith(
  mail: JourneyReportMail,
  dependencies: JourneyReportDeliveryDependencies,
): Promise<JourneyReportDeliveryResult> {
  if (mail.mailtoUrl) {
    try {
      const canOpenMail = await dependencies.canOpenUrl(mail.mailtoUrl);
      if (canOpenMail) {
        await dependencies.openUrl(mail.mailtoUrl);
        return "mail_opened";
      }
    } catch {
      // 메일 앱을 열 수 없으면 동일한 내용을 복사하는 안전한 대안으로 이어진다.
    }
  }

  await dependencies.copyText(mail.clipboardText);
  return "copied";
}
