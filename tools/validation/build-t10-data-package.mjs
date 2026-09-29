import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateAccessibilityDataPackage } from '../../packages/contracts/dist/index.js';

const sourcePath = resolve('data/verification/t06-normalized-sample.json');
const outputDir = resolve('data/generated/accessibility');
const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const result = validateAccessibilityDataPackage(source, 't10-build');

assert.equal(result.ok, true, result.ok ? undefined : result.error.message);
await mkdir(outputDir, { recursive: true });
await writeFile(
  resolve(outputDir, 't10-data-package.json'),
  `${JSON.stringify(result.data.dataPackage, null, 2)}\n`,
);
await writeFile(
  resolve(outputDir, 't10-validation-report.json'),
  `${JSON.stringify(result.data.report, null, 2)}\n`,
);

console.log(
  `T10 package ${result.meta.dataVersion}: accepted=${result.data.report.acceptedCount}, quarantined=${result.data.report.quarantinedCount}`,
);
