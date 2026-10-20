import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const catalogPath = resolve(
  'apps/mobile/src/entities/station/station-catalog.generated.ts',
);
const supportedLineIds = new Set([
  '1',
  '2',
  '3',
  '4',
  '5',
  '7',
  'airport',
  'everline',
  'gimpo-gold',
  'sillim',
]);

const [catalogSource, line1Source] = await Promise.all([
  readFile(catalogPath, 'utf8'),
  readFile(
    resolve('apps/api/src/journey/data/line-1-network-guidance.generated.ts'),
    'utf8',
  ),
]);
const catalog = parseGeneratedValue(catalogSource, 'stationCatalog: Station[]');
const line1 = parseGeneratedValue(line1Source, 'LINE_1_NETWORK_GUIDANCE');
const line1CodeByName = new Map(
  line1.stations.map((station) => [station.stationName, station.stationCode]),
);

for (const station of catalog) {
  station.journeySupported = supportedLineIds.has(station.lineId);
  if (station.lineId !== '1') continue;
  const stationCode = line1CodeByName.get(station.stationName);
  if (!stationCode) {
    throw new Error(
      `1호선 ${station.stationName}의 고유 역 코드를 찾을 수 없습니다.`,
    );
  }
  station.stationCode = stationCode;
  station.id = `1:${stationCode}`;
  if (!station.stationKey.startsWith('transfer:')) {
    station.stationKey = station.id;
  }
}

await writeFile(
  catalogPath,
  `${catalogSource.slice(0, catalogSource.indexOf('[', catalogSource.indexOf('=', catalogSource.indexOf('stationCatalog: Station[]'))))}${JSON.stringify(catalog, null, 2)};\n`,
  'utf8',
);
console.log(
  `모바일 역 카탈로그: ${catalog.filter((station) => station.journeySupported).length}개 지원 역 반영`,
);

function parseGeneratedValue(source, marker) {
  const markerIndex = source.indexOf(marker);
  const assignmentIndex = source.indexOf('=', markerIndex);
  const start = source.indexOf(
    marker.includes('stationCatalog') ? '[' : '{',
    assignmentIndex,
  );
  const end = source.lastIndexOf(marker.includes('stationCatalog') ? ']' : '}');
  if (markerIndex === -1 || start === -1 || end === -1) {
    throw new Error(`${marker} 생성 데이터를 읽을 수 없습니다.`);
  }
  return JSON.parse(source.slice(start, end + 1));
}
