import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rawDirectory = await findLatestRawDirectory();
const [raw, audit, manual] = await Promise.all([
  readJson(resolve(rawDirectory, 'kric.json')),
  readJson(resolve('data/research/line-sync/line-6-latest.json')),
  readJson(resolve('data/verification/line-6-manual-verification.json')),
]);
const rawStationByCode = new Map(
  raw.stations.map((station) => [normalizeCode(station.station.stinCd), station]),
);
const manualByCode = new Map(
  manual.directionalDoors.map((station) => [
    normalizeCode(station.stationCode),
    station,
  ]),
);
const verifiedDirectionDoors = [];
const pendingDirectionDoorReview = [];

for (let index = 0; index < raw.route.body.length; index += 1) {
  const routeStation = raw.route.body[index];
  const stationCode = normalizeCode(routeStation.stinCd);
  const stationName = normalizeStationName(routeStation.stinNm);
  const expectedDirections = getExpectedDirections(raw.route.body, index);
  const manualStation = manualByCode.get(stationCode);
  const directions = manualStation
    ? manualStation.directions
    : parseStationElevatorDirections(
        rawStationByCode.get(stationCode)?.elevators?.body ?? [],
        expectedDirections,
      );
  const normalizedDirections = directions.map((direction) => ({
    toward: direction.toward,
    recommendedDoors: uniqueSorted(direction.recommendedDoors),
    evidence:
      direction.evidence ??
      'stationElevator 위치 설명의 인접역 방향·차량·문',
  }));
  const confirmedToward = new Set(
    normalizedDirections.map((direction) => direction.toward),
  );
  const remainingDirections = expectedDirections.filter(
    (toward) => !confirmedToward.has(toward),
  );

  if (normalizedDirections.length > 0) {
    verifiedDirectionDoors.push({
      stationCode,
      stationName,
      directions: normalizedDirections,
    });
  }
  if (remainingDirections.length > 0) {
    pendingDirectionDoorReview.push({
      stationCode,
      stationName,
      reason: 'station_elevator_direction_missing_or_other_line',
      remainingDirections,
      verifiedDirections: normalizedDirections,
      sourceValues: {},
    });
  }
}

const result = {
  schemaVersion: 1,
  line: '6',
  sourceCollectedAt: audit.collectedAt,
  generatedAt: new Date().toISOString(),
  routeEngineSupported: false,
  policy: {
    directionDoor:
      '사용자 확인값을 우선하고 나머지는 stationElevator 위치 설명에 적힌 인접역 방향과 차량·문을 사용',
    loop:
      '응암순환 구간은 일반 선형 노선 순서를 적용하지 않고 사용자 확인 단방향을 사용',
    mismatch:
      '다른 호선 방향을 반환하거나 인접역 방향이 누락된 경우 사용자 확인 대상으로 유지',
    gapOverride:
      '사용자 확인 위험등급을 저장하고 red 문은 추천에서 제외하며 인접한 green 또는 yellow 문을 사용',
  },
  verifiedDirectionDoors,
  verifiedGapOverrides: manual.gapOverrides ?? [],
  pendingDirectionDoorReview,
};

await writeFile(
  resolve('data/verification/line-6-api-consensus.json'),
  `${JSON.stringify(result, null, 2)}\n`,
  'utf8',
);

console.log(
  `6호선 준비: 차량·문 확인 ${verifiedDirectionDoors.length}역, 방향 확인 필요 ${pendingDirectionDoorReview.length}역`,
);

function getExpectedDirections(route, index) {
  const code = normalizeCode(route[index].stinCd);
  const loopDirections = {
    '2611': ['구산'],
    '2612': ['불광'],
    '2613': ['독바위'],
    '2614': ['연신내'],
    '2615': ['구산'],
    '2616': ['응암'],
    '2617': ['응암', '증산'],
  };
  if (loopDirections[code]) return loopDirections[code];
  return [
    index > 0 ? normalizeStationName(route[index - 1].stinNm) : null,
    index < route.length - 1
      ? normalizeStationName(route[index + 1].stinNm)
      : null,
  ].filter(Boolean);
}

function parseStationElevatorDirections(rows, expectedDirections) {
  const byDirection = new Map();
  for (const row of rows) {
    for (const match of String(row.dtlLoc ?? '').matchAll(
      /([^,]+?)방면\(?\s*(\d+-\d+)\)?/gu,
    )) {
      const toward = mapToward(
        normalizeStationName(match[1].trim()),
        expectedDirections,
      );
      if (!toward) continue;
      const doors = byDirection.get(toward) ?? [];
      doors.push(match[2]);
      byDirection.set(toward, doors);
    }
  }
  return [...byDirection.entries()].map(([toward, recommendedDoors]) => ({
    toward,
    recommendedDoors,
  }));
}

function mapToward(rawToward, expectedDirections) {
  const aliases = {
    효창공원: '효창공원앞',
  };
  const toward = aliases[rawToward] ?? rawToward;
  if (expectedDirections.includes(toward)) return toward;
  if (toward === '응암' && expectedDirections.length === 2) {
    return expectedDirections[0];
  }
  if (toward === '신내' && expectedDirections.length === 2) {
    return expectedDirections[1];
  }
  return null;
}

function uniqueSorted(values) {
  return [...new Set(values)].toSorted((left, right) =>
    String(left).localeCompare(String(right), 'ko', { numeric: true }),
  );
}

function normalizeCode(value) {
  const text = String(value);
  return /^\d+$/u.test(text) ? text.padStart(4, '0') : text;
}

function normalizeStationName(value) {
  return String(value).replace(/\([^)]*\)$/u, '').replace(/역$/u, '');
}

async function findLatestRawDirectory() {
  const root = resolve('data/research/line-sync/raw');
  const directory = (await readdir(root, { withFileTypes: true }))
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith('line-6-'),
    )
    .map((entry) => entry.name)
    .toSorted()
    .at(-1);
  if (!directory) throw new Error('6호선 원천 수집 데이터가 없습니다.');
  return resolve(root, directory);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}
