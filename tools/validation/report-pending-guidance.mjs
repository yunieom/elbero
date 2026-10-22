import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const lineIds = ['2', '3', '4', '5', '7'];
const checkedAt = new Date().toISOString().slice(0, 10);
const sections = [];
let totalDirectionCount = 0;
let totalExitCount = 0;

const metropolitanQueue = await readOptionalJson(
  resolve('data/verification/metropolitan-verification-queue.json'),
);
const line1Pending = metropolitanQueue?.lines?.find(
  (line) => line.name === '1호선',
);
const line1Manual = await readOptionalJson(
  resolve('data/verification/line-1-manual-verification.json'),
);
const metropolitanSummary = renderMetropolitanSummary(
  metropolitanQueue?.lines ?? [],
);
const metropolitanExpansionSections = (metropolitanQueue?.lines ?? [])
  .filter(
    (line) =>
      (line.status !== 'verified_supported' || line.includeInDetails) &&
      !['1호선', '8호선', '9호선'].includes(line.name),
  )
  .map(renderMetropolitanLineSection);

for (const lineId of lineIds) {
  const module = await import(
    `../../apps/api/src/journey/data/line-${lineId}-guidance.generated.ts`
  );
  const data = module[`LINE_${lineId}_GUIDANCE`];
  const manual = await readOptionalJson(
    resolve(`data/verification/line-${lineId}-manual-verification.json`),
  );
  const manualExits = new Map(
    (manual?.surfaceExits ?? []).map((station) => [
      station.stationCode,
      station,
    ]),
  );

  const directions = data.stations.flatMap((station) =>
    station.directions
      .filter((direction) => needsDirectionVerification(direction))
      .map((direction) => ({
        stationCode: station.stationCode,
        stationName: station.stationName,
        toward: direction.toward,
        doors: direction.recommendedDoors,
        issue: directionIssue(direction),
      })),
  );
  const exits = data.stations
    .filter((station) => station.exitNumbers.length === 0)
    .filter((station) => {
      const manualExit = manualExits.get(station.stationCode);
      return ![
        'requires_interchange_guidance',
        'surface_elevator_unverified',
        'no_surface_elevator',
      ].includes(manualExit?.status);
    })
    .map((station) => ({
      stationCode: station.stationCode,
      stationName: station.stationName,
      issue:
        manualExits.get(station.stationCode)?.status ===
        'surface_elevator_unverified'
          ? '역사 진입용 지상 엘리베이터 유무 미확인'
          : '확정된 지상 엘리베이터 출구 번호 없음',
    }));

  totalDirectionCount += directions.length;
  totalExitCount += exits.length;
  sections.push(
    renderLineSection(lineId, directions, exits, manual?.knownSourceGaps ?? []),
  );
}

const expansionSections = [];
for (const lineId of ['8', '9']) {
  const readiness = await readOptionalJson(
    resolve(`data/verification/line-${lineId}-api-consensus.json`),
  );
  if (!readiness) continue;
  totalDirectionCount += readiness.pendingDirectionDoorReview.length;
  totalExitCount += readiness.pendingSurfaceExitConflicts.length;
  expansionSections.push(renderExpansionLineSection(readiness));
}

const output = `# 지원 노선 및 수도권 전철 사용자 검증 대기 목록

- 생성일: ${checkedAt}
- 사용자 검증값 반영 완료: 1·2·3·4·5·6·7·8·9호선·공항철도·용인에버라인·김포골드라인·신림선·신분당선·GTX-A
- 현재 경로 엔진 구현 완료: 1·2·3·4·5·6·7·8·9호선·공항철도·용인에버라인·김포골드라인·신림선·신분당선·GTX-A
- 1호선 상태: 분기형 경로 어댑터와 운영기관별 고유 역 코드 연결 완료
- 현재 구현 노선의 방향별 차량·문 또는 이격거리 확인 필요: ${totalDirectionCount}역·건
- 현재 구현 노선의 지상 엘리베이터 출구 확인 필요: ${totalExitCount}역

## 판정 기준

- 사용자가 이미 확정한 값과 서비스 정책으로 선택 가능한 API 충돌은 제외한다.
- 지상 엘리베이터 출구는 \`stationMovement\`와 \`stinElevatorMovement\`의 비어 있지 않은 값이 일치하면 해당 값을 우선 확정한다.
- 방향별 차량·문이 없거나, 선택한 문과 이격거리 레코드가 연결되지 않거나, 안전 경로 검증 상태가 거짓인 경우만 기록한다.
- 지상 엘리베이터 출구 번호가 없더라도 다른 호선 이용으로 확정한 역은 제외한다.
- 이 문서는 생성 데이터에서 자동 산출한다. 같은 감사를 반복하지 말고 \`npm run verification:pending-guidance\`로 갱신한다.

## 전체 노선 요약

| 노선 | 상태 | API 수집일 | 출구 충돌 | 차량·문 확인 | 이격거리 연결 | 원천 미제공 역 |
| --- | --- | --- | ---: | ---: | ---: | ---: |
${metropolitanSummary}

## 1호선 반영 상태

- 1호선은 경로 엔진과 모바일 역 검색에 연결되어 있다.
- 인천·신창·광명·서동탄 분기는 별도 운행 경로로 계산하며 필요한 경우 구로·금천구청·병점에서 같은 1호선 계통 환승을 안내한다.
- API 수집 대상: ${line1Pending?.stationCount ?? 0}역
- 사용자 방향별 차량·문 검토 반영: ${line1Manual?.directionalDoorReviews?.length ?? 0}역
- 사용자 이격거리 확인값 반영: ${line1Manual?.gapOverrides?.length ?? 0}역
- 지상 엘리베이터 출구 충돌: ${line1Pending?.surfaceExitConflicts?.length ?? 0}역
- 방향별 차량·문 확인: ${line1Pending?.directionDoorChecks?.length ?? 0}역
- 승강장·문·이격거리 연결 확인: ${line1Pending?.gapLinkageChecks?.length ?? 0}역
- 이격거리 값 없음: ${line1Pending?.gapSummary?.missing ?? 0}건
- 검토 완료값 원본: [1호선 사용자 검증 데이터](../../data/verification/line-1-manual-verification.json)

${renderMetropolitanTables(line1Pending)}

## 6·8·9호선 반영 상태

- 6호선은 응암순환 단방향과 응암↔신내 본선 경로를 분리해 경로 엔진과 앱에 연결했다.
- 8·9호선은 사용자 확인값과 API 합의값을 경로 엔진과 앱에 연결했다.
- 원천 이격거리 값이 없는 경우에는 안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내한다.

## 신분당선·GTX-A 반영 상태

- 신분당선 16개 역은 직통 경로와 기존 지원 노선 환승을 경로 엔진과 앱에 연결했다.
- GTX-A는 운정중앙–서울역과 수서–동탄을 서로 분리된 운행 구간으로 연결했다. 두 구간 사이의 미개통 연결은 경로로 생성하지 않는다.
- GTX-A에서 차량·문 원천값이 없는 역은 빠른 승하차 위치를 추정하지 않고 위치 미확인으로 안내한다.
- 검토 완료값 원본: [신분당선](../../data/verification/shinbundang-line-manual-verification.json), [GTX-A](../../data/verification/gtx-a-manual-verification.json)

${sections.join('\n\n')}

${expansionSections.join('\n\n')}

${metropolitanExpansionSections.join('\n\n')}
`;

await writeFile(
  resolve('docs/research/supported-lines-user-verification-pending.md'),
  output,
  'utf8',
);

console.log(
  `사용자 검증 대기 목록 생성: 방향 ${totalDirectionCount}건, 지상 출구 ${totalExitCount}역`,
);

function needsDirectionVerification(direction) {
  if (direction.sharedFacilityLine) return false;
  if (direction.verificationStatus === 'source_unavailable') return false;
  return (
    direction.recommendedDoors.length === 0 ||
    direction.accessibilityVerified === false ||
    (direction.gapVerificationStatus !== 'source_unavailable' &&
      (direction.doorGaps ?? []).some(({ gap }) => !gap))
  );
}

function directionIssue(direction) {
  if (direction.recommendedDoors.length === 0) return '차량·문 없음';
  if ((direction.doorGaps ?? []).some(({ gap }) => !gap)) {
    return `이격거리 연결 없음 (${direction.recommendedDoors.join(', ')})`;
  }
  return direction.warning ?? '안전 경로 검증 미완료';
}

function renderLineSection(lineId, directions, exits, knownSourceGaps) {
  const directionRows =
    directions.length > 0
      ? directions
          .map(
            ({ stationName, stationCode, toward, issue }) =>
              `| ${stationName} (${stationCode}) | ${toward} 방향 | ${issue} |`,
          )
          .join('\n')
      : '| 없음 | - | - |';
  const exitRows =
    exits.length > 0
      ? exits
          .map(
            ({ stationName, stationCode, issue }) =>
              `| ${stationName} (${stationCode}) | ${issue} |`,
          )
          .join('\n')
      : '| 없음 | - |';

  const sourceGapSection =
    knownSourceGaps.length === 0
      ? ''
      : `

### KRIC 원천 이격거리 미제공 (${knownSourceGaps.length}역)

| 역 | 방향·문 | 처리 |
| --- | --- | --- |
${knownSourceGaps
  .map(
    (station) =>
      `| ${station.stationName} (${station.stationCode}) | ${station.recommendedDoors.join(', ')} | 수치와 안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내 |`,
  )
  .join('\n')}`;

  return `## ${lineId}호선

### 방향별 차량·문·이격거리 (${directions.length}건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
${directionRows}

### 지상 엘리베이터 출구 (${exits.length}역)

| 역 | 확인할 내용 |
| --- | --- |
${exitRows}${sourceGapSection}`;
}

function renderExpansionLineSection(readiness) {
  const directionRows =
    readiness.pendingDirectionDoorReview.length > 0
      ? readiness.pendingDirectionDoorReview
          .map(
            ({
              stationName,
              stationCode,
              reason,
              sourceValues,
              verifiedDirections,
              remainingDirections,
            }) =>
              `| ${stationName} (${stationCode}) | ${expansionReason(reason)} | ${formatVerifiedDirections(verifiedDirections)} | ${remainingDirections?.join(', ') || '-'} | ${formatSourceValues(sourceValues)} |`,
          )
          .join('\n')
      : '| 없음 | - | - | - | - |';
  const exitRows =
    readiness.pendingSurfaceExitConflicts.length > 0
      ? readiness.pendingSurfaceExitConflicts
          .map(
            ({ stationName, stationCode, sourceValues }) =>
              `| ${stationName} (${stationCode}) | ${formatSourceValues(sourceValues)} |`,
          )
          .join('\n')
      : '| 없음 | - |';

  return `## ${readiness.line}호선 · 경로 엔진 연결 전

### 방향별 차량·문 (${readiness.pendingDirectionDoorReview.length}역)

| 역 | 확인 이유 | 확인 완료 방향 | 남은 방향 | API별 후보 |
| --- | --- | --- | --- | --- |
${directionRows}

### 지상 엘리베이터 출구 (${readiness.pendingSurfaceExitConflicts.length}역)

| 역 | API별 값 |
| --- | --- |
${exitRows}`;
}

function renderMetropolitanSummary(lines) {
  const statusOrder = {
    verified_supported: 0,
    route_engine_target: 1,
    future_target: 2,
  };
  return lines
    .map((line, index) => ({ line, index }))
    .toSorted(
      (left, right) =>
        (statusOrder[left.line.status] ?? 99) -
          (statusOrder[right.line.status] ?? 99) ||
        left.index - right.index,
    )
    .map(({ line }) => {
      const counts = metropolitanPendingCounts(line);
      const knownSourceGapStations = new Set(
        (line.knownSourceGaps ?? []).map(
          (station) =>
            `${station.railOperatorCode ?? ''}:${station.stationCode}`,
        ),
      ).size;
      return `| ${line.name} | ${metropolitanStatusLabel(line.status)} | ${String(line.collectedAt).slice(0, 10)} | ${counts.surface} | ${counts.door} | ${counts.gap} | ${knownSourceGapStations} |`;
    })
    .join('\n');
}

function renderMetropolitanLineSection(line) {
  return `## ${line.name} · ${line.status === 'verified_supported' ? '지원 중 · 알려진 데이터 공백' : metropolitanStatusDescription(line.status)}

- API 수집: ${line.collectedAt}
- 대상 역: ${line.stationCount}개

${renderMetropolitanTables(line)}`;
}

function renderMetropolitanTables(line) {
  if (!line) return '원본 검증 큐가 없어 상세 목록을 생성하지 못했습니다.';

  const exitRows = line.surfaceExitConflicts.length
    ? line.surfaceExitConflicts
        .map(
          (station) =>
            `| ${metropolitanStationLabel(station)} | ${formatSourceValues(station.sourceValues)} |`,
        )
        .join('\n')
    : '| 없음 | - |';
  const doorRows = line.directionDoorChecks.length
    ? line.directionDoorChecks
        .map(
          (station) =>
            `| ${metropolitanStationLabel(station)} | ${metropolitanDoorReason(station)} | ${formatVerifiedDirections(station.verifiedDirections)} | ${formatSourceValues(station.sourceValues)} |`,
        )
        .join('\n')
    : '| 없음 | - | - | - |';
  const gapRows = line.gapLinkageChecks.length
    ? line.gapLinkageChecks
        .map(
          (station) =>
            `| ${metropolitanStationLabel(station)} | ${station.issue} |`,
        )
        .join('\n')
    : '| 없음 | - |';

  return `### 지상 엘리베이터 출구 충돌 (${line.surfaceExitConflicts.length}역)

| 역 | API별 값 |
| --- | --- |
${exitRows}

### 방향별 차량·문 확인 (${line.directionDoorChecks.length}역)

| 역 | 이유 | 이미 확인한 방향 | API별 후보 |
| --- | --- | --- | --- |
${doorRows}

### 승강장·문·이격거리 연결 확인 (${line.gapLinkageChecks.length}역)

| 역 | 확인할 내용 |
| --- | --- |
${gapRows}${renderKnownSourceGaps(line)}`;
}

function renderKnownSourceGaps(line) {
  const rows = line.knownSourceGaps ?? [];
  if (rows.length === 0) return '';
  return `

### 원천 API 미제공 (${rows.length}역)

| 역 | 미제공 정보 | 처리 |
| --- | --- | --- |
${rows
  .map(
    (station) =>
      `| ${metropolitanStationLabel(station)} | 승강장 ${station.platformNumbers?.join(', ') ?? '-'} · ${station.recommendedDoors?.join(', ') ?? '-'} 문 이격거리 | 수치·안전 등급을 추정하지 않고 승강장 간격 미확인으로 안내 |`,
  )
  .join('\n')}`;
}

function metropolitanStationLabel(station) {
  return `${station.stationName} (${station.stationCode}${station.railOperatorCode ? `, ${station.railOperatorCode}` : ''})`;
}

function metropolitanDoorReason(station) {
  const reason =
    station.reason === 'both_door_apis_missing'
      ? 'stationElevator·stationElevatorCarNumber 모두 누락'
      : station.reason === 'source_value_conflict'
        ? 'API 값 충돌'
        : station.reason === 'source_value_conflict_and_primary_missing'
          ? 'API 값 충돌 + 기준 API 누락'
          : 'stationElevatorCarNumber 누락';
  return station.verifiedDirections.length > 0
    ? `${reason}; 나머지 방향 확인 필요`
    : reason;
}

function metropolitanStatusLabel(status) {
  if (status === 'verified_supported') return '반영 완료';
  if (status === 'route_engine_target') return '경로 엔진 지원 대상';
  return '후속 지원 대상';
}

function metropolitanStatusDescription(status) {
  return status === 'route_engine_target'
    ? '경로 엔진 연결 전'
    : '수도권 확대 지원 전';
}

function metropolitanPendingCounts(line) {
  if (line.status !== 'verified_supported') {
    return {
      surface: line.surfaceExitConflicts.length,
      door: line.directionDoorChecks.length,
      gap: line.gapLinkageChecks.length,
    };
  }
  return line.remaining ?? { surface: 0, door: 0, gap: 0 };
}

function formatSourceValues(sourceValues = {}) {
  const entries = Object.entries(sourceValues).filter(
    ([, values]) => values.length > 0,
  );
  return entries.length > 0
    ? entries
        .map(([source, values]) => `${source}: ${values.join(', ')}`)
        .join('<br>')
    : '후보 없음';
}

function expansionReason(reason) {
  if (reason === 'partial_direction_verified') return '일부 방향만 확인 완료';
  return reason === 'source_value_conflict'
    ? 'API 값 충돌'
    : '차량·문 API 값 없음';
}

function formatVerifiedDirections(directions = []) {
  return directions.length === 0
    ? '-'
    : directions
        .map(
          (direction) =>
            `${direction.toward}: ${direction.recommendedDoors.join(', ')}`,
        )
        .join('<br>');
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}
