import * as Clipboard from "expo-clipboard";
import { Linking } from "react-native";

import type { JourneyReportMail } from "../model/journey-report";
import { deliverJourneyReportWith } from "./journey-report-delivery-core";

export async function deliverJourneyReport(
  mail: JourneyReportMail,
): Promise<"mail_opened" | "copied"> {
  return deliverJourneyReportWith(mail, {
    canOpenUrl: (url) => Linking.canOpenURL(url),
    openUrl: (url) => Linking.openURL(url),
    copyText: async (value) => {
      await Clipboard.setStringAsync(value);
    },
  });
}
