import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');
const scenarioPath = path.join(
  repositoryRoot,
  'data/verification/t07-recovery-scenarios.json',
);
const contractPath = path.join(
  repositoryRoot,
  'packages/contracts/dist/journey-runtime.js',
);

const fixture = JSON.parse(await readFile(scenarioPath, 'utf8'));
const contract = await import(pathToFileURL(contractPath));
const failures = [];

const requiredErrorCodes = [
  'INVALID_REQUEST',
  'UNSUPPORTED_JOURNEY',
  'SOURCE_UNAVAILABLE',
  'SOURCE_TIMEOUT',
  'DATA_MISSING',
  'DATA_CONFLICT',
  'FACILITY_STATUS_UNKNOWN',
  'NO_ACCESSIBLE_ROUTE',
  'DATA_VERSION_UNSUPPORTED',
  'SNAPSHOT_CORRUPTED',
  'SNAPSHOT_EXPIRED',
];

for (const code of requiredErrorCodes) {
  if (!contract.JOURNEY_ERROR_POLICY[code]) {
    failures.push(`오류 정책 누락: ${code}`);
  }
}

for (const scenario of fixture.scenarios) {
  const decision = contract.decideJourneySnapshotRecovery(
    fixture.snapshot,
    scenario.context,
  );
  if (decision.action !== scenario.expectedAction) {
    failures.push(
      `${scenario.name}: action=${decision.action}, expected=${scenario.expectedAction}`,
    );
  }
  if (
    decision.canTrustStoredFacilityStatus !== scenario.expectedFacilityTrust
  ) {
    failures.push(
      `${scenario.name}: facilityTrust=${decision.canTrustStoredFacilityStatus}, expected=${scenario.expectedFacilityTrust}`,
    );
  }
  if (
    decision.action === contract.JOURNEY_RECOVERY_ACTION.RESUME_OFFLINE_LIMITED &&
    !decision.canShowStoredDirections
  ) {
    failures.push(`${scenario.name}: 오프라인 제한 복구에서 저장 경로를 표시할 수 없음`);
  }
}

const orders = fixture.snapshot.payload.route.steps.map(({ order }) => order);
const expectedOrders = Array.from({ length: orders.length }, (_, index) => index + 1);
if (orders.join(',') !== expectedOrders.join(',')) {
  failures.push(`저장 단계 순서 불연속: ${orders.join(',')}`);
}
if (
  fixture.snapshot.currentStepOrder < 1 ||
  fixture.snapshot.currentStepOrder > orders.length
) {
  failures.push(`현재 단계 범위 오류: ${fixture.snapshot.currentStepOrder}`);
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `T07 contract OK: ${requiredErrorCodes.length} error policies, ${fixture.scenarios.length} recovery scenarios`,
  );
}
