import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const RAW_PATH = resolve(
  "data/research/line-sync/raw/line-3-2026-09-18T09-13-58.955Z/kric.json",
);
const SEOUL_PATH = resolve(
  "data/research/line-sync/raw/line-3-2026-09-18T09-13-58.955Z/seoul.json",
);
const MANUAL_PATH = resolve(
  "data/verification/line-3-manual-verification.json",
);
const OUTPUT_PATH = resolve(
  "apps/api/src/journey/data/line-3-guidance.generated.ts",
);

const [raw, seoul, manual] = await Promise.all(
  [RAW_PATH, SEOUL_PATH, MANUAL_PATH].map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);

const manualByStation = new Map(
  manual.directionalDoors.map((station) => [station.stationCode, station]),
);
const manualExitsByStation = new Map(
  manual.surfaceExits.map((station) => [station.stationCode, station]),
);
const rawByStation = new Map(
  raw.stations.map((station) => [
    normalizeStationCode(station.station),
    station,
  ]),
);
const seoulByStation = Map.groupBy(seoul.rows, (row) => row.STN_CD);
const gapsByStation = Map.groupBy(raw.gaps, (gap) =>
  gap.stationKey.startsWith("KR:")
    ? `K${Number(gap.stationCode)}`
    : gap.stationCode,
);

const stations = raw.route.body.map((routeStation) => {
  const stationCode = normalizeStationCode(routeStation);
  const rawStation = rawByStation.get(stationCode);
  const seoulRows = seoulByStation.get(stationCode) ?? [];
  const manualStation = manualByStation.get(stationCode);
  const manualExits = manualExitsByStation.get(stationCode);
  const liveElevators = seoulRows.map((row, index) => ({
    id: `${stationCode}-live-${index + 1}`,
    name: row.ELVTR_NM,
    operatingSection: row.OPR_SEC,
    location: row.INSTL_PSTN,
    kind: classifyElevator(row.INSTL_PSTN),
  }));
  const exitNumbers = (
    manualExits?.exitNumbers ?? [
      ...new Set(
        seoulRows
          .filter((row) => classifyElevator(row.INSTL_PSTN) === "surface")
          .flatMap((row) => parseExitNumbers(row.INSTL_PSTN)),
      ),
    ]
  ).toSorted(numericTextSort);

  const movementDirections = [
    ...new Set(
      (rawStation?.movement?.body ?? [])
        .map((item) => stripDirection(item.edMovePath))
        .filter(Boolean),
    ),
  ];
  const manualDirections = manualStation?.directions ?? [];
  const directionKeys = [
    ...movementDirections.map((toward) => ({ toward, service: null })),
    ...manualDirections.map((direction) => ({
      toward: direction.toward,
      service: direction.service ?? null,
    })),
  ].filter(
    (direction, index, all) =>
      all.findIndex(
        (candidate) =>
          candidate.toward === direction.toward &&
          candidate.service === direction.service,
      ) === index,
  );

  const directions = directionKeys.map(({ toward, service }) => {
    const manualDirection = manualDirections.find(
      (direction) =>
        direction.toward === toward && (direction.service ?? null) === service,
    );
    const aliases = manualDirection?.aliases ?? [];
    const liveDoors = liveElevators
      .filter(
        (facility) =>
          facility.kind === "platform" &&
          [toward, ...aliases].some((name) =>
            normalizeText(facility.location).includes(normalizeText(name)),
          ),
      )
      .flatMap((facility) =>
        parseDirectionalDoors(facility.location, [toward, ...aliases]),
      );
    const recommendedDoors = [
      ...new Set(manualDirection?.recommendedDoors ?? liveDoors),
    ];
    const platformNumber =
      manualDirection?.platformNumber ??
      inferPlatformNumber(
        rawStation?.nearbyCars?.body ?? [],
        recommendedDoors,
      );
    const doorGaps = recommendedDoors.map((door) => ({
      door,
      gap: findGap(stationCode, platformNumber, door),
    }));

    return {
      toward,
      aliases,
      service,
      ...(manualDirection?.sharedFacilityLine
        ? { sharedFacilityLine: manualDirection.sharedFacilityLine }
        : {}),
      platformNumber,
      recommendedDoors,
      doorGaps,
      accessibilityVerified:
        Boolean(manualDirection) ||
        (recommendedDoors.length > 0 && liveDoors.length > 0),
      warning:
        recommendedDoors.length === 0 && !manualDirection?.sharedFacilityLine
          ? "방향별 승강기 인접 차량·문 미확인"
          : null,
      source: manualDirection
        ? "manual_verification"
        : recommendedDoors.length > 0
          ? "SeoulMetroFaciInfo"
          : "unverified",
    };
  });

  return {
    stationCode,
    stationName: normalizeStationName(routeStation.stinNm),
    exitNumbers,
    verificationMethod:
      manualStation || manualExits
        ? "manual_verification"
        : "SeoulMetroFaciInfo",
    liveElevators,
    directions,
  };
});

const output = {
  dataVersion: `line-3.audit-2026-09-18.manual-${manual.verifiedAt}`,
  verifiedAt: manual.verifiedAt,
  topology: manual.topology,
  stations,
};

await writeFile(
  OUTPUT_PATH,
  `// Generated by tools/validation/build-line3-guidance.mjs.\nexport const LINE_3_GUIDANCE = ${JSON.stringify(output, null, 2)} as const;\n`,
  "utf8",
);

console.log(
  `3호선 안내 데이터 생성: ${stations.length}역, 수동 지상 출구 ${manual.surfaceExits.length}역, 수동 차량·문 ${manual.directionalDoors.length}역`,
);

function normalizeCode(value) {
  const code = String(value);
  return /^\d+$/.test(code) ? code.padStart(4, "0") : code;
}

function normalizeStationCode(station) {
  return station.railOprIsttCd === "KR"
    ? `K${Number(station.stinCd)}`
    : normalizeCode(station.stinCd);
}

function normalizeStationName(value) {
  return String(value).replace(/\([^)]*\)$/u, "");
}

function normalizeText(value) {
  return String(value).replace(/[\s()]/gu, "");
}

function stripDirection(value) {
  return String(value ?? "")
    .replace(/\s*방면.*$/u, "")
    .replace(/역$/u, "")
    .replace(/^원흉$/u, "원흥")
    .trim();
}

function classifyElevator(location) {
  if (/출입구|출구/u.test(location)) return "surface";
  if (/방면|\d+-\d+/u.test(location)) return "platform";
  return "other";
}

function parseExitNumbers(location) {
  return String(location).match(/\d+(?:-\d+)?/gu) ?? [];
}

function parseDoors(location) {
  return String(location).match(/\d+-\d+/gu) ?? [];
}

function parseDirectionalDoors(location, towardNames) {
  const matchingSegments = String(location)
    .split(",")
    .filter((segment) =>
      towardNames.some((toward) =>
        normalizeText(segment).includes(normalizeText(toward)),
      ),
    );
  if (matchingSegments.length > 0) return matchingSegments.flatMap(parseDoors);
  const allDoors = parseDoors(location);
  return allDoors.length === 1 ? allDoors : [];
}

function inferPlatformNumber(nearbyCars, doors) {
  const matches = nearbyCars.filter((row) =>
    doors.includes(`${row.carOrdr}-${row.carEtrcNo}`),
  );
  const platforms = [...new Set(matches.map((row) => String(row.plfNo)))];
  return platforms.length === 1 ? platforms[0] : null;
}

function findGap(stationCode, platformNumber, door) {
  const [carNumber, doorNumber] = door.split("-").map(Number);
  const candidates = (gapsByStation.get(stationCode) ?? [])
    .filter((gap) => !platformNumber || gap.platformNumber === platformNumber)
    .flatMap((gap) => gap.payload?.body ?? [])
    .filter((row) => row.carOrdr === carNumber && row.carEtrcNo === doorNumber);
  const distances = [...new Set(candidates.map((row) => Number(row.sfDst)))];
  if (distances.length === 0 || distances.some((value) => !Number.isFinite(value))) {
    return null;
  }
  const distanceCm = Math.max(...distances);
  return {
    distanceCm,
    level: distanceCm <= 10 ? "green" : distanceCm <= 15 ? "yellow" : "red",
    label:
      distanceCm <= 10 ? "안전" : distanceCm <= 15 ? "유의" : "추천하지 않음",
  };
}

function numericTextSort(left, right) {
  return left.localeCompare(right, "ko", { numeric: true });
}
