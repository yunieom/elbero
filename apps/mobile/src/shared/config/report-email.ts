const configuredReportEmail = process.env.EXPO_PUBLIC_REPORT_EMAIL?.trim();

export const reportEmail = configuredReportEmail || "";
