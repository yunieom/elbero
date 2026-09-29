import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve("data/verification/line-7-manual-verification.json");
const data = JSON.parse(await readFile(path, "utf8"));

assert.equal(data.schemaVersion, 1);
assert.equal(data.line, "7");
assert.equal(data.status, "complete");
assert.equal(data.surfaceExits.length, 25);
assert.equal(data.directionalDoors.length, 6);

assertUnique(data.surfaceExits, "surfaceExits");
assertUnique(data.directionalDoors, "directionalDoors");

for (const station of data.surfaceExits) {
  assert.match(station.stationCode, /^\d{4}$/);
  assert.ok(station.stationName.length > 0);
  assert.ok(Array.isArray(station.exitNumbers));
  if (station.exitNumbers.length === 0) {
    assert.equal(station.status, "requires_interchange_guidance");
    assert.ok(station.interchangeFallbackLines.length > 0);
  }
}

for (const station of data.directionalDoors) {
  assert.ok(station.directions.length > 0);
  for (const direction of station.directions) {
    assert.ok(direction.toward.length > 0);
    assert.ok(direction.recommendedDoors.length > 0);
    for (const door of direction.recommendedDoors) {
      assert.match(door, /^\d+-\d+$/);
    }
  }
}

const sangok = data.directionalDoors.find(
  (station) => station.stationCode === "0760",
);
assert.deepEqual(
  sangok.directions.flatMap((direction) => direction.recommendedDoors),
  ["5-1", "5-1"],
);

console.log("7호선 검증값 확인: 지상 출구 25역, 방향별 차량·문 6역");

function assertUnique(stations, collection) {
  const codes = stations.map((station) => station.stationCode);
  assert.equal(new Set(codes).size, codes.length, `${collection} 역 코드 중복`);
}
