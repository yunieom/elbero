import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(toolDirectory, '../..');
const samplePath = path.join(
  repositoryRoot,
  'data/verification/t06-normalized-sample.json',
);
const sample = JSON.parse(await readFile(samplePath, 'utf8'));

const failures = [];

function uniqueIds(records, label) {
  const ids = records.map(({ id }) => id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    failures.push(`${label} 중복 ID: ${[...new Set(duplicates)].join(', ')}`);
  }
  return new Set(ids);
}

function requireRef(value, ids, label) {
  if (value !== null && !ids.has(value)) failures.push(`${label}: ${value}`);
}

const lineIds = uniqueIds(sample.lines, 'line');
const stationIds = uniqueIds(sample.stations, 'station');
const stationLineIds = uniqueIds(sample.stationLines, 'stationLine');
const platformIds = uniqueIds(sample.platforms, 'platform');
const placeIds = uniqueIds(sample.places, 'place');
const facilityIds = uniqueIds(sample.facilities, 'facility');
uniqueIds(sample.boardingPoints, 'boardingPoint');
const pathIds = uniqueIds(sample.paths, 'path');
const segmentIds = uniqueIds(sample.pathSegments, 'pathSegment');
uniqueIds(sample.statusObservations, 'statusObservation');
uniqueIds(sample.unmappedSourceRecords, 'unmappedSourceRecord');

for (const stationLine of sample.stationLines) {
  requireRef(stationLine.stationId, stationIds, 'stationLine.stationId 누락');
  requireRef(stationLine.lineId, lineIds, 'stationLine.lineId 누락');
  requireRef(
    stationLine.previousStationLineId,
    stationLineIds,
    'stationLine.previousStationLineId 누락',
  );
  requireRef(
    stationLine.nextStationLineId,
    stationLineIds,
    'stationLine.nextStationLineId 누락',
  );
}

for (const platform of sample.platforms) {
  requireRef(platform.stationLineId, stationLineIds, 'platform.stationLineId 누락');
  for (const [field, value] of Object.entries(platform.direction)) {
    if (field.endsWith('StationLineId')) {
      requireRef(value, stationLineIds, `platform.direction.${field} 누락`);
    }
  }
}

for (const place of sample.places) {
  requireRef(place.stationLineId, stationLineIds, 'place.stationLineId 누락');
  requireRef(place.platformId, platformIds, 'place.platformId 누락');
}

for (const facility of sample.facilities) {
  requireRef(facility.stationLineId, stationLineIds, 'facility.stationLineId 누락');
  for (const placeId of facility.servedPlaceIds) {
    requireRef(placeId, placeIds, 'facility.servedPlaceIds 누락');
  }
}

for (const boardingPoint of sample.boardingPoints) {
  requireRef(boardingPoint.platformId, platformIds, 'boardingPoint.platformId 누락');
  for (const facilityId of boardingPoint.adjacentFacilityIds) {
    requireRef(facilityId, facilityIds, 'boardingPoint.adjacentFacilityIds 누락');
  }
}

for (const pathRecord of sample.paths) {
  requireRef(pathRecord.stationLineId, stationLineIds, 'path.stationLineId 누락');
  requireRef(pathRecord.fromPlaceId, placeIds, 'path.fromPlaceId 누락');
  requireRef(pathRecord.toPlaceId, placeIds, 'path.toPlaceId 누락');
  for (const [field, value] of Object.entries(pathRecord.directionCondition)) {
    if (field.endsWith('StationLineId')) {
      requireRef(value, stationLineIds, `path.directionCondition.${field} 누락`);
    }
  }
  for (const segmentId of pathRecord.segmentIds) {
    requireRef(segmentId, segmentIds, 'path.segmentIds 누락');
  }
  const orders = sample.pathSegments
    .filter(({ pathId }) => pathId === pathRecord.id)
    .map(({ order }) => order)
    .sort((left, right) => left - right);
  const expectedOrders = Array.from({ length: orders.length }, (_, index) => index + 1);
  if (orders.join(',') !== expectedOrders.join(',')) {
    failures.push(`${pathRecord.id} 단계 순서가 연속적이지 않음: ${orders.join(',')}`);
  }
}

for (const segment of sample.pathSegments) {
  requireRef(segment.pathId, pathIds, 'pathSegment.pathId 누락');
  requireRef(segment.fromPlaceId, placeIds, 'pathSegment.fromPlaceId 누락');
  requireRef(segment.toPlaceId, placeIds, 'pathSegment.toPlaceId 누락');
  requireRef(segment.facilityId, facilityIds, 'pathSegment.facilityId 누락');
  if (!['mapped', 'partial', 'unmapped'].includes(segment.mappingStatus)) {
    failures.push(`${segment.id} mappingStatus 오류: ${segment.mappingStatus}`);
  }
}

for (const observation of sample.statusObservations) {
  requireRef(observation.facilityId, facilityIds, 'statusObservation.facilityId 누락');
  if (!observation.collectedAt) {
    failures.push(`${observation.id} collectedAt 누락`);
  }
  if (!Object.hasOwn(observation, 'observedAt')) {
    failures.push(`${observation.id} observedAt 필드 누락`);
  }
}

if (sample.unmappedSourceRecords.length === 0) {
  failures.push('구조화할 수 없는 원본·누락 항목이 기록되지 않음');
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `T06 sample OK: ${sample.stations.length} stations, ${sample.platforms.length} platforms, ${sample.facilities.length} facilities, ${sample.paths.length} path, ${sample.pathSegments.length} segments, ${sample.unmappedSourceRecords.length} unmapped records`,
  );
}
