import { reportEmail } from './report-email';

const configuredOperatorName =
  process.env.EXPO_PUBLIC_OPERATOR_NAME?.trim() || '';

export const serviceInfo = {
  appName: '엘베로',
  appVersion: '1.0.0',
  operatorName: configuredOperatorName || '엘베로 운영자',
  supportEmail: reportEmail,
  policyEffectiveDate: '2026-10-30',
} as const;
