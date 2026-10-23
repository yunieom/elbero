import assert from 'node:assert/strict';
import test from 'node:test';

import { stationCatalog } from '../../../entities/station/station-catalog.generated.ts';
import {
  filterSelectableStations,
  groupLineIdsByStationKey,
  stationSelectionError,
} from './station-selection.ts';

test('검색과 노선도는 같은 역 식별자를 선택한다', () => {
  const searchResult = filterSelectableStations(
    stationCatalog,
    'search',
    '학동',
    '7',
  ).find((station) => station.id === '7:2733');
  const mapResult = filterSelectableStations(
    stationCatalog,
    'map',
    '',
    '7',
  ).find((station) => station.id === '7:2733');

  assert.equal(searchResult?.id, '7:2733');
  assert.equal(mapResult?.id, searchResult?.id);
  assert.equal(mapResult?.stationKey, searchResult?.stationKey);
});

test('동명이역은 노선과 역 식별자로 구분한다', () => {
  const results = filterSelectableStations(
    stationCatalog,
    'search',
    '신촌',
    '2',
  );

  assert.deepEqual(
    results.map((station) => [station.lineName, station.stationKey]),
    [
      ['2호선', '2:0240'],
      ['경의중앙선', 'gyeongui-jungang:P314'],
    ],
  );
});

test('환승역은 같은 역 키에 여러 노선을 연결한다', () => {
  const linesByStationKey = groupLineIdsByStationKey(stationCatalog);

  assert.deepEqual(linesByStationKey.get('transfer:고속터미널'), [
    '3',
    '7',
    '9',
  ]);
});

test('선택 오류와 미지원 상태를 구분한다', () => {
  const line5 = stationCatalog.find((station) => station.id === '5:2543');
  const samePhysicalStation = stationCatalog.find(
    (station) =>
      station.stationKey === 'transfer:군자' && station.lineId === '7',
  );
  const samePhysicalStationOtherLine = stationCatalog.find(
    (station) =>
      station.stationKey === 'transfer:군자' && station.lineId === '5',
  );
  const unsupported = line5
    ? {
        ...line5,
        id: 'future:test',
        stationKey: 'future:test',
        lineId: 'future',
        journeySupported: false,
      }
    : null;

  assert.equal(
    stationSelectionError(
      samePhysicalStation ?? null,
      samePhysicalStationOtherLine ?? null,
    ),
    '출발역과 도착역은 서로 달라야 합니다.',
  );
  assert.equal(
    stationSelectionError(line5 ?? null, unsupported ?? null),
    '선택한 노선의 엘리베이터 안전 경로는 준비 중입니다. 현재 1호선·2호선·3호선·4호선·5호선·6호선·7호선·8호선·9호선·공항철도·용인에버라인·김포골드라인·신림선·신분당선·수인분당선·GTX-A 경로를 안내할 수 있어요.',
  );
  assert.equal(
    stationSelectionError(line5 ?? null, null),
    '출발역과 도착역을 모두 선택해 주세요.',
  );
});

test('새 지원 노선은 검색과 노선도에서 선택할 수 있다', () => {
  for (const lineId of [
    '1',
    '6',
    '8',
    '9',
    'airport',
    'everline',
    'gimpo-gold',
    'sillim',
    'shinbundang',
    'gtx-a',
  ]) {
    const stations = stationCatalog.filter(
      (station) => station.lineId === lineId,
    );
    assert.ok(stations.length > 0);
    assert.ok(stations.every((station) => station.journeySupported));
  }
  assert.equal(
    new Set(
      stationCatalog
        .filter((station) => station.lineId === '1')
        .map((station) => station.id),
    ).size,
    stationCatalog.filter((station) => station.lineId === '1').length,
  );
});
