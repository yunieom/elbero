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

await writeFile(
  resolve('docs/research/metropolitan-user-verification-pending.md'),
  renderMarkdown(results),
  'utf8',
);

const detailed = results.filter((result) => result.status !== 'verified_supported');
console.log(
  `수도권 검증 목록 생성: ${results.length}개 노선, 상세 ${detailed.length}개 노선, 출구 ${sum(detailed, 'surfaceExitConflicts')}역, 차량·문 ${sum(detailed, 'directionDoorChecks')}역, 이격거리 ${sum(detailed, 'gapLinkageChecks')}역`,
);

function renderMarkdown(items) {
  const summaryRows = items
    .map((item) => {
      const counts = pendingCounts(item);
      return `| ${item.name} | ${statusLabel(item.status)} | ${formatDate(item.collectedAt)} | ${counts.surface} | ${counts.door} | ${counts.gap} | ${item.status === 'verified_supported' ? 0 : item.gapSummary.missing} |`;
    })
    .join('\n');
  const sections = items
    .filter((item) => item.status !== 'verified_supported')
    .map(renderLineSection)
    .join('\n\n');

  return `# 수도권 전철 사용자 검증 대기 목록

- 생성일: ${generatedAt}
- 근거: \`data/research/line-sync/*-latest.json\`에 저장된 KRIC·서울교통공사 API 응답
- 1호선 상태: **경로 엔진 지원 대상**. 현재 어댑터 연결 전이며, 아래 검증 항목을 원본 데이터로 확정해야 한다.
- 이미 반영 완료한 2·3·5·7호선은 상세 중복 목록에서 제외한다. 4호선의 남은 1건은 [지원 노선 검증 목록](supported-lines-user-verification-pending.md)에 유지한다.

## 판정 원칙

- 다른 운영기관 API가 해당 역을 반환하지 않는 것만으로는 검증 대상으로 잡지 않는다.
- 출처별 실제 값이 다를 때, \`stationElevatorCarNumber\`가 비어 방향별 차량·문을 정할 수 없을 때, 선택 문과 이격거리 레코드가 연결되지 않을 때만 기록한다.
- 운행 층은 기존 정책대로 \`stationElevator\`를 따르므로 별도 사용자 검증에서 제외한다.
- 저장된 응답의 수집일이 서로 다르므로 구현 직전 해당 노선만 재수집한다. 같은 전체 감사를 반복하지 않는다.

## 전체 노선 요약

| 노선 | 상태 | API 수집일 | 출구 충돌 | 차량·문 확인 | 이격거리 연결 | 이격거리 값 없음 |
| --- | --- | --- | ---: | ---: | ---: | ---: |
${summaryRows}

${sections}
`;
}

function renderLineSection(item) {
  const exitRows = item.surfaceExitConflicts.length
    ? item.surfaceExitConflicts
        .map(
          (station) =>
            `| ${stationLabel(station)} | ${formatSourceValues(station.sourceValues)} |`,
        )
        .join('\n')
    : '| 없음 | - |';
  const doorRows = item.directionDoorChecks.length
    ? item.directionDoorChecks
        .map(
          (station) =>
            `| ${stationLabel(station)} | ${doorReason(station)} | ${formatVerifiedDirections(station.verifiedDirections)} | ${formatSourceValues(station.sourceValues)} |`,
        )
        .join('\n')
    : '| 없음 | - | - | - |';
  const gapRows = item.gapLinkageChecks.length
    ? item.gapLinkageChecks
        .map(
          (station) => `| ${stationLabel(station)} | ${station.issue} |`,
        )
        .join('\n')
    : '| 없음 | - |';

  return `## ${item.name}

- API 수집: ${item.collectedAt}
- 대상 역: ${item.stationCount}개
- 상태: ${statusDescription(item.status)}

### 지상 엘리베이터 출구 충돌 (${item.surfaceExitConflicts.length}역)

| 역 | API별 값 |
| --- | --- |
${exitRows}

### 방향별 차량·문 확인 (${item.directionDoorChecks.length}역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
${doorRows}

### 승강장·문·이격거리 연결 확인 (${item.gapLinkageChecks.length}역)

| 역 | 확인할 내용 |
| --- | --- |
${gapRows}`;
}

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

function doorReason(station) {
  const reason =
    station.reason === 'source_value_conflict'
      ? 'API 값 충돌'
      : station.reason === 'source_value_conflict_and_primary_missing'
        ? 'API 값 충돌 + 기준 API 누락'
        : 'stationElevatorCarNumber 누락';
  return station.verifiedDirections.length > 0
    ? `${reason}; 나머지 방향 확인 필요`
    : reason;
}

function formatVerifiedDirections(directions = []) {
  return directions.length === 0
    ? '-'
    : directions
        .map(
          (direction) =>
            `${direction.toward}: ${(direction.recommendedDoors ?? []).join(', ')}`,
        )
        .join('<br>');
}

function formatSourceValues(values = {}) {
  const entries = Object.entries(values).filter(([, sourceValues]) =>
    Array.isArray(sourceValues) ? sourceValues.length > 0 : Boolean(sourceValues),
  );
  return entries.length === 0
    ? '후보 없음'
    : entries
        .map(([source, sourceValues]) =>
          `${source}: ${Array.isArray(sourceValues) ? sourceValues.join(', ') : sourceValues}`,
        )
        .join('<br>');
}

function stationLabel(station) {
  return `${station.stationName} (${station.stationCode}${station.railOperatorCode ? `, ${station.railOperatorCode}` : ''})`;
}

function statusLabel(status) {
  if (status === 'verified_supported') return '반영 완료';
  if (status === 'route_engine_target') return '경로 엔진 지원 대상';
  return '후속 지원 대상';
}

function statusDescription(status) {
  if (status === 'route_engine_target') {
    return '경로 엔진 지원 대상으로, 데이터 확정과 어댑터 연결이 필요함';
  }
  return '수도권 확대 지원 전 데이터 검증 필요';
}

function formatDate(value) {
  return String(value).slice(0, 10);
}

function differenceKey(category, stationCode, railOperatorCode) {
  return `${category}:${railOperatorCode ?? ''}:${normalizeCode(stationCode)}`;
}

function stationIdentity(station) {
  return `${station.railOperatorCode ?? ''}:${normalizeCode(station.stationCode)}`;
}

function pendingCounts(item) {
  if (item.status !== 'verified_supported') {
    return {
      surface: item.surfaceExitConflicts.length,
      door: item.directionDoorChecks.length,
      gap: item.gapLinkageChecks.length,
    };
  }
  return item.remaining ?? { surface: 0, door: 0, gap: 0 };
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
