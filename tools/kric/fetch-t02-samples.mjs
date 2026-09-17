import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_ROOT = 'https://openapi.kric.go.kr/openapi';
const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');
const queryFile = path.join(toolDirectory, 't02-queries.json');
const rawRoot = path.join(repositoryRoot, 'data/research/t02/raw');

for (const envFile of [
  path.join(repositoryRoot, '.env'),
  path.join(repositoryRoot, 'apps/api/.env'),
]) {
  if (process.env.KRIC_SERVICE_KEY) break;
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyIndex = args.indexOf('--only');
const onlyId = onlyIndex === -1 ? null : args[onlyIndex + 1];

if (onlyIndex !== -1 && !onlyId) {
  throw new Error('--only 뒤에 t02-queries.json의 id를 입력해 주세요.');
}

const queries = JSON.parse(await readFile(queryFile, 'utf8'));
const selectedQueries = onlyId
  ? queries.filter((query) => query.id === onlyId)
  : queries;

if (selectedQueries.length === 0) {
  throw new Error(`알 수 없는 요청 id입니다: ${onlyId}`);
}

const serviceKey = process.env.KRIC_SERVICE_KEY;
if (!dryRun && !serviceKey) {
  throw new Error(
    'KRIC_SERVICE_KEY가 필요합니다. 루트 또는 apps/api/.env에 저장하거나 환경변수로 전달해 주세요.',
  );
}

function buildUrl(query, key) {
  const url = new URL(`${API_ROOT}${query.endpoint}`);
  url.searchParams.set('serviceKey', key);
  for (const [name, value] of Object.entries(query.params)) {
    url.searchParams.set(name, value);
  }
  return url;
}

function redactedUrl(query) {
  return buildUrl(query, '***').toString().replace('%2A%2A%2A', '***');
}

if (dryRun) {
  for (const query of selectedQueries) {
    console.log(`${query.id}\n  ${query.purpose}\n  ${redactedUrl(query)}`);
  }
  process.exit(0);
}

const collectedAt = new Date();
const directoryName = collectedAt.toISOString().replaceAll(':', '-');
const outputDirectory = path.join(rawRoot, directoryName);
await mkdir(outputDirectory, { recursive: true });

const manifest = {
  collectedAt: collectedAt.toISOString(),
  source: 'KRIC 철도 데이터 포털 Open API',
  notice:
    '응답에 관측 시각이 없으면 collectedAt을 시설 상태의 관측 시각으로 해석하지 않는다.',
  requests: [],
};

let failedRequestCount = 0;

for (const query of selectedQueries) {
  const url = buildUrl(query, serviceKey);
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(body);
  } catch {
    // 원본은 그대로 저장하고 manifest에서 JSON 파싱 실패로 분류한다.
  }
  const apiResultCode = payload?.header?.resultCode ?? null;
  const apiResultMessage = payload?.header?.resultMsg ?? null;
  const succeeded = response.ok && apiResultCode === '00';
  if (!succeeded) failedRequestCount += 1;
  const fileName = `${query.id}.json`;
  await writeFile(path.join(outputDirectory, fileName), body, 'utf8');

  manifest.requests.push({
    id: query.id,
    purpose: query.purpose,
    url: redactedUrl(query),
    httpStatus: response.status,
    apiResultCode,
    apiResultMessage,
    resultCount: payload?.header?.resultCnt ?? null,
    contentType: response.headers.get('content-type'),
    responseFile: fileName,
  });

  console.log(
    `${succeeded ? 'OK' : 'FAIL'} HTTP ${response.status} API ${apiResultCode ?? 'unknown'} ${query.id}`,
  );
}

await writeFile(
  path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`원본 응답 저장 위치: ${path.relative(repositoryRoot, outputDirectory)}`);

if (failedRequestCount > 0) {
  console.error(`${failedRequestCount}개 요청이 KRIC API 수준에서 실패했습니다.`);
  process.exitCode = 1;
}
