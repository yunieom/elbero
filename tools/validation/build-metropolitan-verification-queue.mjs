import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const lineConfigs = [
  { name: '1호선', stem: 'line-1', status: 'verified_supported' },
  { name: '2호선', stem: 'line-2', status: 'verified_supported' },
  { name: '3호선', stem: 'line-3', status: 'verified_supported' },
  {
    name: '4호선',
    stem: 'line-4',
    status: 'verified_supported',
    remaining: { surface: 0, door: 0, gap: 1 },
  },
  { name: '5호선', stem: 'line-5', status: 'verified_supported' },
  { name: '6호선', stem: 'line-6', status: 'verified_supported' },
  { name: '7호선', stem: 'line-7', status: 'verified_supported' },
  { name: '8호선', stem: 'line-8', status: 'verified_supported' },
  { name: '9호선', stem: 'line-9', status: 'verified_supported' },
  {
    name: '공항철도',
    stem: 'airport-railroad',
    status: 'verified_supported',
    includeInDetails: true,
    remaining: { surface: 0, door: 0, gap: 0 },
  },
  { name: '인천 1호선', stem: 'incheon-line-1', status: 'future_target' },
  { name: '인천 2호선', stem: 'incheon-line-2', status: 'future_target' },
  { name: '신분당선', stem: 'shinbundang-line', status: 'route_engine_target' },
  { name: '에버라인', stem: 'everline', status: 'verified_supported' },
  {
    name: '김포골드라인',
    stem: 'gimpo-goldline',
    status: 'verified_supported',
  },
  { name: 'GTX-A', stem: 'gtx-a', status: 'route_engine_target' },
  {
    name: '인천공항 자기부상철도',
    stem: 'airport-maglev',
    status: 'future_target',
  },
  {
    name: '수인분당선',
    stem: 'suin-bundang-line',
    status: 'route_engine_target',
  },
  { name: '경춘선', stem: 'gyeongchun-line', status: 'future_target' },
  {
    name: '경의중앙선',
    stem: 'gyeongui-jungang-line',
    status: 'route_engine_target',
  },
  { name: '경강선', stem: 'gyeonggang-line', status: 'future_target' },
  { name: '서해선', stem: 'seohae-line', status: 'future_target' },
  { name: '신림선', stem: 'sillim-line', status: 'verified_supported' },
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
  const readiness = ['line-6', 'line-8', 'line-9'].includes(config.stem)
    ? await readOptionalJson(
        resolve(`data/verification/${config.stem}-api-consensus.json`),
      )
    : null;
  const manualSurfaceExits = new Map(
    (manual?.surfaceExits ?? []).map((station) => [
      normalizeCode(station.stationCode),
      station,
    ]),
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

  const resolvedSurfaceExits = [];
  const surfaceExitConflicts = audit.differences
    .filter(
      (difference) =>
        difference.category === 'surface_exit_number' &&
        difference.differenceKinds.includes('value_difference'),
    )
    .flatMap((difference) => {
      const stationCode = normalizeCode(difference.stationCode);
      const manualSurfaceExit = manualSurfaceExits.get(stationCode);
      const movementConsensus = matchingMovementExitValues(
        difference.normalizedValues,
      );
      const exitNumbers = manualSurfaceExit?.exitNumbers ?? movementConsensus;
      if (!exitNumbers) return [toSourceConflict(difference)];

      resolvedSurfaceExits.push({
        stationCode,
        stationName: difference.stationName,
        railOperatorCode: difference.railOperatorCode,
        exitNumbers,
        source: manualSurfaceExit
          ? 'manual_verification'
          : 'stationMovement_stinElevatorMovement_consensus',
        ...(manualSurfaceExit?.evidence
          ? { evidence: manualSurfaceExit.evidence }
          : {}),
      });
      return [];
    });

  const doorByStation = audit.preferredDoorGuidance
    ? new Map(
        audit.preferredDoorGuidance
          .filter((station) => !station.source)
          .map((station) => [
            stationIdentity(station),
            {
              stationCode: normalizeCode(station.stationCode),
              stationName: station.stationName,
              railOperatorCode: station.railOperatorCode,
              reason: 'both_door_apis_missing',
              sourceValues: {},
            },
          ]),
      )
    : buildLegacyDoorCheckMap({
        audit,
        differenceByKey,
        differenceByCategoryAndCode,
      });

  const manualDirections = new Map(
    (manual?.directionalDoors ?? []).map((station) => [
      station.railOperatorCode
        ? stationIdentity(station)
        : normalizeCode(station.stationCode),
      station.directions,
    ]),
  );
  const reviewedDirectionStations = new Set(
    (manual?.directionalDoorReviews ?? []).map((station) =>
      station.railOperatorCode
        ? stationIdentity(station)
        : normalizeCode(station.stationCode),
    ),
  );
  const readinessDirections = new Map(
    (readiness?.verifiedDirectionDoors ?? []).map((station) => [
      normalizeCode(station.stationCode),
      station.directions,
    ]),
  );
  const readinessPendingCodes = new Set(
    (readiness?.pendingDirectionDoorReview ?? []).map((station) =>
      normalizeCode(station.stationCode),
    ),
  );
  const manualGapOverrides = manual?.gapOverrides ?? [];
  const knownSourceGaps = manual?.knownSourceGaps ?? [];
  const resolvedGapRecords = [...manualGapOverrides, ...knownSourceGaps];
  const directionDoorChecks = [...doorByStation.values()]
    .map((station) => ({
      ...station,
      verifiedDirections:
        readinessDirections.get(station.stationCode) ??
        manualDirections.get(stationIdentity(station)) ??
        manualDirections.get(station.stationCode) ??
        [],
    }))
    .filter((station) => {
      if (readiness) return readinessPendingCodes.has(station.stationCode);
      if (
        reviewedDirectionStations.has(stationIdentity(station)) ||
        reviewedDirectionStations.has(station.stationCode)
      ) {
        return false;
      }
      if (station.verifiedDirections.length < 2) return true;
      return false;
    })
    .toSorted(stationSort);

  const gapLinkageChecks = audit.preferredDoorGuidance
    ? buildPreferredGapChecks(audit.preferredDoorGuidance, resolvedGapRecords)
    : audit.differences
        .filter(
          (difference) =>
            difference.category === 'platform_gap_linkage' &&
            !resolvedGapRecords.some(
              (override) =>
                normalizeCode(override.stationCode) ===
                normalizeCode(difference.stationCode),
            ),
        )
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
    resolvedSurfaceExits: resolvedSurfaceExits.toSorted(stationSort),
    surfaceExitConflicts: surfaceExitConflicts.toSorted(stationSort),
    directionDoorChecks,
    gapLinkageChecks,
    knownSourceGaps,
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
          '수동 확인값을 우선하고, stationMovement와 stinElevatorMovement가 일치하면 해당 값을 확정하며 나머지 출처 충돌만 사용자 확인',
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

const detailed = results.filter(
  (result) => result.status !== 'verified_supported' || result.includeInDetails,
);
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

function buildLegacyDoorCheckMap({
  audit,
  differenceByKey,
  differenceByCategoryAndCode,
}) {
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
      railOperatorCode:
        station.railOperatorCode ?? difference?.railOperatorCode,
      reason: existing
        ? 'source_value_conflict_and_primary_missing'
        : 'primary_api_missing',
      sourceValues:
        existing?.sourceValues ?? difference?.normalizedValues ?? {},
    });
  }
  return doorByStation;
}

function buildPreferredGapChecks(guidance, manualOverrides) {
  return guidance
    .flatMap((station) => {
      const unresolved = station.candidates.filter((candidate) => {
        if (candidate.gapStatus === 'linked') return false;
        return !manualOverrides.some(
          (override) =>
            normalizeCode(override.stationCode) ===
              normalizeCode(station.stationCode) &&
            (override.recommendedDoors ?? []).includes(candidate.door) &&
            ((override.platformNumbers ?? []).length === 0 ||
              candidate.inferredPlatformNumbers.length === 0 ||
              candidate.inferredPlatformNumbers.some((platform) =>
                (override.platformNumbers ?? []).includes(platform),
              )),
        );
      });
      if (unresolved.length === 0) return [];
      return [
        {
          stationCode: normalizeCode(station.stationCode),
          stationName: station.stationName,
          railOperatorCode: station.railOperatorCode,
          issue: unresolved
            .map((candidate) => {
              const platform =
                candidate.inferredPlatformNumbers.join(',') ||
                '방향 승강장 미확인';
              const status =
                candidate.gapStatus === 'platform_ambiguous'
                  ? '방향별 이격거리 확인 필요'
                  : candidate.gapStatus === 'value_missing'
                    ? '이격거리 값 없음'
                    : '이격거리 레코드 없음';
              return `${station.source} ${platform}:${candidate.door} ${status}`;
            })
            .join('; '),
        },
      ];
    })
    .toSorted(stationSort);
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

function uniqueSorted(values) {
  return [...new Set(values.map(String))].toSorted((left, right) =>
    left.localeCompare(right, 'ko', { numeric: true }),
  );
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
