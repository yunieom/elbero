import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');
const rawRoot = path.join(repositoryRoot, 'data/research/line-sync/raw');
const verificationPath = path.join(
  repositoryRoot,
  'data/verification/line-5-accessibility-guidance.json',
);
const reportPath = path.join(
  repositoryRoot,
  'data/research/line-sync/line-5-latest.json',
);
const manualOverridesPath = path.join(
  repositoryRoot,
  'data/verification/line-5-manual-overrides.json',
);
const surfaceExitsPath = path.join(
  repositoryRoot,
  'data/verification/line-5-surface-exits.json',
);
const runtimeDataPath = path.join(
  repositoryRoot,
  'apps/api/src/journey/data/line-5-guidance.generated.ts',
);

const rawDirectories = (await readdir(rawRoot, { withFileTypes: true }))
  .filter(
    (entry) => entry.isDirectory() && /^line-5-\d{4}-\d{2}-\d{2}T/.test(entry.name),
  )
  .map((entry) => entry.name)
  .sort();
const latestRawDirectory = rawDirectories.at(-1);
if (!latestRawDirectory) {
  throw new Error('5호선 원본 응답이 없습니다. 먼저 line-sync 감사를 실행하세요.');
}

const [
  raw,
  report,
  currentVerification,
  manifest,
  manualOverrides,
  surfaceExits,
] = await Promise.all([
  readJson(path.join(rawRoot, latestRawDirectory, 'kric.json')),
  readJson(reportPath),
  readJson(verificationPath),
  readJson(path.join(rawRoot, latestRawDirectory, 'manifest.json')),
  readJson(manualOverridesPath),
  readJson(surfaceExitsPath),
]);

if (report.collectedAt !== manifest.collectedAt) {
  throw new Error('최신 감사 보고서와 원본 응답의 수집 시각이 다릅니다.');
}

const line5Topologies = [
  [
    '2511',
    '2512',
    '2513',
    '2514',
    '2515',
    '2516',
    '2517',
    '2518',
    '2519',
    '2520',
    '2521',
    '2522',
    '2523',
    '2524',
    '2525',
    '2526',
    '2527',
    '2528',
    '2529',
    '2530',
    '2531',
    '2532',
    '2533',
    '2534',
    '2535',
    '2536',
    '2537',
    '2538',
    '2539',
    '2540',
    '2541',
    '2542',
    '2543',
    '2544',
    '2545',
    '2546',
    '2547',
    '2548',
    '2549',
    '2550',
    '2551',
    '2552',
    '2553',
    '2554',
    '2562',
    '2563',
    '2564',
    '2565',
    '2566',
  ],
  [
    '2511',
    '2512',
    '2513',
    '2514',
    '2515',
    '2516',
    '2517',
    '2518',
    '2519',
    '2520',
    '2521',
    '2522',
    '2523',
    '2524',
    '2525',
    '2526',
    '2527',
    '2528',
    '2529',
    '2530',
    '2531',
    '2532',
    '2533',
    '2534',
    '2535',
    '2536',
    '2537',
    '2538',
    '2539',
    '2540',
    '2541',
    '2542',
    '2543',
    '2544',
    '2545',
    '2546',
    '2547',
    '2548',
    '2549',
    '2555',
    '2556',
    '2557',
    '2558',
    '2559',
    '2560',
    '2561',
  ],
];

const stationItems = new Map(
  raw.stations.map((item) => [String(item.station.stinCd), item]),
);
const stationNames = new Map(
  raw.route.body.map((station) => [
    String(station.stinCd),
    normalizeStationName(station.stinNm),
  ]),
);
const stationOrder = new Map(
  raw.route.body.map((station, index) => [String(station.stinCd), index]),
);
const platformRows = raw.platforms.flatMap((payload) => payload.body ?? []);
const platformsByStation = Map.groupBy(platformRows, (row) => String(row.stinCd));
const gapRowsByStationPlatform = new Map(
  raw.gaps.map((item) => [
    `${item.stationCode}:${item.platformNumber}`,
    item.payload.body ?? [],
  ]),
);

const targetStations = raw.route.body.map((station) => ({
  stationCode: String(station.stinCd),
  stationName: normalizeStationName(station.stinNm),
}));
const auditDifferenceStationCount = new Set(
  report.differences
    .filter((difference) => difference.category === 'elevator_adjacent_car_door')
    .map((difference) => String(difference.stationCode)),
).size;
const manualStations = new Map(
  manualOverrides.stations.map((station) => [station.stationCode, station]),
);
const verifiedSurfaceExits = new Map(
  surfaceExits.verifiedStations.map((station) => [
    station.stationCode,
    station.exitNumbers,
  ]),
);

const generatedStations = [];
const unresolvedStations = [];
const partialStations = [];

for (const station of targetStations) {
  const manual = manualStations.get(station.stationCode);
  if (manual) {
    generatedStations.push(enrichManualStation(manual));
    if (manual.status === 'partial') {
      partialStations.push({
        stationCode: manual.stationCode,
        stationName: manual.stationName,
        issues: manual.issues ?? [{ reason: 'manual_partial' }],
      });
    }
    continue;
  }

  const stationItem = stationItems.get(station.stationCode);
  const nearbyCars = stationItem?.nearbyCars?.body ?? [];
  if (nearbyCars.length === 0) {
    unresolvedStations.push({
      ...station,
      reason: 'stationElevatorCarNumber_empty',
    });
    generatedStations.push({
      stationCode: station.stationCode,
      stationName: station.stationName,
      verificationMethod: 'api_missing',
      directions: [],
    });
    continue;
  }

  const stationPlatforms = platformsByStation.get(station.stationCode) ?? [];
  const nearbyCarsByPlatform = Map.groupBy(nearbyCars, (row) => String(row.plfNo));
  const directions = [];
  const stationIssues = [];

  for (const platform of stationPlatforms.sort(
    (left, right) => Number(left.plfNo) - Number(right.plfNo),
  )) {
    const platformNumber = String(platform.plfNo);
    const sourceRows = nearbyCarsByPlatform.get(platformNumber) ?? [];
    if (sourceRows.length === 0) {
      stationIssues.push({
        platformNumber,
        reason: 'stationElevatorCarNumber_platform_empty',
      });
      continue;
    }

    const direction = resolveDirection(
      station.stationCode,
      String(platform.runDirTmnStinCd),
      String(platform.updnDvCd),
    );
    if (!direction) {
      stationIssues.push({
        platformNumber,
        reason: 'platform_direction_unresolved',
      });
      continue;
    }
    if (!direction.matchesApiDirectionCode) {
      stationIssues.push({
        platformNumber,
        reason: 'platform_direction_conflict',
        upDownCode: String(platform.updnDvCd),
        terminalCode: String(platform.runDirTmnStinCd),
      });
    }

    const gapRows =
      gapRowsByStationPlatform.get(`${station.stationCode}:${platformNumber}`) ?? [];
    const stairRows = (stationItem?.nearbyStairs?.body ?? []).filter(
      (row) => String(row.plfNo) === platformNumber,
    );
    const doorDecisions = uniqueDoors(sourceRows).map((sourceDoor) =>
      decideDoor(sourceDoor, gapRows, stairRows),
    );
    const recommendedDoors = unique(
      doorDecisions.map((decision) => decision.recommendedDoor).filter(Boolean),
    );
    for (const directionIssue of doorDecisions.filter(
      (decision) => decision.recommendedDoor === null,
    )) {
      stationIssues.push({
        platformNumber,
        reason: directionIssue.decision,
        sourceDoors: [directionIssue.sourceDoor],
      });
    }

    directions.push({
      toward: direction.nextStationName,
      platformNumber,
      apiUpDownCode: String(platform.updnDvCd),
      apiTerminalCode: direction.terminalCode,
      apiTerminalName: direction.terminalName,
      sourceDoors: doorDecisions.map((decision) => decision.sourceDoor),
      recommendedDoors,
      decision: summarizeDoorDecisions(doorDecisions),
      doorDecisions,
    });
  }

  generatedStations.push({
    stationCode: station.stationCode,
    stationName: station.stationName,
    verificationMethod: 'api_platform_linkage',
    directions,
  });
  if (stationIssues.length > 0) {
    partialStations.push({ ...station, issues: stationIssues });
  }
}

generatedStations.sort(
  (left, right) =>
    (stationOrder.get(left.stationCode) ?? Number.MAX_SAFE_INTEGER) -
      (stationOrder.get(right.stationCode) ?? Number.MAX_SAFE_INTEGER) ||
    left.stationCode.localeCompare(right.stationCode),
);

const nextVerification = {
  ...currentVerification,
  decisionDate: new Date().toISOString().slice(0, 10),
  auditCollectedAt: manifest.collectedAt,
  status: unresolvedStations.length > 0 || partialStations.length > 0 ? 'partial' : 'complete',
  sourceSelection: {
    ...currentVerification.sourceSelection,
    elevatorAdjacentCarDoor: {
      ...currentVerification.sourceSelection.elevatorAdjacentCarDoor,
      status:
        unresolvedStations.length > 0 || partialStations.length > 0
          ? 'partial'
          : 'complete',
    },
  },
  directionalBoarding: generatedStations,
  coverage: {
    stationCount: targetStations.length,
    auditDifferenceStationCount,
    directionRecordedStationCount: generatedStations.length,
    directionCompleteStationCount:
      generatedStations.length -
      partialStations.length -
      unresolvedStations.length,
    partiallyResolvedStationCount: partialStations.length,
    unresolvedStationCount: unresolvedStations.length,
  },
  partiallyResolvedStations: partialStations,
  unresolvedStations,
};

await writeFile(
  verificationPath,
  `${JSON.stringify(nextVerification, null, 2)}\n`,
  'utf8',
);

const runtimeData = {
  dataVersion: `${manifest.collectedAt}.manual-${manualOverrides.verifiedAt}`,
  verifiedAt: manualOverrides.verifiedAt,
  policy: manualOverrides.policy,
  topologies: line5Topologies,
  stations: generatedStations.map((station) =>
    toRuntimeStation(station, stationItems.get(station.stationCode)),
  ),
};
await writeFile(
  runtimeDataPath,
  `// Generated by tools/kric/update-line5-accessibility-guidance.mjs.\nexport const LINE_5_GUIDANCE = ${JSON.stringify(runtimeData, null, 2)} as const;\n`,
  'utf8',
);

const redOverrideCount = generatedStations
  .flatMap((station) => station.directions)
  .flatMap((direction) => direction.doorDecisions ?? [])
  .filter((decision) => decision.decision === 'red_gap_adjacent_override').length;

console.log(`5호선 방향별 승강기 안내 ${generatedStations.length}개 역을 기록했습니다.`);
console.log(`완료 ${nextVerification.coverage.directionCompleteStationCount}개 역`);
console.log(`부분 확인 ${partialStations.length}개 역`);
console.log(`API 값 없음 ${unresolvedStations.length}개 역`);
console.log(`red 인접 문 대체 ${redOverrideCount}건`);

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function normalizeStationName(name) {
  const normalized = String(name ?? '').replace(/\([^)]*\)/g, '').trim();
  return normalized === '하남검단산역' ? '하남검단산' : normalized;
}

function resolveDirection(stationCode, terminalCode, upDownCode) {
  let topology = line5Topologies.find(
    (candidate) =>
      candidate.includes(stationCode) && candidate.includes(terminalCode),
  );
  if (!topology) {
    topology = line5Topologies.find((candidate) => {
      const index = candidate.indexOf(stationCode);
      if (index === -1) return false;
      return upDownCode === '1' ? index > 0 : index < candidate.length - 1;
    });
  }
  if (!topology) return null;
  const stationIndex = topology.indexOf(stationCode);
  const apiTerminalIndex = topology.indexOf(terminalCode);
  const expectedTerminalIndex = upDownCode === '1' ? 0 : topology.length - 1;
  const terminalIndex =
    apiTerminalIndex === -1 ||
    (upDownCode === '1' && apiTerminalIndex > stationIndex) ||
    (upDownCode === '2' && apiTerminalIndex < stationIndex)
      ? expectedTerminalIndex
      : apiTerminalIndex;
  const nextIndex =
    stationIndex === terminalIndex
      ? stationIndex
      : stationIndex + Math.sign(terminalIndex - stationIndex);
  const nextStationCode = topology[nextIndex];
  const apiDirectionSign = upDownCode === '1' ? -1 : upDownCode === '2' ? 1 : 0;
  const routeDirectionSign = Math.sign(apiTerminalIndex - stationIndex);
  return {
    terminalCode,
    terminalName: stationNames.get(terminalCode) ?? terminalCode,
    nextStationCode,
    nextStationName: stationNames.get(nextStationCode) ?? nextStationCode,
    matchesApiDirectionCode:
      apiTerminalIndex !== -1 &&
      (routeDirectionSign === 0 || apiDirectionSign === routeDirectionSign),
  };
}

function uniqueDoors(rows) {
  return unique(rows.map((row) => `${row.carOrdr}-${row.carEtrcNo}`));
}

function unique(values) {
  return [...new Set(values)].sort((left, right) =>
    String(left).localeCompare(String(right), 'ko', { numeric: true }),
  );
}

function enrichManualStation(station) {
  const stationItem = stationItems.get(station.stationCode);
  const stairRows = stationItem?.nearbyStairs?.body ?? [];
  return {
    ...station,
    verificationMethod: 'manual_direction_assignment',
    directions: station.directions.map((direction) => {
      const gapRows = direction.platformNumber
        ? (gapRowsByStationPlatform.get(
            `${station.stationCode}:${direction.platformNumber}`,
          ) ?? [])
        : [...gapRowsByStationPlatform.entries()]
            .filter(([key]) => key.startsWith(`${station.stationCode}:`))
            .flatMap(([, rows]) => rows);
      const platformStairs = direction.platformNumber
        ? stairRows.filter(
            (row) => String(row.plfNo) === direction.platformNumber,
          )
        : stairRows;
      const doorDecisions = direction.sourceDoors.map((sourceDoor, index) => {
        const providedDoor =
          direction.recommendedDoors[index] ??
          (direction.recommendedDoors.length === 1
            ? direction.recommendedDoors[0]
            : sourceDoor);
        const sourceGapRow = gapRows.find((row) => doorOf(row) === sourceDoor);
        const recommendedGapRow = gapRows.find(
          (row) => doorOf(row) === providedDoor,
        );
        if (direction.allowUnknownGap && !recommendedGapRow) {
          return {
            sourceDoor,
            sourceGap: sourceGapRow ? toGap(sourceGapRow.sfDst) : null,
            recommendedDoor: providedDoor,
            recommendedGap: null,
            decision: 'manual_override_gap_unknown',
          };
        }
        if (providedDoor !== sourceDoor) {
          return {
            sourceDoor,
            sourceGap: sourceGapRow ? toGap(sourceGapRow.sfDst) : null,
            recommendedDoor:
              recommendedGapRow && recommendedGapRow.sfDst > 15
                ? null
                : providedDoor,
            recommendedGap: recommendedGapRow
              ? toGap(recommendedGapRow.sfDst)
              : null,
            decision: direction.decision ?? 'manual_override',
          };
        }
        return decideDoor(
          sourceDoor,
          gapRows,
          platformStairs,
          direction.avoidDoorsNearStairs ?? [],
        );
      });
      return {
        ...direction,
        recommendedDoors: unique(
          doorDecisions
            .map((decision) => decision.recommendedDoor)
            .filter(Boolean),
        ),
        decision:
          direction.decision ?? summarizeDoorDecisions(doorDecisions),
        doorDecisions,
      };
    }),
  };
}

function toRuntimeStation(station, stationItem) {
  const sourceExitNumbers = unique(
    (stationItem?.elevators?.body ?? [])
      .flatMap((elevator) => String(elevator.exitNo ?? '').split(','))
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return {
    stationCode: station.stationCode,
    stationName: station.stationName,
    exitNumbers:
      verifiedSurfaceExits.get(station.stationCode) ?? sourceExitNumbers,
    verificationMethod: station.verificationMethod,
    directions: station.directions.map((direction) => ({
      toward: direction.toward,
      platformNumber: direction.platformNumber ?? null,
      recommendedDoors: direction.recommendedDoors,
      doorGaps: (direction.doorDecisions ?? [])
        .filter((decision) => decision.recommendedDoor)
        .map((decision) => ({
          door: decision.recommendedDoor,
          gap: decision.recommendedGap,
        })),
      accessibilityVerified:
        direction.recommendedDoors.length > 0 &&
        !(direction.doorDecisions ?? []).some(
          (decision) =>
            decision.recommendedDoor && !decision.recommendedGap,
        ),
      warning:
        direction.recommendedDoors.length === 0
          ? '엘리베이터 안전 경로 미확인'
          : (direction.doorDecisions ?? []).some(
                (decision) =>
                  decision.recommendedDoor && !decision.recommendedGap,
              )
            ? '승강장 이격거리 미확인'
            : null,
    })),
  };
}

function decideDoor(
  sourceDoor,
  gapRows,
  stairRows = [],
  manualAvoidDoors = [],
) {
  const sourceGapRow = gapRows.find((row) => doorOf(row) === sourceDoor);
  if (!sourceGapRow || !Number.isFinite(sourceGapRow.sfDst)) {
    return {
      sourceDoor,
      sourceGap: null,
      recommendedDoor: null,
      recommendedGap: null,
      decision: 'gap_unknown',
    };
  }

  const sourceGap = toGap(sourceGapRow.sfDst);
  if (sourceGap.level !== 'red') {
    return {
      sourceDoor,
      sourceGap,
      recommendedDoor: sourceDoor,
      recommendedGap: sourceGap,
      decision: 'source_door_acceptable',
    };
  }

  const sourceOrdinal = doorOrdinal(sourceGapRow.carOrdr, sourceGapRow.carEtrcNo);
  const stairOrdinals = [
    ...stairRows.map((row) => doorOrdinal(row.carOrdr, row.carEtrcNo)),
    ...manualAvoidDoors.map((door) => doorOrdinalFromText(door)),
  ];
  const adjacent = gapRows
    .filter(
      (row) =>
        Number.isFinite(row.sfDst) &&
        row.sfDst <= 15 &&
        Math.abs(doorOrdinal(row.carOrdr, row.carEtrcNo) - sourceOrdinal) === 1,
    )
    .sort(
      (left, right) =>
        distanceFromNearestHazard(right, stairOrdinals) -
          distanceFromNearestHazard(left, stairOrdinals) ||
        left.sfDst - right.sfDst ||
        doorOrdinal(left.carOrdr, left.carEtrcNo) -
          doorOrdinal(right.carOrdr, right.carEtrcNo),
    )[0];

  if (!adjacent) {
    return {
      sourceDoor,
      sourceGap,
      recommendedDoor: null,
      recommendedGap: null,
      decision: 'no_acceptable_adjacent_door',
    };
  }

  return {
    sourceDoor,
    sourceGap,
    recommendedDoor: doorOf(adjacent),
    recommendedGap: toGap(adjacent.sfDst),
    decision: 'red_gap_adjacent_override',
  };
}

function summarizeDoorDecisions(decisions) {
  if (decisions.some((decision) => decision.recommendedDoor === null)) {
    return 'partial_gap_unknown';
  }
  if (
    decisions.some(
      (decision) => decision.decision === 'red_gap_adjacent_override',
    )
  ) {
    return 'red_gap_adjacent_override';
  }
  return 'stationElevatorCarNumber';
}

function doorOf(row) {
  return `${row.carOrdr}-${row.carEtrcNo}`;
}

function doorOrdinal(carNumber, doorNumber) {
  return (Number(carNumber) - 1) * 4 + Number(doorNumber);
}

function doorOrdinalFromText(door) {
  const [carNumber, doorNumber] = String(door).split('-').map(Number);
  return doorOrdinal(carNumber, doorNumber);
}

function distanceFromNearestHazard(row, hazardOrdinals) {
  if (hazardOrdinals.length === 0) return 0;
  const ordinal = doorOrdinal(row.carOrdr, row.carEtrcNo);
  return Math.min(
    ...hazardOrdinals.map((hazardOrdinal) =>
      Math.abs(ordinal - hazardOrdinal),
    ),
  );
}

function toGap(distanceCm) {
  if (distanceCm <= 10) {
    return { distanceCm, level: 'green', label: '안전' };
  }
  if (distanceCm <= 15) {
    return { distanceCm, level: 'yellow', label: '유의' };
  }
  return { distanceCm, level: 'red', label: '추천하지 않음' };
}
