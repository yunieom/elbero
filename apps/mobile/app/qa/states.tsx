import { Redirect } from 'expo-router';

import { ExceptionStateQaScreen } from '@/features/journey-search';

export default function ExceptionStateQaRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <ExceptionStateQaScreen />;
}
