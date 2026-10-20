import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KRIC_API_ROOT = 'https://openapi.kric.go.kr/openapi';
const SEOUL_API_ROOT = 'http://openapi.seoul.go.kr:8088';
const SEOUL_SERVICE_NAME = 'SeoulMetroFaciInfo';
const SEOUL_PAGE_SIZE = 1_000;
const REQUEST_CONCURRENCY = 2;
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
const requestedLine = lineIndex === -1 ? '5' : args[lineIndex + 1];
const normalizedRequestedLine = requestedLine?.toLowerCase();
const namedLineTargetDefinitions = [
  {
    code: 'A1',
    label: '공항철도',
    artifactStem: 'airport-railroad',
    aliases: ['a1', 'airport', 'arex'],
  },
  {
    code: 'I1',
    label: '인천 1호선',
    artifactStem: 'incheon-line-1',
    aliases: ['i1', 'incheon-1', 'incheon1'],
  },
  {
    code: 'I2',
    label: '인천 2호선',
    artifactStem: 'incheon-line-2',
    aliases: ['i2', 'incheon-2', 'incheon2'],
  },
  {
    code: 'D1',
    label: '신분당선',
    artifactStem: 'shinbundang-line',
    aliases: ['d1', 'shinbundang'],
  },
  {
    code: 'E1',
    label: '에버라인',
    artifactStem: 'everline',
    aliases: ['e1', 'everline'],
  },
  {
    code: 'G1',
    label: '김포골드라인',
    artifactStem: 'gimpo-goldline',
    aliases: ['g1', 'gimpo-goldline'],
  },
  {
    code: 'A',
    label: 'GTX-A',
    artifactStem: 'gtx-a',
    aliases: ['a', 'gtx-a'],
  },
  {
    code: 'M1',
    label: '인천공항 자기부상철도',
    artifactStem: 'airport-maglev',
    aliases: ['m1', 'airport-maglev'],
  },
  {
    code: 'K1',
    label: '수인분당선',
    artifactStem: 'suin-bundang-line',
    aliases: ['k1', 'suin-bundang'],
  },
  {
    code: 'K2',
    label: '경춘선',
    artifactStem: 'gyeongchun-line',
    aliases: ['k2', 'gyeongchun'],
  },
  {
    code: 'K4',
    label: '경의중앙선',
    artifactStem: 'gyeongui-jungang-line',
    aliases: ['k4', 'gyeongui-jungang'],
  },
  {
    code: 'K5',
    label: '경강선',
    artifactStem: 'gyeonggang-line',
    aliases: ['k5', 'gyeonggang'],
  },
  {
    code: 'WS',
    label: '서해선',
    artifactStem: 'seohae-line',
    aliases: ['ws', 'seohae'],
  },
  {
    code: 'L1',
    label: '신림선',
    artifactStem: 'sillim-line',
    aliases: ['l1', 'sillim'],
  },
  {
    code: 'UI',
    label: '우이신설선',
    artifactStem: 'ui-sinseol-line',
    aliases: ['ui', 'ui-sinseol'],
  },
  {
    code: 'U1',
    label: '의정부경전철',
    artifactStem: 'uijeongbu-light-rail',
    aliases: ['u1', 'uijeongbu'],
  },
];
const namedLineTargets = Object.fromEntries(
  namedLineTargetDefinitions.flatMap(({ aliases, ...target }) =>
    aliases.map((alias) => [alias, target]),
  ),
);
const lineTarget = /^[1-9]$/.test(requestedLine ?? '')
  ? {
      code: requestedLine,
      label: `${requestedLine}호선`,
      artifactStem: `line-${requestedLine}`,
    }
  : (namedLineTargets[normalizedRequestedLine] ?? null);

if (!lineTarget) {
  throw new Error(
    '--line 뒤에는 1부터 9까지의 호선 번호나 등록된 수도권 노선 식별자가 필요합니다.',
  );
}
const line = lineTarget.code;
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
  `${lineTarget.artifactStem}-${timestamp}`,
);
const reportDirectory = path.join(repositoryRoot, 'data/research/line-sync');
const reportPath = path.join(
  reportDirectory,
  `${lineTarget.artifactStem}-latest.json`,
);
const markdownPath = path.join(
  repositoryRoot,
  'docs/research',
  `${lineTarget.artifactStem}-api-sync-audit.md`,
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

async function fetchKric(
  endpoint,
  params,
  requestId,
  acceptedResultCodes = ['00', '03'],
) {
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
  if (!response.ok || !acceptedResultCodes.includes(resultCode)) {
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
    for (const match of text.matchAll(/(?:^|[^\d])(\d{1,2})\s*-\s*([1-4])(?=$|[^\d])/g)) {
      matches.push(`${Number(match[1])}-${Number(match[2])}`);
    }
  }
  return unique(matches);
}

function extractCarDoorMentions(value) {
  const text = String(value ?? '');
  if (/출(?:입구|구)/.test(text)) return [];
  return [...text.matchAll(/(?:^|[^\d])(\d{1,2})\s*-\s*([1-4])(?=$|[^\d])/g)].map(
    (match) => ({
      door: `${Number(match[1])}-${Number(match[2])}`,
      location: text,
    }),
  );
}

function isCandidateForRequestedLine(location) {
  if (!/^\d+$/.test(String(line))) return true;
  const mentionedLines = [...String(location ?? '').matchAll(/(\d+)호선/g)].map(
    (match) => match[1],
  );
  return mentionedLines.length === 0 || mentionedLines.includes(String(line));
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
  const code = String(stationCode);
  return /^\d+$/.test(code) ? code.padStart(4, '0') : code.toUpperCase();
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

console.log(`${lineTarget.label} ${stations.length}개 역의 KRIC 응답을 수집합니다.`);

const stationPayloads = await mapLimit(stations, REQUEST_CONCURRENCY, async (station) => {
  const baseParams = {
    railOprIsttCd: station.railOprIsttCd,
    lnCd: station.lnCd,
    stinCd: station.stinCd,
  };
  const movement = await fetchKric(
    '/handicapped/stationMovement',
    baseParams,
    `${station.stinCd}-stationMovement`,
  );
  const elevatorMovement = await fetchKric(
    '/trafficWeekInfo/stinElevatorMovement',
    baseParams,
    `${station.stinCd}-stinElevatorMovement`,
  );
  const elevators = await fetchKric(
    '/convenientInfo/stationElevator',
    baseParams,
    `${station.stinCd}-stationElevator`,
  );
  const nearbyCars = await fetchKric(
    '/vulnerableUserInfo/stationElevatorCarNumber',
    baseParams,
    `${station.stinCd}-stationElevatorCarNumber`,
  );
  const nearbyStairs = await fetchKric(
    '/vulnerableUserInfo/stationStairCarNumber',
    baseParams,
    `${station.stinCd}-stationStairCarNumber`,
    ['00', '03', '30'],
  );
  return {
    station,
    movement,
    elevatorMovement,
    elevators,
    nearbyCars,
    nearbyStairs,
  };
});

const stationPayloadsByStation = new Map(
  stationPayloads.map((payload) => [stationIdentity(payload.station), payload]),
);
const gapTasks = stations.flatMap((station) => {
  const stationKey = stationIdentity(station);
  const platformNumbers = unique([
    ...(platformsByStation.get(stationKey) ?? []).map((platform) =>
      String(platform.plfNo),
    ),
    ...body(stationPayloadsByStation.get(stationKey)?.nearbyCars).map((row) =>
      String(row.plfNo),
    ),
  ]);
  return platformNumbers.map((platformNumber) => ({ station, platformNumber }));
});
const gapPayloads = await mapLimit(gapTasks, REQUEST_CONCURRENCY, async ({ station, platformNumber }) => ({
  stationKey: stationIdentity(station),
  stationCode: normalizeStationCode(station.stinCd),
  platformNumber,
  payload: await fetchKric(
    '/vulnerableUserInfo/stationPlatformTrainDistance',
    {
      railOprIsttCd: station.railOprIsttCd,
      lnCd: station.lnCd,
      stinCd: station.stinCd,
      plfNo: platformNumber,
    },
    `${station.stinCd}-platform-${platformNumber}-gap`,
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

const differences = [];
const coverage = [];
const preferredDoorGuidance = [];
const gapSummary = { green: 0, yellow: 0, red: 0, missing: 0 };

for (const item of stationPayloads) {
  const { station } = item;
  const stationKey = stationIdentity(station);
  const stationCode = normalizeStationCode(station.stinCd);
  const movementRows = body(item.movement);
  const elevatorMovementRows = body(item.elevatorMovement);
  const elevatorRows = body(item.elevators);
  const nearbyCarRows = body(item.nearbyCars);
  const nearbyStairRows = body(item.nearbyStairs);
  const stationPlatforms = platformsByStation.get(stationKey) ?? [];
  const stationGapPayloads = gapsByStation.get(stationKey) ?? [];
  const gapRows = stationGapPayloads.flatMap((gap) => body(gap.payload));
  const seoulRowsForCode = lineSeoulRows.filter((row) => row.STN_CD === stationCode);
  const seoulRows =
    station.railOprIsttCd === 'S1'
      ? seoulRowsForCode
      : seoulRowsForCode.filter(
          (row) =>
            compactStationName(row.STN_NM) === compactStationName(station.stinNm),
        );

  const endpointCounts = {
    stationMovement: movementRows.length,
    stinElevatorMovement: elevatorMovementRows.length,
    stationElevator: elevatorRows.length,
    stationElevatorCarNumber: nearbyCarRows.length,
    stationStairCarNumber: nearbyStairRows.length,
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

  // Ground-level platforms are common on Line 1. A platform elevator can therefore
  // have a ground-to-ground floor pair and must not be discarded as a surface-only
  // elevator. Exit text is excluded by extractCarDoors instead.
  const elevatorInternalRows = elevatorRows;
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
  if (adjacentCarsMissingGap.length > 0) {
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


  const rawStationElevatorCandidates = elevatorRows.flatMap((row) =>
    extractCarDoorMentions(row.dtlLoc)
      .filter((candidate) => isCandidateForRequestedLine(candidate.location))
      .map((candidate) => ({
        ...candidate,
        platformNumber: null,
      })),
  );
  const directStationElevatorCandidates = rawStationElevatorCandidates.filter(
    (candidate) => !/환승통로/.test(candidate.location),
  );
  const stationElevatorCandidates =
    directStationElevatorCandidates.length > 0
      ? directStationElevatorCandidates
      : rawStationElevatorCandidates;
  const stationElevatorCarNumberCandidates = nearbyCarRows.map((row) => ({
    door: `${row.carOrdr}-${row.carEtrcNo}`,
    location: null,
    platformNumber: String(row.plfNo),
  }));
  const preferredSource =
    stationElevatorCandidates.length > 0
      ? 'stationElevator'
      : stationElevatorCarNumberCandidates.length > 0
        ? 'stationElevatorCarNumber'
        : null;
  const selectedCandidates = uniqueDoorCandidates(
    preferredSource === 'stationElevator'
      ? stationElevatorCandidates
      : stationElevatorCarNumberCandidates,
  );
  const selectedWithGaps = selectedCandidates.map((candidate) => {
    const inferredPlatforms = candidate.platformNumber
      ? [candidate.platformNumber]
      : inferCandidatePlatforms({
          candidate,
          station,
          stations,
          stationPlatforms,
          nearbyCarRows,
        });
    const matchingGaps = gapRows
      .filter(
        (gap) =>
          `${gap.carOrdr}-${gap.carEtrcNo}` === candidate.door &&
          (inferredPlatforms.length === 0 ||
            inferredPlatforms.includes(String(gap.plfNo))),
      )
      .map((gap) => ({
        platformNumber: String(gap.plfNo),
        distanceCm: gap.sfDst,
        level:
          typeof gap.sfDst === 'number' && gap.sfDst >= 0
            ? classifyGap(gap.sfDst)
            : null,
      }));
    return {
      ...candidate,
      inferredPlatformNumbers: inferredPlatforms,
      gaps: matchingGaps,
      gapStatus:
        matchingGaps.length === 0
          ? 'missing'
          : matchingGaps.every((gap) => gap.distanceCm === null)
            ? 'value_missing'
            : inferredPlatforms.length === 0 &&
                new Set(
                  matchingGaps.map((gap) => `${gap.distanceCm}:${gap.level}`),
                ).size > 1
              ? 'platform_ambiguous'
              : 'linked',
    };
  });
  preferredDoorGuidance.push({
    stationCode,
    stationName: station.stinNm,
    stationKey,
    railOperatorCode: station.railOprIsttCd,
    source: preferredSource,
    candidates: selectedWithGaps,
  });

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
    line: lineTarget.label,
    lineCode: line,
    railOperatorCodes: operatorCodes,
    stationCount: stations.length,
    goal: '수도권 도시철도 지원을 위한 노선별 API 동기화 감사',
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
    stationStairCarNumber: '/vulnerableUserInfo/stationStairCarNumber',
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
    preferredDoorSourceCounts: {
      stationElevator: preferredDoorGuidance.filter(
        (station) => station.source === 'stationElevator',
      ).length,
      stationElevatorCarNumber: preferredDoorGuidance.filter(
        (station) => station.source === 'stationElevatorCarNumber',
      ).length,
      unavailable: preferredDoorGuidance.filter((station) => !station.source)
        .length,
    },
  },
  coverage,
  preferredDoorGuidance,
  differences,
};

await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(
  path.join(rawDirectory, 'manifest.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    lineCode: line,
    lineLabel: lineTarget.label,
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
  `# ${lineTarget.label} API 정보 차이 감사`,
  '',
  `- 수집 시각: ${collectedAt.toISOString()}`,
  `- 대상: ${stations.length}개 역`,
  `- 차이가 기록된 역: ${affectedStations.length}개`,
  `- 차이 항목: ${differences.length}건`,
  '- 판정 원칙: 어떤 API가 맞는지 결정하지 않고 API별 반환 값만 병기한다.',
  `- 상세 응답: [${lineTarget.artifactStem}-latest.json](../../data/research/line-sync/${lineTarget.artifactStem}-latest.json)`,
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
  ...(endpointCoverage.SeoulMetroFaciInfo?.rowCount === 0
    ? [
        '> 서울교통공사 승강기 가동현황 API가 이 노선의 역을 반환하지 않았다. 이 빈 값은 정답 오류가 아니라 API 제공 범위 차이로 기록한다.',
        '',
      ]
    : []),
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
  '## 권장 차량·문 선택 우선순위',
  '',
  '- `stationElevator`에 차량·문이 있으면 이 값을 우선한다.',
  '- `stationElevator`에 차량·문이 없을 때만 `stationElevatorCarNumber`를 사용한다.',
  '- 두 API 모두 차량·문이 없을 때만 사용자 확인 대상으로 남긴다.',
  '',
  `- stationElevator 선택: ${report.summary.preferredDoorSourceCounts.stationElevator}역`,
  `- stationElevatorCarNumber 대체: ${report.summary.preferredDoorSourceCounts.stationElevatorCarNumber}역`,
  `- 두 API 모두 없음: ${report.summary.preferredDoorSourceCounts.unavailable}역`,
  '',
  ...renderPreferredDoorGapTables(preferredDoorGuidance),
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
  '## 지원 노선 확대',
  '',
  `동일한 수집기에서 \`--line 1\`부터 \`--line 9\` 및 등록된 수도권 노선 식별자를 실행할 수 있다. 이번 결과는 ${lineTarget.label}만 포함한다.`,
);

await writeFile(markdownPath, `${markdown.join('\n')}\n`, 'utf8');

console.log(
  `${lineTarget.label} 감사 완료: ${affectedStations.length}개 역, ${differences.length}개 차이 항목`,
);
console.log(`보고서: ${path.relative(repositoryRoot, reportPath)}`);
console.log(`문서: ${path.relative(repositoryRoot, markdownPath)}`);
console.log(`원본: ${path.relative(repositoryRoot, rawDirectory)}`);

function uniqueDoorCandidates(candidates) {
  return [
    ...new Map(
      candidates.map((candidate) => [
        `${candidate.platformNumber ?? ''}:${candidate.door}:${candidate.location ?? ''}`,
        candidate,
      ]),
    ).values(),
  ];
}

function inferCandidatePlatforms({
  candidate,
  station,
  stations,
  stationPlatforms,
  nearbyCarRows,
}) {
  const location = compactStationName(candidate.location);
  const namedTarget = stations
    .filter((item) => stationIdentity(item) !== stationIdentity(station))
    .toSorted((left, right) => right.stinNm.length - left.stinNm.length)
    .find((item) => location.includes(compactStationName(item.stinNm)));
  let upDownCode = null;
  if (namedTarget) {
    if (namedTarget.stinConsOrdr < station.stinConsOrdr) upDownCode = '1';
    if (namedTarget.stinConsOrdr > station.stinConsOrdr) upDownCode = '2';
  }
  if (!upDownCode && /상행/.test(location)) upDownCode = '1';
  if (!upDownCode && /하행/.test(location)) upDownCode = '2';
  if (upDownCode) {
    const directionPlatforms = unique(
      stationPlatforms
        .filter((platform) => String(platform.updnDvCd) === upDownCode)
        .map((platform) => String(platform.plfNo)),
    );
    if (directionPlatforms.length > 0) return directionPlatforms;
  }

  return unique(
    nearbyCarRows
      .filter(
        (row) => `${row.carOrdr}-${row.carEtrcNo}` === candidate.door,
      )
      .map((row) => String(row.plfNo)),
  );
}

function renderPreferredDoorGapTables(guidance) {
  const unavailable = guidance.filter((station) => !station.source);
  const available = guidance.filter((station) => station.source);
  const unresolvedGaps = guidance.flatMap((station) =>
    station.candidates
      .filter((candidate) => candidate.gapStatus !== 'linked')
      .map((candidate) => ({ station, candidate })),
  );
  return [
    `### 우선순위로 선택한 권장 문·이격거리 (${available.length}역)`,
    '',
    '| 역 | 우선 API | 권장 문·승강장·이격거리 |',
    '| --- | --- | --- |',
    ...available.map((station) => {
      const candidates = station.candidates
        .map((candidate) => {
          const position = candidate.location
            ? candidate.location
            : `${candidate.inferredPlatformNumbers.join(', ')}번 승강장`;
          const gaps =
            candidate.gaps.length > 0
              ? candidate.gaps
                  .map(
                    (gap) =>
                      `${gap.platformNumber}번 승강장 ${gap.distanceCm ?? '값 없음'}cm${gap.level ? ` ${gap.level}` : ''}`,
                  )
                  .join(', ')
              : '이격거리 없음';
          return `${position} · ${candidate.door} → ${gaps}`;
        })
        .join('<br>');
      return `| ${station.stationName} (${station.stationCode}, ${station.railOperatorCode}) | ${station.source} | ${candidates} |`;
    }),
    '',
    `### 두 API 모두 차량·문이 없는 역 (${unavailable.length}역)`,
    '',
    '| 역 | 상태 |',
    '| --- | --- |',
    ...(unavailable.length > 0
      ? unavailable.map(
          (station) =>
            `| ${station.stationName} (${station.stationCode}, ${station.railOperatorCode}) | stationElevator·stationElevatorCarNumber 모두 없음 |`,
        )
      : ['| 없음 | - |']),
    '',
    `### 권장 문 이격거리 연결 확인 (${unresolvedGaps.length}건)`,
    '',
    '| 역 | 우선 API | 권장 문 | 승강장 | 상태 |',
    '| --- | --- | --- | --- | --- |',
    ...(unresolvedGaps.length > 0
      ? unresolvedGaps.map(({ station, candidate }) => {
          const status =
            candidate.gapStatus === 'missing'
              ? '이격거리 레코드 없음'
              : candidate.gapStatus === 'value_missing'
                ? '이격거리 값 없음'
                : '복수 승강장의 이격거리가 달라 방향 연결 필요';
          return `| ${station.stationName} (${station.stationCode}, ${station.railOperatorCode}) | ${station.source} | ${candidate.door} | ${candidate.inferredPlatformNumbers.join(', ') || '미확인'} | ${status} |`;
        })
      : ['| 없음 | - | - | - | - |']),
    '',
  ];
}
