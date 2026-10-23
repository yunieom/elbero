import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const configs = [
  {
    stem: "line-1",
    constantName: "LINE_1_NETWORK_GUIDANCE",
    output: "apps/api/src/journey/data/line-1-network-guidance.generated.ts",
    lineName: "1호선",
    network: "line-1",
    preferredDoorPriority: true,
    expectedRawStationCount: 102,
  },
  {
    stem: "airport-railroad",
    constantName: "AIRPORT_RAILROAD_GUIDANCE",
    output: "apps/api/src/journey/data/airport-railroad-guidance.generated.ts",
    lineName: "공항철도",
    preferredDoorPriority: true,
  },
  {
    stem: "everline",
    constantName: "EVERLINE_GUIDANCE",
    output: "apps/api/src/journey/data/everline-guidance.generated.ts",
    lineName: "용인에버라인",
    preferredDoorPriority: true,
  },
  {
    stem: "line-6",
    constantName: "LINE_6_LOOP_GUIDANCE",
    output: "apps/api/src/journey/data/line-6-loop-guidance.generated.ts",
    lineName: "6호선",
    loop: "line-6",
    preferredDoorPriority: true,
    expectedRawStationCount: 39,
  },
  {
    stem: "line-8",
    constantName: "LINE_8_GUIDANCE",
    output: "apps/api/src/journey/data/line-8-guidance.generated.ts",
    lineName: "8호선",
    preferredDoorPriority: true,
  },
  {
    stem: "line-9",
    constantName: "LINE_9_GUIDANCE",
    output: "apps/api/src/journey/data/line-9-guidance.generated.ts",
    lineName: "9호선",
    preferredDoorPriority: true,
    expectedRawStationCount: 38,
  },
  {
    stem: "gimpo-goldline",
    constantName: "GIMPO_GOLDLINE_GUIDANCE",
    output: "apps/api/src/journey/data/gimpo-goldline-guidance.generated.ts",
    lineName: "김포골드라인",
    preferredDoorPriority: true,
  },
  {
    stem: "sillim-line",
    constantName: "SILLIM_LINE_GUIDANCE",
    output: "apps/api/src/journey/data/sillim-line-guidance.generated.ts",
    lineName: "신림선",
    preferredDoorPriority: true,
  },
  {
    stem: "shinbundang-line",
    constantName: "SHINBUNDANG_LINE_GUIDANCE",
    output: "apps/api/src/journey/data/shinbundang-line-guidance.generated.ts",
    lineName: "신분당선",
    rawMovementExits: true,
  },
  {
    stem: "gtx-a",
    constantName: "GTX_A_GUIDANCE",
    output: "apps/api/src/journey/data/gtx-a-guidance.generated.ts",
    lineName: "GTX-A",
    network: "gtx-a",
    rawMovementExits: true,
  },
];

const requestedStems = new Set(process.argv.slice(2));
const selectedConfigs =
  requestedStems.size === 0
    ? configs
    : configs.filter((config) => requestedStems.has(config.stem));

if (requestedStems.size > 0 && selectedConfigs.length !== requestedStems.size) {
  const known = new Set(configs.map((config) => config.stem));
  const unknown = [...requestedStems].filter((stem) => !known.has(stem));
  throw new Error(`지원하지 않는 생성 대상: ${unknown.join(", ")}`);
}

for (const config of selectedConfigs) {
  const rawDirectory = await findLatestRawDirectory(
    config.stem,
    config.expectedRawStationCount,
  );
  const [raw, audit] = await Promise.all([
    readJson(resolve(rawDirectory, "kric.json")),
    readJson(resolve(`data/research/line-sync/${config.stem}-latest.json`)),
  ]);
  const manual = await readOptionalJson(
    resolve(`data/verification/${config.stem}-manual-verification.json`),
  );
  const route = raw.route.body;
  const firstTerminal = route[0];
  const lastTerminal = route.at(-1);
  const rawByIdentity = new Map(
    raw.stations.map((station) => [stationIdentity(station.station), station]),
  );
  const platforms = raw.platforms.flatMap((payload) => payload.body ?? []);
  const platformsByIdentity = Map.groupBy(platforms, stationIdentity);
  const gapsByIdentity = Map.groupBy(raw.gaps, (gap) => gap.stationKey);
  const preferredByIdentity = new Map(
    (audit.preferredDoorGuidance ?? []).map((station) => [
      station.stationKey,
      station,
    ]),
  );
  const manualDirectionsByIdentity = new Map(
    (manual?.directionalDoors ?? []).map((station) => [
      `${station.railOperatorCode ?? ""}:${normalizeCode(station.stationCode)}`,
      station.directions,
    ]),
  );
  const gapOverridesByIdentity = new Map(
    (manual?.gapOverrides ?? []).map((station) => [
      `${station.railOperatorCode ?? ""}:${normalizeCode(station.stationCode)}`,
      station,
    ]),
  );
  const manualSurfaceExitsByIdentity = new Map(
    (manual?.surfaceExits ?? []).map((station) => [
      `${station.railOperatorCode ?? ""}:${normalizeCode(station.stationCode)}`,
      station,
    ]),
  );
  const exitDifferenceByIdentity = new Map(
    audit.differences
      .filter((difference) => difference.category === "surface_exit_number")
      .map((difference) => [
        `${difference.railOperatorCode}:${difference.stationCode}`,
        difference,
      ]),
  );

  const codeByIdentity = new Map(
    route.map((station) => [
      stationIdentity(station),
      publicStationCode(config, station),
    ]),
  );
  const paths =
    config.network === "line-1"
      ? buildLine1Paths(route, codeByIdentity)
      : config.network === "gtx-a"
        ? buildGtxAPaths(route, codeByIdentity)
        : null;
  const loopLayout =
    config.loop === "line-6" ? buildLine6Layout(route, codeByIdentity) : null;
  const neighborsByCode = paths
    ? buildNeighbors(paths)
    : loopLayout
      ? buildLine6Neighbors(loopLayout)
      : null;
  const stations = route.map((routeStation, index) => {
    const identity = stationIdentity(routeStation);
    const stationCode = codeByIdentity.get(identity);
    const rawStation = rawByIdentity.get(identity);
    const stationPlatforms = platformsByIdentity.get(identity) ?? [];
    const stationGaps = gapsByIdentity.get(identity) ?? [];
    const exitDifference = exitDifferenceByIdentity.get(
      `${routeStation.railOprIsttCd}:${normalizeCode(routeStation.stinCd)}`,
    );
    const manualSurfaceExit =
      manualSurfaceExitsByIdentity.get(identity) ??
      manualSurfaceExitsByIdentity.get(
        `:${normalizeCode(routeStation.stinCd)}`,
      );
    const exitNumbers =
      manualSurfaceExit?.exitNumbers ??
      selectExitNumbers(
        exitDifference?.normalizedValues ??
          (config.rawMovementExits
            ? {
                stationMovement: extractMovementExitNumbers(
                  rawStation?.movement?.body ?? [],
                ),
                stinElevatorMovement: extractElevatorMovementExitNumbers(
                  rawStation?.elevatorMovement?.body ?? [],
                ),
              }
            : undefined),
      );
    const adjacentStations = neighborsByCode
      ? [...(neighborsByCode.get(stationCode) ?? [])]
          .map((code) =>
            route.find(
              (station) =>
                codeByIdentity.get(stationIdentity(station)) === code,
            ),
          )
          .filter(Boolean)
      : [
          index > 0 ? route[index - 1] : null,
          index < route.length - 1 ? route[index + 1] : null,
        ].filter(Boolean);
    const manualDirections =
      manualDirectionsByIdentity.get(identity) ??
      manualDirectionsByIdentity.get(
        `:${normalizeCode(routeStation.stinCd)}`,
      ) ??
      [];
    const preferred = preferredByIdentity.get(identity);
    const gapOverride =
      gapOverridesByIdentity.get(identity) ??
      gapOverridesByIdentity.get(`:${normalizeCode(routeStation.stinCd)}`);
    const directions = adjacentStations.map((adjacentStation) => {
      const terminal = selectTerminalForNeighbor({
        config,
        route,
        paths,
        loopLayout,
        codeByIdentity,
        stationCode,
        adjacentCode: codeByIdentity.get(stationIdentity(adjacentStation)),
        fallback: adjacentStation,
      });
      return buildDirection({
        toward: adjacentStation.stinNm,
        terminalName: terminal.stinNm,
        terminalCode: terminal.stinCd,
        stationPlatforms,
        nearbyCars: rawStation?.nearbyCars?.body ?? [],
        stationGaps,
        preferred: config.preferredDoorPriority ? preferred : null,
        manualDirection: manualDirections.find(
          (direction) =>
            normalizeName(direction.toward) ===
            normalizeName(adjacentStation.stinNm),
        ),
        gapOverride,
      });
    });

    return {
      stationCode,
      stationName: routeStation.stinNm,
      exitNumbers,
      verificationMethod: "kric_movement_consensus",
      directions,
    };
  });

  const output = {
    dataVersion: rawDirectory.split("/").at(-1),
    verifiedAt: String(audit.collectedAt).slice(0, 10),
    topology: route.map((station) =>
      codeByIdentity.get(stationIdentity(station)),
    ),
    terminals: [firstTerminal.stinNm, lastTerminal.stinNm],
    ...(paths ? { paths } : {}),
    ...(loopLayout ? { loopLayout } : {}),
    stations,
  };
  await writeFile(
    resolve(config.output),
    `// Generated by tools/validation/build-linear-target-guidance.mjs.\nexport const ${config.constantName} = ${JSON.stringify(output, null, 2)} as const;\n`,
    "utf8",
  );
  console.log(
    `${config.stem}: ${stations.length}역, 방향 ${stations.reduce((sum, station) => sum + station.directions.length, 0)}건 생성`,
  );
}

function buildDirection({
  toward,
  terminalName,
  terminalCode,
  stationPlatforms,
  nearbyCars,
  stationGaps,
  preferred,
  manualDirection,
  gapOverride,
}) {
  const platform = stationPlatforms.find(
    (item) => String(item.runDirTmnStinCd) === String(terminalCode),
  );
  const platformNumber = platform ? String(platform.plfNo) : null;
  const preferredCandidates = (preferred?.candidates ?? []).filter(
    (candidate) =>
      !platformNumber ||
      candidate.inferredPlatformNumbers.length === 0 ||
      candidate.inferredPlatformNumbers.includes(platformNumber),
  );
  const recommendedDoors = uniqueSorted(
    manualDirection?.recommendedDoors ??
      (preferredCandidates.length > 0
        ? preferredCandidates.map((candidate) => candidate.door)
        : nearbyCars
            .filter(
              (row) => !platformNumber || String(row.plfNo) === platformNumber,
            )
            .map((row) => `${row.carOrdr}-${row.carEtrcNo}`)),
  );
  const doorGaps = recommendedDoors.map((door) => ({
    door,
    gap:
      findPreferredGap(preferredCandidates, platformNumber, door) ??
      findOverrideGap(gapOverride, platformNumber, door) ??
      findGap(stationGaps, platformNumber, door),
  }));
  return {
    toward,
    terminalName,
    platformNumber,
    recommendedDoors,
    doorGaps,
    accessibilityVerified:
      recommendedDoors.length > 0 &&
      doorGaps.every(({ gap }) => gap && gap.level !== "red"),
    warning:
      recommendedDoors.length === 0
        ? "방향별 승강기 인접 차량·문 미확인"
        : doorGaps.some(({ gap }) => !gap)
          ? "승강장 이격거리 미확인"
          : null,
    source: manualDirection
      ? "manual_verification"
      : preferred?.source
        ? `${preferred.source}+stationPlatformTrainDistance`
        : "stationElevatorCarNumber+stationPlatformTrainDistance",
  };
}

function findPreferredGap(candidates, platformNumber, door) {
  const candidate = candidates.find((item) => item.door === door);
  if (!candidate) return null;
  const gap =
    candidate.gaps.find(
      (item) => !platformNumber || item.platformNumber === platformNumber,
    ) ?? (candidate.gaps.length === 1 ? candidate.gaps[0] : null);
  return gap?.distanceCm == null
    ? null
    : {
        distanceCm: gap.distanceCm,
        level: gap.level,
        label:
          gap.level === "green"
            ? "안전"
            : gap.level === "yellow"
              ? "유의"
              : "추천하지 않음",
      };
}

function findOverrideGap(override, platformNumber, door) {
  if (!override || !(override.recommendedDoors ?? []).includes(door))
    return null;
  const direction = (override.directions ?? []).find(
    (item) =>
      (!platformNumber || String(item.platformNumber) === platformNumber) &&
      (item.recommendedDoors ?? []).includes(door),
  );
  const level = direction?.level ?? override.level;
  if (!level) return null;
  const distanceCm = level === "green" ? 10 : level === "yellow" ? 15 : 16;
  return {
    distanceCm,
    level,
    label:
      level === "green"
        ? "안전"
        : level === "yellow"
          ? "유의"
          : "추천하지 않음",
  };
}

function findGap(stationGaps, platformNumber, door) {
  const [carNumber, doorNumber] = door.split("-").map(Number);
  const values = stationGaps
    .filter((gap) => !platformNumber || gap.platformNumber === platformNumber)
    .flatMap((gap) => gap.payload?.body ?? [])
    .filter(
      (row) =>
        row.carOrdr === carNumber &&
        row.carEtrcNo === doorNumber &&
        Number.isFinite(row.sfDst),
    )
    .map((row) => Number(row.sfDst));
  if (values.length === 0) return null;
  const distanceCm = Math.max(...values);
  return {
    distanceCm,
    level: distanceCm <= 10 ? "green" : distanceCm <= 15 ? "yellow" : "red",
    label:
      distanceCm <= 10 ? "안전" : distanceCm <= 15 ? "유의" : "추천하지 않음",
  };
}

function selectExitNumbers(values = {}) {
  const movement = uniqueSorted(values.stationMovement ?? []);
  const elevatorMovement = uniqueSorted(values.stinElevatorMovement ?? []);
  if (
    movement.length > 0 &&
    movement.length === elevatorMovement.length &&
    movement.every((value, index) => value === elevatorMovement[index])
  ) {
    return movement;
  }
  return (
    [movement, elevatorMovement, values.stationElevator ?? []].find(
      (items) => items.length > 0,
    ) ?? []
  );
}

function extractMovementExitNumbers(rows) {
  return extractExitNumbers(
    rows.flatMap((row) => [row.stMovePath, row.edMovePath, row.mvContDtl]),
  );
}

function extractElevatorMovementExitNumbers(rows) {
  return extractExitNumbers(
    rows.filter((row) => row.mvPathDvCd === "1").map((row) => row.mvContDtl),
  );
}

function extractExitNumbers(values) {
  return uniqueSorted(
    values.flatMap((value) =>
      [
        ...String(value ?? "").matchAll(
          /(\d+(?:-\d+)?)\s*번\s*출(?:입구|구)/gu,
        ),
      ].map((match) => match[1]),
    ),
  );
}

function stationIdentity(station) {
  return `${station.railOprIsttCd}:${normalizeCode(station.stinCd)}`;
}

function normalizeCode(value) {
  const text = String(value);
  return /^\d+$/u.test(text) ? text.padStart(4, "0") : text;
}

function publicStationCode(config, station) {
  const stationCode = normalizeCode(station.stinCd);
  return config.network === "line-1"
    ? `${station.railOprIsttCd}${stationCode}`
    : stationCode;
}

function buildLine1Paths(route, codeByIdentity) {
  const byName = new Map(
    route.map((station) => [
      station.stinNm,
      codeByIdentity.get(stationIdentity(station)),
    ]),
  );
  const names = (values) =>
    values.map((name) => {
      const code = byName.get(name);
      if (!code)
        throw new Error(`1호선 경로에서 ${name} 역을 찾을 수 없습니다.`);
      return code;
    });
  const common = names([
    "연천",
    "전곡",
    "청산",
    "소요산",
    "동두천",
    "보산",
    "동두천중앙",
    "지행",
    "덕정",
    "덕계",
    "양주",
    "녹양",
    "가능",
    "의정부",
    "회룡",
    "망월사",
    "도봉산",
    "도봉",
    "방학",
    "창동",
    "녹천",
    "월계",
    "광운대",
    "석계",
    "신이문",
    "외대앞",
    "회기",
    "청량리(서울시립대입구)",
    "제기동",
    "신설동",
    "동묘앞",
    "동대문",
    "종로5가",
    "종로3가",
    "종각",
    "시청",
    "서울역",
    "남영",
    "용산",
    "노량진",
    "대방",
    "신길",
    "영등포",
    "신도림",
    "구로",
  ]);
  const incheon = names([
    "구일",
    "개봉",
    "오류동",
    "온수",
    "역곡",
    "소사",
    "부천",
    "중동",
    "송내",
    "부개",
    "부평",
    "백운",
    "동암",
    "간석",
    "주안",
    "도화",
    "제물포",
    "도원",
    "동인천",
    "인천",
  ]);
  const sinchang = names([
    "가산디지털단지",
    "독산",
    "금천구청",
    "석수",
    "관악",
    "안양",
    "명학",
    "금정",
    "군포",
    "당정",
    "의왕",
    "성균관대",
    "화서",
    "수원",
    "세류",
    "병점",
    "세마",
    "오산대",
    "오산",
    "진위",
    "송탄",
    "서정리",
    "평택지제",
    "평택",
    "성환",
    "직산",
    "두정",
    "천안",
    "봉명",
    "쌍용(나사렛대)",
    "아산",
    "탕정",
    "배방",
    "온양온천",
    "신창(순천향대)",
  ]);
  const throughGeumcheon = [...common, ...sinchang.slice(0, 3)];
  const throughByeongjeom = [...common, ...sinchang.slice(0, 16)];
  return [
    {
      id: "incheon",
      terminals: ["연천", "인천"],
      stationCodes: [...common, ...incheon],
    },
    {
      id: "sinchang",
      terminals: ["연천", "신창(순천향대)"],
      stationCodes: [...common, ...sinchang],
    },
    {
      id: "gwangmyeong",
      terminals: ["연천", "광명"],
      stationCodes: [...throughGeumcheon, byName.get("광명")],
    },
    {
      id: "seodongtan",
      terminals: ["연천", "서동탄"],
      stationCodes: [...throughByeongjeom, byName.get("서동탄")],
    },
  ];
}

function buildGtxAPaths(route, codeByIdentity) {
  const codeByName = new Map(
    route.map((station) => [
      station.stinNm,
      codeByIdentity.get(stationIdentity(station)),
    ]),
  );
  const path = (id, names) => ({
    id,
    terminals: [names[0], names.at(-1)],
    stationCodes: names.map((name) => {
      const code = codeByName.get(name);
      if (!code)
        throw new Error(`GTX-A 경로에서 ${name} 역을 찾을 수 없습니다.`);
      return code;
    }),
  });
  return [
    path("suseo-dongtan", ["수서", "성남", "구성", "동탄"]),
    path("seoul-unjeong", ["서울역", "연신내", "대곡", "킨텍스", "운정중앙"]),
  ];
}

function buildNeighbors(paths) {
  const result = new Map();
  for (const path of paths) {
    path.stationCodes.forEach((code, index) => {
      const neighbors = result.get(code) ?? new Set();
      if (index > 0) neighbors.add(path.stationCodes[index - 1]);
      if (index < path.stationCodes.length - 1)
        neighbors.add(path.stationCodes[index + 1]);
      result.set(code, neighbors);
    });
  }
  return result;
}

function buildLine6Layout(route, codeByIdentity) {
  const codeByName = new Map(
    route.map((station) => [
      station.stinNm,
      codeByIdentity.get(stationIdentity(station)),
    ]),
  );
  return {
    mainStationCodes: [
      codeByName.get("응암"),
      ...route
        .filter((station) => station.stinConsOrdr >= 7)
        .map((station) => codeByIdentity.get(stationIdentity(station))),
    ],
    loopStationCodes: ["응암", "역촌", "불광", "독바위", "연신내", "구산"].map(
      (name) => codeByName.get(name),
    ),
  };
}

function buildLine6Neighbors(layout) {
  const result = buildNeighbors([{ stationCodes: layout.mainStationCodes }]);
  for (const code of layout.loopStationCodes) {
    if (!result.has(code)) result.set(code, new Set());
  }
  layout.loopStationCodes.forEach((code, index) => {
    result
      .get(code)
      .add(
        layout.loopStationCodes[(index + 1) % layout.loopStationCodes.length],
      );
  });
  return result;
}

function selectTerminalForNeighbor({
  config,
  route,
  paths,
  loopLayout,
  codeByIdentity,
  stationCode,
  adjacentCode,
  fallback,
}) {
  if (loopLayout) {
    const stationIndex = loopLayout.mainStationCodes.indexOf(stationCode);
    const adjacentIndex = loopLayout.mainStationCodes.indexOf(adjacentCode);
    if (stationIndex !== -1 && adjacentIndex !== -1) {
      return adjacentIndex < stationIndex ? route[0] : route.at(-1);
    }
    return route[0];
  }
  if (!paths) {
    const stationIndex = route.findIndex(
      (station) => codeByIdentity.get(stationIdentity(station)) === stationCode,
    );
    const adjacentIndex = route.findIndex(
      (station) =>
        codeByIdentity.get(stationIdentity(station)) === adjacentCode,
    );
    return adjacentIndex < stationIndex ? route[0] : route.at(-1);
  }
  const path = paths.find((candidate) => {
    const index = candidate.stationCodes.indexOf(stationCode);
    return (
      index !== -1 &&
      [
        candidate.stationCodes[index - 1],
        candidate.stationCodes[index + 1],
      ].includes(adjacentCode)
    );
  });
  if (!path) return fallback;
  const index = path.stationCodes.indexOf(stationCode);
  const terminalName =
    adjacentCode === path.stationCodes[index - 1]
      ? path.terminals[0]
      : path.terminals[1];
  return route.find((station) => station.stinNm === terminalName) ?? fallback;
}

function normalizeName(value) {
  return String(value ?? "")
    .replace(/\([^)]*\)/gu, "")
    .replace(/\s+/gu, "")
    .replace(/역$/u, "");
}

function uniqueSorted(values) {
  return [...new Set(values.map(String))].toSorted((left, right) =>
    left.localeCompare(right, "ko", { numeric: true }),
  );
}

async function findLatestRawDirectory(stem, expectedStationCount) {
  const root = resolve("data/research/line-sync/raw");
  const directories = (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(`${stem}-`))
    .map((entry) => entry.name)
    .toSorted()
    .toReversed();
  let directory = expectedStationCount ? undefined : directories[0];
  if (expectedStationCount) {
    for (const candidate of directories) {
      const raw = await readJson(resolve(root, candidate, "kric.json"));
      if ((raw.route?.body?.length ?? 0) >= expectedStationCount) {
        directory = candidate;
        break;
      }
    }
  }
  if (!directory) {
    throw new Error(
      expectedStationCount
        ? `${stem} ${expectedStationCount}역을 포함한 원천 수집 데이터가 없습니다.`
        : `${stem} 원천 수집 데이터가 없습니다.`,
    );
  }
  return resolve(root, directory);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readOptionalJson(path) {
  try {
    return await readJson(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}
