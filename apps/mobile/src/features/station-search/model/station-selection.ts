export interface SelectableStation {
  id: string;
  stationKey: string;
  stationName: string;
  lineId: string;
  lineName: string;
  journeySupported: boolean;
}

export type StationPickerMode = 'search' | 'map';

export const supportedJourneyLineNames = [
  '2호선',
  '3호선',
  '4호선',
  '5호선',
  '7호선',
] as const;

export function filterSelectableStations<T extends SelectableStation>(
  stations: readonly T[],
  mode: StationPickerMode,
  query: string,
  selectedLineId: string,
) {
  if (mode === 'map') {
    return stations.filter((station) => station.lineId === selectedLineId);
  }

  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  return stations.filter((station) =>
    normalizeSearchText(`${station.stationName} ${station.lineName}`).includes(
      normalizedQuery,
    ),
  );
}

export function groupLineIdsByStationKey<T extends SelectableStation>(
  stations: readonly T[],
): Map<string, Array<T['lineId']>> {
  const result = new Map<string, Array<T['lineId']>>();
  for (const station of stations) {
    const lineIds = result.get(station.stationKey) ?? [];
    if (!lineIds.includes(station.lineId)) lineIds.push(station.lineId);
    result.set(station.stationKey, lineIds);
  }
  return result;
}

export function stationSelectionError(
  origin: SelectableStation | null,
  destination: SelectableStation | null,
) {
  if (!origin || !destination) {
    return '출발역과 도착역을 모두 선택해 주세요.';
  }
  if (origin.stationKey === destination.stationKey) {
    return '출발역과 도착역은 서로 달라야 합니다.';
  }
  if (!origin.journeySupported || !destination.journeySupported) {
    return `선택한 노선의 엘리베이터 안전 경로는 준비 중입니다. 현재 ${supportedJourneyLineNames.join('·')} 경로를 안내할 수 있어요.`;
  }
  return null;
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase('ko');
}
