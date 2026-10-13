import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const lineConfigs = [
  { name: '1호선', stem: 'line-1', status: 'route_engine_target' },
  { name: '2호선', stem: 'line-2', status: 'verified_supported' },
  { name: '3호선', stem: 'line-3', status: 'verified_supported' },
  {
    name: '4호선',
    stem: 'line-4',
    status: 'verified_supported',
    remaining: { surface: 0, door: 0, gap: 1 },
  },
  { name: '5호선', stem: 'line-5', status: 'verified_supported' },
  { name: '6호선', stem: 'line-6', status: 'route_engine_target' },
  { name: '7호선', stem: 'line-7', status: 'verified_supported' },
  { name: '8호선', stem: 'line-8', status: 'route_engine_target' },
  { name: '9호선', stem: 'line-9', status: 'route_engine_target' },
  { name: '공항철도', stem: 'airport-railroad', status: 'future_target' },
  { name: '인천 1호선', stem: 'incheon-line-1', status: 'future_target' },
  { name: '인천 2호선', stem: 'incheon-line-2', status: 'future_target' },
  { name: '신분당선', stem: 'shinbundang-line', status: 'future_target' },
  { name: '에버라인', stem: 'everline', status: 'future_target' },
  { name: '김포골드라인', stem: 'gimpo-goldline', status: 'future_target' },
  { name: 'GTX-A', stem: 'gtx-a', status: 'future_target' },
  {
    name: '인천공항 자기부상철도',
    stem: 'airport-maglev',
    status: 'future_target',
  },
  { name: '수인분당선', stem: 'suin-bundang-line', status: 'future_target' },
  { name: '경춘선', stem: 'gyeongchun-line', status: 'future_target' },
  { name: '경의중앙선', stem: 'gyeongui-jungang-line', status: 'future_target' },
  { name: '경강선', stem: 'gyeonggang-line', status: 'future_target' },
  { name: '서해선', stem: 'seohae-line', status: 'future_target' },
  { name: '신림선', stem: 'sillim-line', status: 'future_target' },
  { name: '우이신설선', stem: 'ui-sinseol-line', status: 'future_target' },
  {
    name: '의정부경전철',
    stem: 'uijeongbu-light-rail',
    status: 'future_target',
  },
];

const generatedAt = new Date().toISOString().slice(0, 10);
const results = [];

for (const config of lineConfigs) {
  const audit = await readJson(
    resolve(`data/research/line-sync/${config.stem}-latest.json`),
  );
  const manual = await readOptionalJson(
    resolve(`data/verification/${config.stem}-manual-verification.json`),
  );
  const differenceByKey = new Map(
    audit.differences.map((difference) => [
      differenceKey(
        difference.category,
        difference.stationCode,
        difference.railOperatorCode,
      ),
      difference,
    ]),
  );
  const differenceByCategoryAndCode = new Map(
    audit.differences.map((difference) => [
      `${difference.category}:${normalizeCode(difference.stationCode)}`,
      difference,
    ]),
  );

  const surfaceExitConflicts = audit.differences
    .filter(
      (difference) =>
        difference.category === 'surface_exit_number' &&
        difference.differenceKinds.includes('value_difference'),
    )
    .map(toSourceConflict);

  const doorByStation = new Map();
  for (const difference of audit.differences.filter(
    (item) =>
      item.category === 'elevator_adjacent_car_door' &&
      item.differenceKinds.includes('value_difference'),
  )) {
    doorByStation.set(stationIdentity(difference), {
      ...toSourceConflict(difference),
      reason: 'source_value_conflict',
    });
  }
  for (const station of audit.coverage.filter(
    (item) => (item.endpointCounts?.stationElevatorCarNumber ?? 0) === 0,
  )) {
    const stationCode = normalizeCode(station.stationCode);
    const stationId = stationIdentity(station);
    const difference =
      differenceByKey.get(
        differenceKey(
          'elevator_adjacent_car_door',
          stationCode,
          station.railOperatorCode,
        ),
      ) ??
      differenceByCategoryAndCode.get(
        `elevator_adjacent_car_door:${stationCode}`,
      );
    const existing = doorByStation.get(stationId);
    doorByStation.set(stationId, {
      stationCode,
      stationName: station.stationName,
      railOperatorCode: station.railOperatorCode ?? difference?.railOperatorCode,
      reason: existing ? 'source_value_conflict_and_primary_missing' : 'primary_api_missing',
      sourceValues: existing?.sourceValues ?? difference?.normalizedValues ?? {},
    });
  }

  const manualDirections = new Map(
    (manual?.directionalDoors ?? []).map((station) => [
      normalizeCode(station.stationCode),
      station.directions,
    ]),
  );
  const directionDoorChecks = [...doorByStation.values()]
    .map((station) => ({
      ...station,
      verifiedDirections: manualDirections.get(station.stationCode) ?? [],
    }))
    .filter((station) => {
      if (station.verifiedDirections.length < 2) return true;
      return false;
    })
    .toSorted(stationSort);

  const gapLinkageChecks = audit.differences
    .filter((difference) => difference.category === 'platform_gap_linkage')
    .map((difference) => ({
      stationCode: normalizeCode(difference.stationCode),
      stationName: difference.stationName,
      railOperatorCode: difference.railOperatorCode,
      issue: gapIssue(difference.normalizedValues),
    }))
    .toSorted(stationSort);

  results.push({
    ...config,
    collectedAt: audit.collectedAt,
    stationCount: audit.scope.stationCount,
    surfaceExitConflicts: surfaceExitConflicts.toSorted(stationSort),
    directionDoorChecks,
    gapLinkageChecks,
    gapSummary: audit.summary.gapSummary,
  });
}

await writeFile(
  resolve('data/verification/metropolitan-verification-queue.json'),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      generatedAt,
      policy: {
        surfaceExit:
          '출처 간 비어 있지 않은 출구 번호 집합이 다를 때만 사용자 확인',
        directionDoor:
          '차량·문 값 충돌 또는 stationElevatorCarNumber 미제공 역만 사용자 확인',
        platformGap:
          '승강장·권장 차량·문·이격거리 레코드가 연결되지 않을 때 사용자 확인',
        coverageGap:
          '다른 운영기관 API 미제공만 있는 경우는 사용자 확인에서 제외',
      },
      lines: results,
    },
    null,
    2,
  )}\n`,
  'utf8',
);

const detailed = results.filter((result) => result.status !== 'verified_supported');
console.log(
  `수도권 검증 큐 생성: ${results.length}개 노선, 상세 ${detailed.length}개 노선, 출구 ${sum(detailed, 'surfaceExitConflicts')}역, 차량·문 ${sum(detailed, 'directionDoorChecks')}역, 이격거리 ${sum(detailed, 'gapLinkageChecks')}역`,
);

function toSourceConflict(difference) {
  return {
    stationCode: normalizeCode(difference.stationCode),
    stationName: difference.stationName,
    railOperatorCode: difference.railOperatorCode,
    sourceValues: difference.normalizedValues,
  };
}

function gapIssue(values = {}) {
  if ((values.adjacentCarsMissingGap ?? []).length > 0) {
    return `권장 문 이격거리 없음: ${values.adjacentCarsMissingGap.join(', ')}`;
  }
  if ((values.stationPlatformTrainDistance ?? []).length === 0) {
    return '이격거리 API 행 없음';
  }
  return '승강장·차량·문·이격거리 연결 불가';
}


function differenceKey(category, stationCode, railOperatorCode) {
  return `${category}:${railOperatorCode ?? ''}:${normalizeCode(stationCode)}`;
}

function stationIdentity(station) {
  return `${station.railOperatorCode ?? ''}:${normalizeCode(station.stationCode)}`;
}

function normalizeCode(value) {
  const text = String(value);
  return /^\d+$/u.test(text) ? text.padStart(4, '0') : text;
}

function stationSort(left, right) {
  return `${left.railOperatorCode ?? ''}:${left.stationCode}`.localeCompare(
    `${right.railOperatorCode ?? ''}:${right.stationCode}`,
    'ko',
    { numeric: true },
  );
}

function sum(items, key) {
  return items.reduce((total, item) => total + item[key].length, 0);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}
