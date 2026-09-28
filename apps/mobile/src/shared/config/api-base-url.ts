const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const apiBaseUrl = (configuredApiUrl || 'http://127.0.0.1:3000').replace(
  /\/$/,
  '',
);
