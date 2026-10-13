import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const lineIds = ['8', '9'];
const results = [];

for (const lineId of lineIds) {
  const rawDirectory = await findLatestRawDirectory(lineId);
  const [raw, audit] = await Promise.all([
    readJson(resolve(rawDirectory, 'kric.json')),
    readJson(resolve(`data/research/line-sync/line-${lineId}-latest.json`)),
  ]);
  const manual = await readOptionalJson(
    resolve(`data/verification/line-${lineId}-manual-verification.json`),
  );
  const manualDirectionByCode = new Map(
    (manual?.directionalDoors ?? []).map((station) => [
      normalizeCode(station.stationCode),
      station,
    ]),
  );
  const manualSurfaceExitByCode = new Map(
    (manual?.surfaceExits ?? []).map((station) => [
      normalizeCode(station.stationCode),
      station,
    ]),
  );
  const differenceByCategory = Map.groupBy(
    audit.differences,
    (difference) => difference.category,
  );
  const surfaceDifferenceByCode = new Map(
    (differenceByCategory.get('surface_exit_number') ?? []).map((difference) => [
      normalizeCode(difference.stationCode),
      difference,
    ]),
  );
  const doorDifferenceByCode = new Map(
    (differenceByCategory.get('elevator_adjacent_car_door') ?? []).map(
      (difference) => [normalizeCode(difference.stationCode), difference],
    ),
  );
  const rawStationByCode = new Map(
    raw.stations.map((station) => [
      normalizeCode(station.station.stinCd),
      station,
    ]),
  );
  const coverageByCode = new Map(
    audit.coverage.map((station) => [
      normalizeCode(station.stationCode),
      station,
    ]),
  );

  const autoSurfaceExits = [];
  const pendingSurfaceExitConflicts = [];
  const autoAdjacentDoorCandidates = [];
  const pendingDirectionDoorReview = [];
  const verifiedDirectionDoors = [];

  for (const routeStation of raw.route.body) {
    const stationCode = normalizeCode(routeStation.stinCd);
    const stationName = normalizeStationName(routeStation.stinNm);
    const rawStation = rawStationByCode.get(stationCode);
    const surfaceDifference = surfaceDifferenceByCode.get(stationCode);
    const doorDifference = doorDifferenceByCode.get(stationCode);
    const hasSurfaceConflict =
      surfaceDifference?.differenceKinds.includes('value_difference') ?? false;
    const manualSurfaceExit = manualSurfaceExitByCode.get(stationCode);
    const movementConsensus = matchingMovementExitValues(
      surfaceDifference?.normalizedValues,
    );
    const surfaceValues =
      manualSurfaceExit?.exitNumbers ??
      movementConsensus ??
      (hasSurfaceConflict
        ? []
        : firstNonEmptySourceValues(surfaceDifference?.normalizedValues) ??
        extractMovementExitNumbers(rawStation?.movement?.body ?? []) ??
        extractElevatorExitNumbers(rawStation?.elevators?.body ?? []));

    if (surfaceValues.length === 0) {
      pendingSurfaceExitConflicts.push({
        stationCode,
        stationName,
        reason: hasSurfaceConflict ? 'source_value_conflict' : 'no_source_value',
        sourceValues: surfaceDifference?.normalizedValues ?? {},
      });
    } else {
      autoSurfaceExits.push({
        stationCode,
        stationName,
        exitNumbers: surfaceValues,
        status: manualSurfaceExit
          ? 'manual_verification'
          : movementConsensus
            ? 'movement_api_consensus'
            : 'source_consensus_candidate',
        ...(manualSurfaceExit?.evidence
          ? { evidence: manualSurfaceExit.evidence }
          : {}),
      });
    }

    const nearbyCars = rawStation?.nearbyCars?.body ?? [];
    const hasDoorConflict =
      doorDifference?.differenceKinds.includes('value_difference') ?? false;
    const hasCarNumberSource =
      (coverageByCode.get(stationCode)?.endpointCounts
        ?.stationElevatorCarNumber ?? 0) > 0;
    const manualDirection = manualDirectionByCode.get(stationCode);
    const adjacentDirections = getAdjacentDirections(raw.route.body, stationCode);
    const groupedNearbyCars = groupDoorsByPlatform(nearbyCars);
    const stationElevatorDirections =
      lineId === '9'
        ? mapLine9StationElevatorDirections(
            adjacentDirections,
            doorDifference?.normalizedValues?.stationElevator ?? [],
          )
        : [];
    const platformCandidateDirections =
      lineId === '9'
        ? mapLine9PlatformDoorDirections(
            adjacentDirections,
            groupedNearbyCars,
          )
        : [];
    const confirmedDirections = (
      manualDirection?.directions ??
      (stationElevatorDirections.length > 0
        ? stationElevatorDirections
        : platformCandidateDirections)
    ).map(
      (direction) => ({
        toward: direction.toward,
        recommendedDoors: direction.recommendedDoors,
        ...(direction.evidence ? { evidence: direction.evidence } : {}),
      }),
    );
    const confirmedToward = new Set(
      confirmedDirections.map((direction) => direction.toward),
    );
    const remainingDirections = adjacentDirections
      .map((direction) => direction.toward)
      .filter((toward) => !confirmedToward.has(toward));
    if (confirmedDirections.length > 0) {
      verifiedDirectionDoors.push({
        stationCode,
        stationName,
        directions: confirmedDirections,
      });
    }
    if (hasDoorConflict || !hasCarNumberSource || nearbyCars.length === 0) {
      if (remainingDirections.length > 0 || confirmedDirections.length === 0) {
        pendingDirectionDoorReview.push({
          stationCode,
          stationName,
          reason:
            confirmedDirections.length > 0
              ? 'partial_direction_verified'
              : hasDoorConflict
                ? 'source_value_conflict'
                : 'station_elevator_car_number_missing',
          remainingDirections,
          verifiedDirections: confirmedDirections,
          sourceValues: doorDifference?.normalizedValues ?? {},
        });
      }
    } else {
      autoAdjacentDoorCandidates.push({
        stationCode,
        stationName,
        platforms: groupedNearbyCars,
        status:
          platformCandidateDirections.length > 0
            ? 'platform_direction_mapped'
            : 'platform_direction_mapping_required',
      });
    }
  }

  const result = {
    schemaVersion: 1,
    line: lineId,
    sourceCollectedAt: audit.collectedAt,
    generatedAt: new Date().toISOString(),
    routeEngineSupported: false,
    policy: {
      autoSurfaceExit:
        '수동 확인값을 우선하고, stationMovement와 stinElevatorMovement가 일치하면 다른 시설 API와 충돌해도 해당 이동경로 값을 후보로 저장',
      autoAdjacentDoor:
        'stationElevatorCarNumber가 있고 다른 API와 값 충돌이 없을 때만 승강장별 후보로 저장',
      line9StationElevatorDirection:
        '9호선 stationElevator 후보는 첫 값을 개화 쪽 인접역 방향, 두 번째 값을 중앙보훈병원 쪽 인접역 방향에 연결하며 단일 값은 양방향에 적용',
      line9PlatformDirection:
        '9호선 stationElevatorCarNumber 승강장 후보는 앞 플랫폼을 개화 쪽 인접역 방향, 뒤 플랫폼을 중앙보훈병원 쪽 인접역 방향에 연결',
      productionUse:
        '사용자 방향 검증과 경로 엔진 연결 전에는 안전 경로 추천에 사용하지 않음',
    },
    gapSummary: audit.summary.gapSummary,
    autoSurfaceExits,
    pendingSurfaceExitConflicts,
    autoAdjacentDoorCandidates,
    verifiedDirectionDoors,
    pendingDirectionDoorReview,
  };
  results.push(result);
  await writeFile(
    resolve(`data/verification/line-${lineId}-api-consensus.json`),
    `${JSON.stringify(result, null, 2)}\n`,
    'utf8',
  );
}

await writeFile(
  resolve('docs/research/line-8-9-guidance-readiness.md'),
  renderMarkdown(results),
  'utf8',
);

for (const result of results) {
  console.log(
    `${result.line}호선 준비: 출구 자동 후보 ${result.autoSurfaceExits.length}역, 출구 확인 ${result.pendingSurfaceExitConflicts.length}역, 차량·문 자동 후보 ${result.autoAdjacentDoorCandidates.length}역, 방향 확인 ${result.pendingDirectionDoorReview.length}역`,
  );
}

function renderMarkdown(items) {
  const sections = items.map((item) => {
    const exitRows = item.pendingSurfaceExitConflicts
      .map(
        (station) =>
          `| ${station.stationName} (${station.stationCode}) | ${formatSourceValues(station.sourceValues)} |`,
      )
      .join('\n');
    const doorRows = item.pendingDirectionDoorReview
      .map(
        (station) =>
          `| ${station.stationName} (${station.stationCode}) | ${reasonLabel(station.reason)} | ${station.remainingDirections?.join(', ') || '-'} | ${formatSourceValues(station.sourceValues)} |`,
      )
      .join('\n');
    const verifiedDoorRows = item.verifiedDirectionDoors
      .flatMap((station) =>
        station.directions.map(
          (direction) =>
            `| ${station.stationName} (${station.stationCode}) | ${direction.toward} 방면 | ${direction.recommendedDoors.join(', ')} | ${direction.evidence ?? '사용자 확인'} |`,
        ),
      )
      .join('\n');
    const gaps = item.gapSummary;
    return `## ${item.line}호선

- 경로 엔진 연결: 아직 지원하지 않음
- 자동 저장한 출구 합의 후보: ${item.autoSurfaceExits.length}역
- 출구 사용자 확인 필요: ${item.pendingSurfaceExitConflicts.length}역
- 승강장별 차량·문 자동 후보: ${item.autoAdjacentDoorCandidates.length}역
- 사용자 확인 완료 방향: ${item.verifiedDirectionDoors.reduce((count, station) => count + station.directions.length, 0)}건
- 방향별 차량·문 사용자 확인 필요: ${item.pendingDirectionDoorReview.length}역
- 이격거리: green ${gaps.green}, yellow ${gaps.yellow}, red ${gaps.red}, 값 없음 ${gaps.missing}

### 지상 엘리베이터 출구 확인 필요

| 역 | API별 값 |
| --- | --- |
${exitRows || '| 없음 | - |'}

### 방향별 차량·문 확인 필요

| 역 | 이유 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- |
${doorRows || '| 없음 | - | - | - |'}

### 사용자 확인 완료 차량·문

| 역 | 방향 | 차량·문 | 근거 |
| --- | --- | --- | --- |
${verifiedDoorRows || '| 없음 | - | - | - |'}`;
  });

  return `# 8·9호선 안내 데이터 준비 상태

- 생성일: ${new Date().toISOString().slice(0, 10)}
- 원칙: API 값이 충돌하지 않는 항목만 자동 후보로 저장하고, 충돌·누락은 사용자 확인 대상으로 남긴다.
- 자동 후보는 사용자 검증값이 아니며 8·9호선 경로 엔진 연결 전에는 안전 경로 추천에 사용하지 않는다.

${sections.join('\n\n')}
`;
}

function groupDoorsByPlatform(rows) {
  const grouped = Map.groupBy(rows, (row) => String(row.plfNo));
  return [...grouped.entries()]
    .map(([platformNumber, items]) => ({
      platformNumber,
      doors: [
        ...new Set(items.map((row) => `${row.carOrdr}-${row.carEtrcNo}`)),
      ].toSorted(numericTextSort),
    }))
    .toSorted((left, right) => numericTextSort(left.platformNumber, right.platformNumber));
}

function extractMovementExitNumbers(rows) {
  const values = rows.flatMap((row) =>
    `${row.stMovePath ?? ''} ${row.mvContDtl ?? ''}`
      .match(/\d+(?:-\d+)?(?=번\s*(?:출입구|출구))/gu) ?? [],
  );
  return uniqueSorted(values);
}

function extractElevatorExitNumbers(rows) {
  return uniqueSorted(
    rows.flatMap((row) => String(row.exitNo ?? '').match(/\d+(?:-\d+)?/gu) ?? []),
  );
}

function firstNonEmptySourceValues(values = {}) {
  for (const source of [
    'stationMovement',
    'stinElevatorMovement',
    'stationElevator',
    'SeoulMetroFaciInfo',
  ]) {
    if (values[source]?.length > 0) return uniqueSorted(values[source]);
  }
  return null;
}

function matchingMovementExitValues(values = {}) {
  const stationMovement = uniqueSorted(values.stationMovement ?? []);
  const elevatorMovement = uniqueSorted(values.stinElevatorMovement ?? []);
  if (stationMovement.length === 0 || elevatorMovement.length === 0) {
    return null;
  }
  return stationMovement.length === elevatorMovement.length &&
    stationMovement.every((value, index) => value === elevatorMovement[index])
    ? stationMovement
    : null;
}

function getAdjacentDirections(route, stationCode) {
  const index = route.findIndex(
    (station) => normalizeCode(station.stinCd) === stationCode,
  );
  if (index < 0) return [];
  return [
    index > 0
      ? {
          toward: normalizeStationName(route[index - 1].stinNm),
          terminalDirection: '개화',
        }
      : null,
    index < route.length - 1
      ? {
          toward: normalizeStationName(route[index + 1].stinNm),
          terminalDirection: '중앙보훈병원',
        }
      : null,
  ].filter(Boolean);
}

function mapLine9StationElevatorDirections(adjacentDirections, candidates) {
  const doors = uniqueSorted(candidates);
  if (doors.length === 0) return [];
  return adjacentDirections.map((direction) => ({
    toward: direction.toward,
    recommendedDoors: [
      doors.length === 1
        ? doors[0]
        : direction.terminalDirection === '개화'
          ? doors[0]
          : doors[1],
    ],
    evidence:
      'stationElevator 플랫폼 순서 정책 (앞: 개화 방면, 뒤: 중앙보훈병원 방면)',
  }));
}

function mapLine9PlatformDoorDirections(adjacentDirections, platforms) {
  if (platforms.length === 0) return [];
  return adjacentDirections.flatMap((direction) => {
    const platform =
      direction.terminalDirection === '개화'
        ? platforms[0]
        : platforms[1] ?? platforms[0];
    if (!platform || platform.doors.length === 0) return [];
    return [
      {
        toward: direction.toward,
        recommendedDoors: platform.doors,
        evidence:
          'stationElevatorCarNumber 플랫폼 순서 정책 (앞: 개화 방면, 뒤: 중앙보훈병원 방면)',
      },
    ];
  });
}

function formatSourceValues(values) {
  const entries = Object.entries(values ?? {}).filter(
    ([, sourceValues]) => sourceValues.length > 0,
  );
  return entries.length === 0
    ? '후보 없음'
    : entries
        .map(([source, sourceValues]) => `${source}: ${sourceValues.join(', ')}`)
        .join('<br>');
}

function reasonLabel(reason) {
  if (reason === 'partial_direction_verified') return '일부 방향만 확인 완료';
  return reason === 'source_value_conflict'
    ? 'API 값 충돌'
    : '차량·문 API 값 없음';
}

function uniqueSorted(values) {
  return [...new Set(values)].toSorted(numericTextSort);
}

function numericTextSort(left, right) {
  return String(left).localeCompare(String(right), 'ko', { numeric: true });
}

function normalizeCode(value) {
  const text = String(value);
  return /^\d+$/u.test(text) ? text.padStart(4, '0') : text;
}

function normalizeStationName(value) {
  return String(value).replace(/\([^)]*\)$/u, '');
}

async function findLatestRawDirectory(lineId) {
  const root = resolve('data/research/line-sync/raw');
  const directory = (await readdir(root, { withFileTypes: true }))
    .filter(
      (entry) => entry.isDirectory() && entry.name.startsWith(`line-${lineId}-`),
    )
    .map((entry) => entry.name)
    .toSorted()
    .at(-1);
  if (!directory) throw new Error(`${lineId}호선 원천 수집 데이터가 없습니다.`);
  return resolve(root, directory);
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
