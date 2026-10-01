import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const lineIds = ['2', '3', '4', '5', '7'];
const checkedAt = new Date().toISOString().slice(0, 10);
const sections = [];
let totalDirectionCount = 0;
let totalExitCount = 0;

for (const lineId of lineIds) {
  const module = await import(
    `../../apps/api/src/journey/data/line-${lineId}-guidance.generated.ts`
  );
  const data = module[`LINE_${lineId}_GUIDANCE`];
  const manual = await readOptionalJson(
    resolve(`data/verification/line-${lineId}-manual-verification.json`),
  );
  const manualExits = new Map(
    (manual?.surfaceExits ?? []).map((station) => [station.stationCode, station]),
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
  sections.push(renderLineSection(lineId, directions, exits));
}

const output = `# 지원 노선 사용자 검증 대기 목록

- 생성일: ${checkedAt}
- 대상: 2·3·4·5·7호선
- 방향별 차량·문 또는 이격거리 확인 필요: ${totalDirectionCount}건
- 지상 엘리베이터 출구 확인 필요: ${totalExitCount}역

## 판정 기준

- 사용자가 이미 확정한 값과 서비스 정책으로 선택 가능한 API 충돌은 제외한다.
- 방향별 차량·문이 없거나, 선택한 문과 이격거리 레코드가 연결되지 않거나, 안전 경로 검증 상태가 거짓인 경우만 기록한다.
- 지상 엘리베이터 출구 번호가 없더라도 다른 호선 이용으로 확정한 역은 제외한다.
- 이 문서는 생성 데이터에서 자동 산출한다. 같은 감사를 반복하지 말고 \`npm run verification:pending-guidance\`로 갱신한다.

${sections.join('\n\n')}
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
  return (
    direction.recommendedDoors.length === 0 ||
    direction.accessibilityVerified === false ||
    (direction.doorGaps ?? []).some(({ gap }) => !gap)
  );
}

function directionIssue(direction) {
  if (direction.recommendedDoors.length === 0) return '차량·문 없음';
  if ((direction.doorGaps ?? []).some(({ gap }) => !gap)) {
    return `이격거리 연결 없음 (${direction.recommendedDoors.join(', ')})`;
  }
  return direction.warning ?? '안전 경로 검증 미완료';
}

function renderLineSection(lineId, directions, exits) {
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

  return `## ${lineId}호선

### 방향별 차량·문·이격거리 (${directions.length}건)

| 역 | 진행 방향 | 확인할 내용 |
| --- | --- | --- |
${directionRows}

### 지상 엘리베이터 출구 (${exits.length}역)

| 역 | 확인할 내용 |
| --- | --- |
${exitRows}`;
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}
