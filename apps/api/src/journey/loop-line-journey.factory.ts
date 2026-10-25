import { createLinearLineAdapter } from './linear-line-journey.factory.js';

interface LoopDirection {
  toward: string;
  terminalName: string;
  platformNumber: string | null;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{
    door: string;
    gap: { distanceCm: number; level: string; label: string } | null;
  }>;
  accessibilityVerified: boolean;
  warning: string | null;
}

interface LoopStation {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  verificationMethod: string;
  elevators: ReadonlyArray<{
    id: string;
    name: string;
    operatingSection: string | null;
    location: string;
    kind: 'surface' | 'platform' | 'other';
  }>;
  directions: readonly LoopDirection[];
}

interface LoopGuidance {
  dataVersion: string;
  verifiedAt: string;
  topology: readonly string[];
  terminals: readonly [string, string];
  loopLayout: {
    mainStationCodes: readonly string[];
    loopStationCodes: readonly string[];
  };
  stations: readonly LoopStation[];
}

interface LoopLineConfig {
  id: string;
  lineName: string;
  guidance: LoopGuidance;
}

export function createLoopLineAdapter(config: LoopLineConfig) {
  const stationByCode = new Map(
    config.guidance.stations.map((station) => [station.stationCode, station]),
  );
  const adjacency = buildDirectedAdjacency(config.guidance.loopLayout);

  function findPath(originStationCode: string, destinationStationCode: string) {
    if (
      !stationByCode.has(originStationCode) ||
      !stationByCode.has(destinationStationCode)
    ) {
      return null;
    }
    const queue: string[][] = [[originStationCode]];
    const visited = new Set([originStationCode]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path.at(-1)!;
      if (current === destinationStationCode) return path;
      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        queue.push([...path, next]);
      }
    }
    return null;
  }

  function hasStation(stationCode: string) {
    return stationByCode.has(stationCode);
  }

  function distance(originStationCode: string, destinationStationCode: string) {
    const path = findPath(originStationCode, destinationStationCode);
    return path ? path.length - 1 : null;
  }

  function create(originStationCode: string, destinationStationCode: string) {
    if (originStationCode === destinationStationCode) return null;
    const path = findPath(originStationCode, destinationStationCode);
    if (!path) return null;
    const terminalName = resolveTerminalName(path, config.guidance.loopLayout);
    const pathStations = path.map((stationCode, index) => {
      const station = stationByCode.get(stationCode)!;
      const toward =
        path[index + 1] == null
          ? destinationPlatformToward(
              stationCode,
              terminalName,
              config.guidance.loopLayout,
              stationByCode,
            )
          : stationByCode.get(path[index + 1])?.stationName;
      return {
        ...station,
        directions: station.directions.map((direction) =>
          direction.toward === toward
            ? { ...direction, terminalName }
            : direction,
        ),
      };
    });
    const adapter = createLinearLineAdapter({
      id: config.id,
      lineName: config.lineName,
      guidance: {
        dataVersion: config.guidance.dataVersion,
        verifiedAt: config.guidance.verifiedAt,
        topology: path,
        terminals: [pathStations[0].stationName, terminalName],
        stations: pathStations,
      },
    });
    return adapter.create(originStationCode, destinationStationCode);
  }

  return { hasStation, distance, create };
}

function buildDirectedAdjacency(layout: LoopGuidance['loopLayout']) {
  const result = new Map<string, Set<string>>();
  const add = (from: string, to: string) => {
    const neighbors = result.get(from) ?? new Set<string>();
    neighbors.add(to);
    result.set(from, neighbors);
  };
  layout.mainStationCodes.forEach((code, index) => {
    if (index > 0) add(code, layout.mainStationCodes[index - 1]);
    if (index < layout.mainStationCodes.length - 1) {
      add(code, layout.mainStationCodes[index + 1]);
    }
  });
  layout.loopStationCodes.forEach((code, index) => {
    add(
      code,
      layout.loopStationCodes[(index + 1) % layout.loopStationCodes.length],
    );
  });
  return result;
}

function resolveTerminalName(
  path: readonly string[],
  layout: LoopGuidance['loopLayout'],
) {
  const destination = path.at(-1)!;
  const destinationMainIndex = layout.mainStationCodes.indexOf(destination);
  const lastMainIndex = layout.mainStationCodes.length - 1;
  if (destinationMainIndex > 0) {
    const firstMainIndex = layout.mainStationCodes.indexOf(path[0]);
    if (firstMainIndex === -1 || destinationMainIndex > firstMainIndex) {
      return '신내';
    }
  }
  if (destinationMainIndex === lastMainIndex) return '신내';
  return '응암순환';
}

function destinationPlatformToward(
  stationCode: string,
  terminalName: string,
  layout: LoopGuidance['loopLayout'],
  stationByCode: ReadonlyMap<string, LoopStation>,
) {
  if (terminalName === '신내') {
    const index = layout.mainStationCodes.indexOf(stationCode);
    const next = layout.mainStationCodes[index + 1];
    return stationByCode.get(next)?.stationName;
  }
  if (stationCode === layout.loopStationCodes[0]) {
    return stationByCode.get(layout.loopStationCodes[1])?.stationName;
  }
  const loopIndex = layout.loopStationCodes.indexOf(stationCode);
  if (loopIndex !== -1) {
    const next =
      layout.loopStationCodes[(loopIndex + 1) % layout.loopStationCodes.length];
    return stationByCode.get(next)?.stationName;
  }
  const mainIndex = layout.mainStationCodes.indexOf(stationCode);
  return stationByCode.get(layout.mainStationCodes[mainIndex - 1])?.stationName;
}
