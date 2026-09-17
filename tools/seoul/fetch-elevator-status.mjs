import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = 'http://openapi.seoul.go.kr:8088';
const SERVICE_NAME = 'SeoulMetroFaciInfo';
const PAGE_SIZE = 1_000;
const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');
const rawRoot = path.join(repositoryRoot, 'data/research/t02/raw');

for (const envFile of [
  path.join(repositoryRoot, '.env'),
  path.join(repositoryRoot, 'apps/api/.env'),
]) {
  if (process.env.SEOUL_OPEN_DATA_API_KEY) break;
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const apiKey = process.env.SEOUL_OPEN_DATA_API_KEY;
if (!apiKey) {
  throw new Error(
    'SEOUL_OPEN_DATA_API_KEY가 필요합니다. 루트 또는 apps/api/.env에 저장해 주세요.',
  );
}
if (/^https?:\/\//i.test(apiKey)) {
  throw new Error(
    'SEOUL_OPEN_DATA_API_KEY에 데이터셋 URL이 들어 있습니다. 서울 열린데이터광장에서 발급받은 인증키 문자열만 저장해 주세요.',
  );
}

function buildUrl(startIndex, endIndex) {
  return `${API_ROOT}/${encodeURIComponent(apiKey)}/json/${SERVICE_NAME}/${startIndex}/${endIndex}/`;
}

async function fetchPage(startIndex, endIndex) {
  const response = await fetch(buildUrl(startIndex, endIndex), {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(body);
  } catch {
    const code = body.match(/<CODE>([^<]+)<\/CODE>/)?.[1] ?? 'unknown';
    const message = body.match(/<MESSAGE>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/MESSAGE>/)?.[1]?.trim() ?? '';
    throw new Error(
      `서울 승강기 API가 JSON이 아닌 오류를 반환했습니다: HTTP ${response.status}, API ${code} ${message}`.trim(),
    );
  }
  const result = payload?.[SERVICE_NAME]?.RESULT;
  if (!response.ok || result?.CODE !== 'INFO-000') {
    throw new Error(
      `서울 승강기 API 호출 실패: HTTP ${response.status}, API ${result?.CODE ?? 'unknown'} ${result?.MESSAGE ?? ''}`.trim(),
    );
  }
  return payload[SERVICE_NAME];
}

const collectedAt = new Date();
const firstPage = await fetchPage(1, PAGE_SIZE);
const totalCount = firstPage.list_total_count;
const rows = [...(firstPage.row ?? [])];

for (let startIndex = PAGE_SIZE + 1; startIndex <= totalCount; startIndex += PAGE_SIZE) {
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const page = await fetchPage(startIndex, endIndex);
  rows.push(...(page.row ?? []));
}

const targetStations = ['답십리', '강동', '동대문역사문화공원', '을지로4가'];
const stationBaseName = (stationName) => stationName?.replace(/\(\d+\)$/, '') ?? '';
const targetRows = rows.filter((row) =>
  targetStations.includes(stationBaseName(row.STN_NM)),
);
const elevatorRows = rows.filter((row) => row.ELVTR_SE === 'EV');
const statusValues = [...new Set(rows.map((row) => row.USE_YN).filter(Boolean))].sort();
const elevatorTypeValues = [
  ...new Set(rows.map((row) => row.ELVTR_SE).filter(Boolean)),
].sort();

const directoryName = `seoul-elevator-${collectedAt.toISOString().replaceAll(':', '-')}`;
const outputDirectory = path.join(rawRoot, directoryName);
await mkdir(outputDirectory, { recursive: true });

await writeFile(
  path.join(outputDirectory, 'all.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    source: '서울 열린데이터광장 SeoulMetroFaciInfo',
    sourceUpdatedAt: null,
    notice:
      'collectedAt은 Elbero가 수집한 시각이며 서울교통공사의 개별 상태 관측 시각이 아니다.',
    totalCount,
    rows,
  }, null, 2)}\n`,
  'utf8',
);

await writeFile(
  path.join(outputDirectory, 'targets.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    targetStations,
    rowCount: targetRows.length,
    rows: targetRows,
  }, null, 2)}\n`,
  'utf8',
);

await writeFile(
  path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify({
    collectedAt: collectedAt.toISOString(),
    source: '서울 열린데이터광장',
    service: SERVICE_NAME,
    transport: 'HTTP (공식 명세 엔드포인트)',
    pageSize: PAGE_SIZE,
    pageCount: Math.ceil(totalCount / PAGE_SIZE),
    totalCount,
    receivedCount: rows.length,
    elevatorCount: elevatorRows.length,
    targetCount: targetRows.length,
    statusValues,
    elevatorTypeValues,
  }, null, 2)}\n`,
  'utf8',
);

console.log(`전체 ${rows.length}건, 엘리베이터 ${elevatorRows.length}건`);
console.log(`상태 값: ${statusValues.join(', ')}`);
console.log(`승강기 구분 값: ${elevatorTypeValues.join(', ')}`);
for (const stationName of targetStations) {
  const matches = targetRows.filter(
    (row) => stationBaseName(row.STN_NM) === stationName,
  );
  const elevatorMatches = matches.filter((row) => row.ELVTR_SE === 'EV');
  const unavailableMatches = elevatorMatches.filter((row) => row.USE_YN !== '사용가능');
  console.log(
    `${stationName}: 전체 ${matches.length}건, 엘리베이터 ${elevatorMatches.length}건, 사용가능 외 ${unavailableMatches.length}건`,
  );
}
console.log(`원본 응답 저장 위치: ${path.relative(repositoryRoot, outputDirectory)}`);
