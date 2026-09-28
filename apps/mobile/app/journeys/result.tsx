import { useLocalSearchParams } from 'expo-router';

import { JourneyResultScreen } from '@/features/journey-search';

export default function JourneyResultRoute() {
  const { originStationCode, destinationStationCode } = useLocalSearchParams<{
    originStationCode?: string;
    destinationStationCode?: string;
  }>();

  return (
    <JourneyResultScreen
      destinationStationCode={destinationStationCode ?? ''}
      originStationCode={originStationCode ?? ''}
    />
  );
}
