import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KRIC_API_ROOT = 'https://openapi.kric.go.kr/openapi';
const SEOUL_API_ROOT = 'http://openapi.seoul.go.kr:8088';
const SEOUL_SERVICE_NAME = 'SeoulMetroFaciInfo';
const SEOUL_PAGE_SIZE = 1_000;
const REQUEST_CONCURRENCY = 4;
const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');

for (const envFile of [
  path.join(repositoryRoot, '.env'),
  path.join(repositoryRoot, 'apps/api/.env'),
]) {
  if (process.env.KRIC_SERVICE_KEY && process.env.SEOUL_OPEN_DATA_API_KEY) break;
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const args = process.argv.slice(2);
const lineIndex = args.indexOf('--line');
const line = lineIndex === -1 ? '5' : args[lineIndex + 1];

if (!line || !/^[1-9]$/.test(line)) {
  throw new Error('--line 뒤에는 1부터 9까지의 호선 번호가 필요합니다.');
}
if (!process.env.KRIC_SERVICE_KEY) {
  throw new Error('KRIC_SERVICE_KEY가 필요합니다.');
}
if (!process.env.SEOUL_OPEN_DATA_API_KEY) {
  throw new Error('SEOUL_OPEN_DATA_API_KEY가 필요합니다.');
}

const collectedAt = new Date();
const timestamp = collectedAt.toISOString().replaceAll(':', '-');
const rawDirectory = path.join(
  repositoryRoot,
  'data/research/line-sync/raw',
  `line-${line}-${timestamp}`,
);
const reportDirectory = path.join(repositoryRoot, 'data/research/line-sync');
const reportPath = path.join(reportDirectory, `line-${line}-latest.json`);
const markdownPath = path.join(
  repositoryRoot,
  'docs/research',
  `line-${line}-api-sync-audit.md`,
);

await mkdir(rawDirectory, { recursive: true });
await mkdir(reportDirectory, { recursive: true });

const kricRequests = [];

async function fetchTextWithRetry(url, attempts = 5) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });
      const text = await response.text();
      if (!response.ok && attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
        continue;
      }
      return { response, text };
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      console.warn(
        `API 연결 재시도 ${attempt}/${attempts - 1}: ${error?.cause?.code ?? error?.code ?? error?.name ?? 'unknown'}`,
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    }
  }
  throw lastError;
}

async function fetchKric(endpoint, params, requestId) {
  const url = new URL(`${KRIC_API_ROOT}${endpoint}`);
  url.searchParams.set('serviceKey', process.env.KRIC_SERVICE_KEY);
  url.searchParams.set('format', 'json');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const { response, text } = await fetchTextWithRetry(url);
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${requestId}: KRIC 응답이 JSON이 아닙니다.`);
  }

  const resultCode = payload?.header?.resultCode ?? null;
  if (!response.ok || !['00', '03'].includes(resultCode)) {
    throw new Error(
      `${requestId}: HTTP ${response.status}, API ${resultCode ?? 'unknown'} ${payload?.header?.resultMsg ?? ''}`,
    );
  }

  kricRequests.push({
    requestId,
    endpoint,
    params,
    httpStatus: response.status,
    resultCode,
    resultMessage: payload?.header?.resultMsg ?? null,
    resultCount: payload?.header?.resultCnt ?? null,
  });
  return payload;
}

async function fetchSeoulRows() {
  const apiKey = process.env.SEOUL_OPEN_DATA_API_KEY;
  const fetchPage = async (start, end) => {
    const url = `${SEOUL_API_ROOT}/${encodeURIComponent(apiKey)}/json/${SEOUL_SERVICE_NAME}/${start}/${end}/`;
    const { response, text } = await fetchTextWithRetry(url);
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error('서울 승강기 API 응답이 JSON이 아닙니다.');
    }
    const service = payload?.[SEOUL_SERVICE_NAME];
    if (!response.ok || service?.RESULT?.CODE !== 'INFO-000') {
      throw new Error(
        `서울 승강기 API 호출 실패: HTTP ${response.status}, API ${service?.RESULT?.CODE ?? 'unknown'} ${service?.RESULT?.MESSAGE ?? ''}`,
      );
    }
    return service;
  };

  const first = await fetchPage(1, SEOUL_PAGE_SIZE);
  const rows = [...(first.row ?? [])];
  for (
    let start = SEOUL_PAGE_SIZE + 1;
    start <= first.list_total_count;
    start += SEOUL_PAGE_SIZE
  ) {
    const page = await fetchPage(
      start,
      Math.min(start + SEOUL_PAGE_SIZE - 1, first.list_total_count),
    );
    rows.push(...(page.row ?? []));
  }
  return { totalCount: first.list_total_count, rows };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

function body(payload) {
  return Array.isArray(payload?.body) ? payload.body : [];
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined))].sort(
    (left, right) => String(left).localeCompare(String(right), 'ko', { numeric: true }),
  );
}

function extractExitNumbers(values) {
  const matches = [];
  for (const value of values) {
    const text = String(value ?? '');
    for (const match of text.matchAll(/(\d+(?:-\d+)?)\s*번\s*출(?:입구|구)/g)) {
      matches.push(match[1]);
    }
  }
  return unique(matches);
}

function extractExitFieldValues(values) {
  return unique(
    values.flatMap((value) =>
      String(value ?? '')
        .split(/[,/]/)
        .map((item) => item.trim())
        .filter((item) => /^\d+(?:-\d+)?$/.test(item)),
    ),
  );
}

function extractCarDoors(values) {
  const matches = [];
  for (const value of values) {
    const text = String(value ?? '');
    if (/출(?:입구|구)/.test(text)) continue;
    for (const match of text.matchAll(/(?:^|[^\d])(\d{1,2})\s*-\s*(\d)(?=$|[^\d])/g)) {
      matches.push(`${Number(match[1])}-${Number(match[2])}`);
    }
  }
  return unique(matches);
}

function toKricFloor(groundName, floor) {
  if (groundName === '지상') return `${floor}F`;
  if (groundName === '지하') return `B${floor}`;
  return `${groundName ?? 'unknown'}${floor ?? ''}`;
}

function normalizeFloorPair(value) {
  const parts = String(value ?? '')
    .toUpperCase()
    .replaceAll(' ', '')
    .split('-')
    .filter(Boolean);
  if (parts.length !== 2) return String(value ?? '');
  return parts.sort().join('↔');
}

function kricFloorPairs(rows) {
  return unique(
    rows.map((row) =>
      normalizeFloorPair(
        `${toKricFloor(row.grndDvNmFr, row.runStinFlorFr)}-${toKricFloor(row.grndDvNmTo, row.runStinFlorTo)}`,
      ),
    ),
  );
}

function seoulFloorPairs(rows) {
  return unique(rows.map((row) => normalizeFloorPair(row.OPR_SEC)));
}

function areSetsEqual(left, right) {
  return JSON.stringify(unique(left)) === JSON.stringify(unique(right));
}

function haveAnyValue(valueSets) {
  return valueSets.some((values) => values.length > 0);
}

function haveDifference(valueSets) {
  return valueSets.slice(1).some((values) => !areSetsEqual(valueSets[0], values));
}

function toDifferenceKinds(valueSets) {
  const nonEmptySets = valueSets.filter((values) => values.length > 0);
  const signatures = new Set(
    nonEmptySets.map((values) => JSON.stringify(unique(values))),
  );
  const kinds = [];
  if (signatures.size > 1) kinds.push('value_difference');
  if (nonEmptySets.length > 0 && nonEmptySets.length < valueSets.length) {
    kinds.push('coverage_gap');
  }
  return kinds;
}

function surfaceKricRows(rows) {
  return rows.filter(
    (row) =>
      row.exitNo || row.grndDvNmFr === '지상' || row.grndDvNmTo === '지상',
  );
}

function surfaceSeoulRows(rows) {
  return rows.filter(
    (row) => /(?:^|-)1F(?:-|$)/i.test(row.OPR_SEC ?? '') || /출(?:입구|구)/.test(row.INSTL_PSTN ?? ''),
  );
}

function selectMovementExitRows(rows) {
  return rows.filter((row) =>
    /출(?:입구|구)/.test(
      `${row.stMovePath ?? ''} ${row.edMovePath ?? ''} ${row.mvContDtl ?? ''}`,
    ),
  );
}

function selectElevatorMovementExitRows(rows) {
  return rows.filter(
    (row) =>
      row.mvPathDvCd === '1' && /출(?:입구|구)/.test(row.mvContDtl ?? ''),
  );
}

function classifyGap(distanceCm) {
  if (distanceCm <= 10) return 'green';
  if (distanceCm <= 15) return 'yellow';
  return 'red';
}

function compactStationName(name) {
  return String(name ?? '').replace(/\([^)]*\)/g, '').replaceAll(' ', '');
}

function normalizeStationCode(stationCode) {
  return String(stationCode).padStart(4, '0');
}

function stationIdentity(station) {
  return `${station.railOprIsttCd}:${normalizeStationCode(station.stinCd)}`;
}

const routePayload = await fetchKric(
  '/trainUseInfo/subwayRouteInfo',
  { mreaWideCd: '01', lnCd: line },
  `line-${line}-route`,
);
const routeRows = body(routePayload);
const stationMap = new Map();
for (const row of routeRows) {
  const identity = stationIdentity(row);
  if (!stationMap.has(identity)) stationMap.set(identity, row);
}
const stations = [...stationMap.values()].sort(
  (left, right) =>
    left.stinConsOrdr - right.stinConsOrdr || left.stinCd.localeCompare(right.stinCd),
);

const operatorCodes = unique(stations.map((station) => station.railOprIsttCd));
const platformPayloads = await Promise.all(
  operatorCodes.map((railOprIsttCd) =>
    fetchKric(
      '/convenientInfo/stPlf',
      { railOprIsttCd, lnCd: line },
      `line-${line}-${railOprIsttCd}-platforms`,
    ),
  ),
);
const platformRows = platformPayloads.flatMap(body);
const platformsByStation = Map.groupBy(platformRows, stationIdentity);

console.log(`${line}호선 ${stations.length}개 역의 KRIC 응답을 수집합니다.`);

const stationPayloads = await mapLimit(stations, REQUEST_CONCURRENCY, async (station) => {
  const baseParams = {
    railOprIsttCd: station.railOprIsttCd,
    lnCd: station.lnCd,
    stinCd: station.stinCd,
  };
  const [movement, elevatorMovement, elevators, nearbyCars] = await Promise.all([
    fetchKric(
      '/handicapped/stationMovement',
      baseParams,
      `${station.stinCd}-stationMovement`,
    ),
    fetchKric(
      '/trafficWeekInfo/stinElevatorMovement',
      baseParams,
      `${station.stinCd}-stinElevatorMovement`,
    ),
    fetchKric(
      '/convenientInfo/stationElevator',
      baseParams,
      `${station.stinCd}-stationElevator`,
    ),
    fetchKric(
      '/vulnerableUserInfo/stationElevatorCarNumber',
      baseParams,
      `${station.stinCd}-stationElevatorCarNumber`,
    ),
  ]);
  return {
    station,
    movement,
    elevatorMovement,
    elevators,
    nearbyCars,
  };
});

const gapTasks = stations.flatMap((station) =>
  (platformsByStation.get(stationIdentity(station)) ?? []).map((platform) => ({
    station,
    platform,
  })),
);
const gapPayloads = await mapLimit(gapTasks, REQUEST_CONCURRENCY, async ({ station, platform }) => ({
  stationKey: stationIdentity(station),
  stationCode: normalizeStationCode(station.stinCd),
  platformNumber: String(platform.plfNo),
  payload: await fetchKric(
    '/vulnerableUserInfo/stationPlatformTrainDistance',
    {
      railOprIsttCd: station.railOprIsttCd,
      lnCd: station.lnCd,
      stinCd: station.stinCd,
      plfNo: platform.plfNo,
    },
    `${station.stinCd}-platform-${platform.plfNo}-gap`,
  ),
}));
const gapsByStation = Map.groupBy(gapPayloads, (item) => item.stationKey);

console.log('서울교통공사 승강기 현황을 수집합니다.');
const seoulSnapshot = await fetchSeoulRows();
const lineStationCodes = new Set(
  stations.map((station) => normalizeStationCode(station.stinCd)),
);
const lineSeoulRows = seoulSnapshot.rows.filter(
  (row) => lineStationCodes.has(row.STN_CD) && row.ELVTR_SE === 'EV',
);
const stationCodeCounts = new Map();
for (const station of stations) {
  const stationCode = normalizeStationCode(station.stinCd);
  stationCodeCounts.set(stationCode, (stationCodeCounts.get(stationCode) ?? 0) + 1);
}

const differences = [];
const coverage = [];
const gapSummary = { green: 0, yellow: 0, red: 0, missing: 0 };

for (const item of stationPayloads) {
  const { station } = item;
  const stationKey = stationIdentity(station);
  const stationCode = normalizeStationCode(station.stinCd);
  const movementRows = body(item.movement);
  const elevatorMovementRows = body(item.elevatorMovement);
  const elevatorRows = body(item.elevators);
  const nearbyCarRows = body(item.nearbyCars);
  const stationPlatforms = platformsByStation.get(stationKey) ?? [];
  const stationGapPayloads = gapsByStation.get(stationKey) ?? [];
  const gapRows = stationGapPayloads.flatMap((gap) => body(gap.payload));
  const seoulRowsForCode = lineSeoulRows.filter((row) => row.STN_CD === stationCode);
  const seoulRows =
    (stationCodeCounts.get(stationCode) ?? 0) > 1
      ? seoulRowsForCode.filter(
          (row) =>
            compactStationName(row.STN_NM) === compactStationName(station.stinNm),
        )
      : seoulRowsForCode;

  const endpointCounts = {
    stationMovement: movementRows.length,
    stinElevatorMovement: elevatorMovementRows.length,
    stationElevator: elevatorRows.length,
    stationElevatorCarNumber: nearbyCarRows.length,
    stPlf: stationPlatforms.length,
    stationPlatformTrainDistance: gapRows.length,
    SeoulMetroFaciInfo: seoulRows.length,
  };
  coverage.push({
    stationKey,
    stationCode,
    stationName: station.stinNm,
    railOperatorCode: station.railOprIsttCd,
    endpointCounts,
  });

  const movementExitRows = selectMovementExitRows(movementRows);
  const elevatorMovementExitRows = selectElevatorMovementExitRows(elevatorMovementRows);
  const elevatorSurfaceRows = surfaceKricRows(elevatorRows);
  const seoulSurfaceRows = surfaceSeoulRows(seoulRows);
  const exitValues = {
    stationMovement: extractExitNumbers(
      movementExitRows.flatMap((row) => [row.stMovePath, row.edMovePath, row.mvContDtl]),
    ),
    stinElevatorMovement: extractExitNumbers(
      elevatorMovementExitRows.map((row) => row.mvContDtl),
    ),
    stationElevator: unique(
      elevatorSurfaceRows.flatMap((row) => [
        ...extractExitFieldValues([row.exitNo]),
        ...extractExitNumbers([row.dtlLoc]),
      ]),
    ),
    SeoulMetroFaciInfo: extractExitNumbers(
      seoulSurfaceRows.flatMap((row) => [row.ELVTR_NM, row.INSTL_PSTN]),
    ),
  };
  const exitValueSets = Object.values(exitValues);
  if (haveAnyValue(exitValueSets) && haveDifference(exitValueSets)) {
    differences.push({
      stationCode,
      stationName: station.stinNm,
      stationKey,
      railOperatorCode: station.railOprIsttCd,
      category: 'surface_exit_number',
      differenceKinds: toDifferenceKinds(exitValueSets),
      normalizedValues: exitValues,
      apiResponses: {
        stationMovement: movementExitRows,
        stinElevatorMovement: elevatorMovementExitRows,
        stationElevator: elevatorSurfaceRows,
        SeoulMetroFaciInfo: seoulSurfaceRows,
      },
    });
  }

  const floorValues = {
    stationElevator: kricFloorPairs(elevatorRows),
    SeoulMetroFaciInfo: seoulFloorPairs(seoulRows),
  };
  if (
    haveAnyValue(Object.values(floorValues)) &&
    haveDifference(Object.values(floorValues))
  ) {
    differences.push({
      stationCode,
      stationName: station.stinNm,
      stationKey,
      railOperatorCode: station.railOprIsttCd,
      category: 'elevator_operating_floor',
      differenceKinds: toDifferenceKinds(Object.values(floorValues)),
      normalizedValues: floorValues,
      apiResponses: {
        stationElevator: elevatorRows,
        SeoulMetroFaciInfo: seoulRows,
      },
    });
  }

  const elevatorInternalRows = elevatorRows.filter(
    (row) => !surfaceKricRows([row]).length,
  );
  const seoulInternalRows = seoulRows.filter(
    (row) => !surfaceSeoulRows([row]).length,
  );
  const carDoorValues = {
    stationElevatorCarNumber: unique(
      nearbyCarRows.map((row) => `${row.carOrdr}-${row.carEtrcNo}`),
    ),
    stationElevator: extractCarDoors(elevatorInternalRows.map((row) => row.dtlLoc)),
    SeoulMetroFaciInfo: extractCarDoors(
      seoulInternalRows.flatMap((row) => [row.ELVTR_NM, row.INSTL_PSTN]),
    ),
  };
  if (
    haveAnyValue(Object.values(carDoorValues)) &&
    haveDifference(Object.values(carDoorValues))
  ) {
    differences.push({
      stationCode,
      stationName: station.stinNm,
      stationKey,
      railOperatorCode: station.railOprIsttCd,
      category: 'elevator_adjacent_car_door',
      differenceKinds: toDifferenceKinds(Object.values(carDoorValues)),
      normalizedValues: carDoorValues,
      apiResponses: {
        stationElevatorCarNumber: nearbyCarRows,
        stationElevator: elevatorInternalRows,
        SeoulMetroFaciInfo: seoulInternalRows,
      },
    });
  }

  const platformNumbers = unique(stationPlatforms.map((row) => String(row.plfNo)));
  const gapPlatformNumbers = unique(gapRows.map((row) => String(row.plfNo)));
  const carPlatformNumbers = unique(nearbyCarRows.map((row) => String(row.plfNo)));
  const adjacentCarsMissingGap = nearbyCarRows.filter(
    (car) =>
      !gapRows.some(
        (gap) =>
          String(gap.plfNo) === String(car.plfNo) &&
          String(gap.carOrdr) === String(car.carOrdr) &&
          String(gap.carEtrcNo) === String(car.carEtrcNo),
      ),
  );
  if (
    !areSetsEqual(platformNumbers, gapPlatformNumbers) ||
    carPlatformNumbers.some((platform) => !platformNumbers.includes(platform)) ||
    adjacentCarsMissingGap.length > 0
  ) {
    differences.push({
      stationCode,
      stationName: station.stinNm,
      stationKey,
      railOperatorCode: station.railOprIsttCd,
      category: 'platform_gap_linkage',
      differenceKinds: ['linkage_gap'],
      normalizedValues: {
        stPlf: platformNumbers,
        stationPlatformTrainDistance: gapPlatformNumbers,
        stationElevatorCarNumber: carPlatformNumbers,
        adjacentCarsMissingGap: adjacentCarsMissingGap.map(
          (row) => `${row.plfNo}:${row.carOrdr}-${row.carEtrcNo}`,
        ),
      },
      apiResponses: {
        stPlf: stationPlatforms,
        stationElevatorCarNumber: nearbyCarRows,
        stationPlatformTrainDistance: gapRows,
      },
    });
  }

  for (const row of gapRows) {
    if (typeof row.sfDst !== 'number' || row.sfDst < 0) {
      gapSummary.missing += 1;
    } else {
      gapSummary[classifyGap(row.sfDst)] += 1;
    }
  }

  const seoulNames = unique(seoulRows.map((row) => row.STN_NM));
  if (
    seoulNames.length > 0 &&
    seoulNames.every(
      (name) => compactStationName(name) !== compactStationName(station.stinNm),
    )
  ) {
    differences.push({
      stationCode,
      stationName: station.stinNm,
      stationKey,
      railOperatorCode: station.railOprIsttCd,
      category: 'station_name',
      differenceKinds: ['value_difference'],
      normalizedValues: {
        subwayRouteInfo: [station.stinNm],
        SeoulMetroFaciInfo: seoulNames,
      },
      apiResponses: {
        subwayRouteInfo: [station],
        SeoulMetroFaciInfo: seoulRows,
      },
    });
  }
}

const categoryCounts = Object.fromEntries(
  [...Map.groupBy(differences, (difference) => difference.category).entries()].map(
    ([category, items]) => [category, items.length],
  ),
);
const affectedStations = unique(differences.map((difference) => difference.stationKey));
const differenceKindCounts = Object.fromEntries(
  [...Map.groupBy(
    differences.flatMap((difference) => difference.differenceKinds),
    (kind) => kind,
  ).entries()].map(([kind, items]) => [kind, items.length]),
);
const endpointNames = Object.keys(coverage[0]?.endpointCounts ?? {});
const endpointCoverage = Object.fromEntries(
  endpointNames.map((endpoint) => {
    const stationCounts = coverage.map(
      (station) => station.endpointCounts[endpoint],
    );
    return [
      endpoint,
      {
        stationsWithRows: stationCounts.filter((count) => count > 0).length,
        stationsWithoutRows: stationCounts.filter((count) => count === 0).length,
        rowCount: stationCounts.reduce((sum, count) => sum + count, 0),
      },
    ];
  }),
);
const report = {
  collectedAt: collectedAt.toISOString(),
  scope: {
    line: `${line}호선`,
    railOperatorCodes: operatorCodes,
    stationCount: stations.length,
    goal: '서울 지하철 1~9호선 지원을 위한 노선별 API 동기화 감사',
  },
  comparisonPolicy: {
    adjudication: '어떤 API가 맞는지 판정하지 않는다.',
    surfaceExitNumber:
      'stationMovement, stinElevatorMovement, stationElevator, SeoulMetroFaciInfo에서 추출한 출구 번호 집합을 비교한다.',
    elevatorOperatingFloor:
      'stationElevator와 SeoulMetroFaciInfo의 운행 층 구간을 방향과 무관한 층 쌍으로 비교한다.',
    elevatorAdjacentCarDoor:
      'stationElevatorCarNumber, stationElevator, SeoulMetroFaciInfo의 차량-문 번호 집합을 비교한다.',
    platformGapLinkage:
      'stPlf의 승강장, stationElevatorCarNumber의 인접 차량-문, stationPlatformTrainDistance의 이격거리 레코드 연결 여부를 비교한다.',
    gapUnit: 'cm',
    gapLevels: {
      green: '0cm 이상 10cm 이하: 안전',
      yellow: '10cm 초과 15cm 이하: 유의',
      red: '15cm 초과: 추천하지 않음',
    },
  },
  sources: {
    subwayRouteInfo: '/trainUseInfo/subwayRouteInfo',
    stationMovement: '/handicapped/stationMovement',
    stinElevatorMovement: '/trafficWeekInfo/stinElevatorMovement',
    stationElevator: '/convenientInfo/stationElevator',
    stationElevatorCarNumber:
      '/vulnerableUserInfo/stationElevatorCarNumber',
    stationPlatformTrainDistance:
      '/vulnerableUserInfo/stationPlatformTrainDistance',
    stPlf: '/convenientInfo/stPlf',
    SeoulMetroFaciInfo: '서울교통공사 승강기 가동현황 API',
  },
  summary: {
    affectedStationCount: affectedStations.length,
    differenceCount: differences.length,
    categoryCounts,
    differenceKindCounts,
    endpointCoverage,
    gapRecordCount: Object.values(gapSummary).reduce((sum, count) => sum + count, 0),
    gapSummary,
  },
  coverage,
  differences,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(
  path.join(rawDirectory, 'manifest.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    line,
    kricRequests,
    seoulTotalCount: seoulSnapshot.totalCount,
    seoulLineElevatorCount: lineSeoulRows.length,
  }, null, 2)}\n`,
  'utf8',
);
await writeFile(
  path.join(rawDirectory, 'kric.json'),
  `${JSON.stringify({
    route: routePayload,
    platforms: platformPayloads,
    stations: stationPayloads,
    gaps: gapPayloads,
  }, null, 2)}\n`,
  'utf8',
);
await writeFile(
  path.join(rawDirectory, 'seoul.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    rows: lineSeoulRows,
  }, null, 2)}\n`,
  'utf8',
);

function markdownCell(values) {
  if (!values || values.length === 0) return '없음';
  return values.map((value) => `\`${String(value).replaceAll('|', '\\|')}\``).join(', ');
}

const categoryLabels = {
  surface_exit_number: '지상 엘리베이터 출구 번호',
  elevator_operating_floor: '엘리베이터 운행 층 구간',
  elevator_adjacent_car_door: '승강기 인접 차량·문',
  platform_gap_linkage: '승강장·인접 문·이격거리 연결',
  station_name: '역명',
};

const differenceKindLabels = {
  value_difference: '값 차이',
  coverage_gap: 'API 값 없음',
  linkage_gap: '연결 레코드 없음',
};

const markdown = [
  `# ${line}호선 API 정보 차이 감사`,
  '',
  `- 수집 시각: ${collectedAt.toISOString()}`,
  `- 대상: ${stations.length}개 역`,
  `- 차이가 기록된 역: ${affectedStations.length}개`,
  `- 차이 항목: ${differences.length}건`,
  '- 판정 원칙: 어떤 API가 맞는지 결정하지 않고 API별 반환 값만 병기한다.',
  `- 상세 응답: [line-${line}-latest.json](../../data/research/line-sync/line-${line}-latest.json)`,
  '',
  '## 비교 기준',
  '',
  '- 지상 출구: 네 API에서 추출한 출구 번호 집합이 다르면 기록한다.',
  '- 운행 층: KRIC 시설 현황과 서울교통공사 현황의 층 구간 집합이 다르면 기록한다.',
  '- 차량·문: 세 API의 차량-문 번호 집합이 다르면 기록한다.',
  '- 승강장·이격거리: 승강장, 인접 차량·문, 문별 이격거리 레코드가 연결되지 않으면 기록한다.',
  '- 빈 값은 `없음`으로 표시하며, 누락인지 실제 시설 부재인지 판정하지 않는다.',
  '- `값 차이`와 `API 값 없음`은 별도 유형으로 표시한다.',
  '',
  '## API별 역 데이터 제공 범위',
  '',
  '| API | 값이 있는 역 | 값이 없는 역 | 응답 행 |',
  '| --- | ---: | ---: | ---: |',
  ...Object.entries(endpointCoverage).map(
    ([endpoint, counts]) =>
      `| ${endpoint} | ${counts.stationsWithRows} | ${counts.stationsWithoutRows} | ${counts.rowCount} |`,
  ),
  '',
  '## 승강장 이격거리',
  '',
  '| 구간 | 등급 | 의미 |',
  '| --- | --- | --- |',
  '| 0cm 이상~10cm 이하 | `green` | 안전 |',
  '| 10cm 초과~15cm 이하 | `yellow` | 유의 |',
  '| 15cm 초과 | `red` | 추천하지 않음 |',
  '',
  `전체 ${report.summary.gapRecordCount}건: green ${gapSummary.green}, yellow ${gapSummary.yellow}, red ${gapSummary.red}, 값 없음 ${gapSummary.missing}.`,
  '',
];

for (const [category, items] of Map.groupBy(
  differences,
  (difference) => difference.category,
).entries()) {
  markdown.push(`## ${categoryLabels[category] ?? category} (${items.length}역)`, '');
  const sourceNames = unique(items.flatMap((item) => Object.keys(item.normalizedValues)));
  markdown.push(
    `| 역 | 구분 | ${sourceNames.join(' | ')} |`,
    `| --- | --- | ${sourceNames.map(() => '---').join(' | ')} |`,
  );
  for (const item of items) {
    markdown.push(
      `| ${item.stationName} (${item.stationCode}, ${item.railOperatorCode}) | ${item.differenceKinds
        .map((kind) => differenceKindLabels[kind] ?? kind)
        .join(' + ')} | ${sourceNames
        .map((source) => markdownCell(item.normalizedValues[source]))
        .join(' | ')} |`,
    );
  }
  markdown.push('');
}

markdown.push(
  '## 1~9호선 확대',
  '',
  `동일한 수집기에서 \`--line 1\`부터 \`--line 9\`까지 실행할 수 있다. 이번 결과는 ${line}호선만 포함한다.`,
);

await writeFile(markdownPath, `${markdown.join('\n')}\n`, 'utf8');

console.log(
  `${line}호선 감사 완료: ${affectedStations.length}개 역, ${differences.length}개 차이 항목`,
);
console.log(`보고서: ${path.relative(repositoryRoot, reportPath)}`);
console.log(`문서: ${path.relative(repositoryRoot, markdownPath)}`);
console.log(`원본: ${path.relative(repositoryRoot, rawDirectory)}`);
