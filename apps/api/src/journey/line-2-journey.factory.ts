import { LINE_2_GUIDANCE } from './data/line-2-guidance.generated.js';
import { toPlatformGap } from './platform-gap.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

type Line2Service = keyof typeof LINE_2_GUIDANCE.topologies;

interface Line2Gap {
  distanceCm: number;
  level: string;
  label: string;
}

interface Line2Direction {
  toward: string;
  aliases: readonly string[];
  service: Line2Service | null;
  platformNumber: string | null;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{ door: string; gap: Line2Gap | null }>;
  accessibilityVerified: boolean;
}

interface Line2LiveElevator {
  id: string;
  name: string;
  operatingSection: string;
  location: string;
  kind: 'surface' | 'platform' | 'other';
}

interface Line2Station {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  verificationMethod: string;
  liveElevators: readonly Line2LiveElevator[];
  directions: readonly Line2Direction[];
}

interface GraphEdge {
  from: string;
  to: string;
  service: Line2Service;
}

interface TrainSection {
  service: Line2Service;
  stationCodes: string[];
}

const stations = LINE_2_GUIDANCE.stations as readonly Line2Station[];
const stationByCode = new Map(
  stations.map((station) => [station.stationCode, station]),
);
const graph = createGraph();

export function createLine2JourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  if (originStationCode === destinationStationCode) return null;
  const path = findShortestPath(originStationCode, destinationStationCode);
  if (!path) return null;
  const sections = splitTrainSections(path);
  const origin = stationByCode.get(originStationCode)!;
  const destination = stationByCode.get(destinationStationCode)!;
  const firstSection = sections[0];
  const lastSection = sections.at(-1)!;
  const originDirection = findDirection(
    origin,
    stationByCode.get(firstSection.stationCodes[1])?.stationName,
    firstSection.service,
  );
  const destinationDirection = findArrivalDirection(lastSection);

  const facilityGroups: FacilityRequirementGroup[] = [];
  const steps: VerifiedJourneyStep[] = [];
  const originSurfaceGroup = createSurfaceGroup('origin', origin);
  const originPlatformGroup = createPlatformGroup(
    'origin-platform',
    origin,
    originDirection,
  );
  facilityGroups.push(originSurfaceGroup, originPlatformGroup);
  steps.push(
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.ENTRY,
      stationName: origin.stationName,
      instruction: toEntryInstruction(origin.exitNumbers),
      facilityGroupId: originSurfaceGroup.id,
      evidence: toEvidence(origin),
    },
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.GATE,
      stationName: origin.stationName,
      instruction: '대합실에서 교통카드를 태그하고 개찰구를 통과하세요.',
      evidence: toEvidence(origin),
    },
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.ELEVATOR,
      stationName: origin.stationName,
      instruction: originDirection
        ? `${originDirection.toward} 방면 승강장 엘리베이터를 이용하세요.`
        : '진행 방향 승강장 엘리베이터 위치를 현장 안내에서 확인하세요.',
      facilityGroupId: originPlatformGroup.id,
      evidence: toEvidence(origin),
    },
  );

  sections.forEach((section, index) => {
    const sectionOrigin = stationByCode.get(section.stationCodes[0])!;
    const sectionDestination = stationByCode.get(section.stationCodes.at(-1)!)!;
    const arrivalDirection = findArrivalDirection(section);
    const boarding = selectDoor(arrivalDirection);
    const directionName = toDirectionName(section);

    steps.push({
      order: 0,
      type: JOURNEY_STEP_TYPE.TRAIN,
      stationName: sectionOrigin.stationName,
      instruction: `2호선 ${directionName} 열차를 타고 ${sectionDestination.stationName}까지 이동하세요. ${
        boarding
          ? `${formatDoor(boarding.door)}을 이용하세요${toGapWarning(boarding.gap)}`
          : '추천 차량·문은 현장 승강기 위치 안내를 확인하세요'
      }.`,
      evidence: boarding
        ? '서울교통공사 승강기 위치 및 사용자 검증값 · KRIC 승강장 이격거리'
        : 'KRIC subwayRouteInfo',
      trainSegment: {
        lineName: '2호선',
        direction: directionName,
        originStationName: sectionOrigin.stationName,
        destinationStationName: sectionDestination.stationName,
        boardingPosition: boarding ? toDoorPosition(boarding.door) : null,
        alightingPosition: boarding ? toDoorPosition(boarding.door) : null,
        positionBasis: boarding ? 'destination_elevator' : 'unverified',
      },
      ...(boarding?.gap
        ? { platformGap: toPlatformGap(boarding.gap.distanceCm) }
        : {}),
    });

    if (index < sections.length - 1) {
      const nextSection = sections[index + 1];
      const transferStation = sectionDestination;
      const nextDirection = findDirection(
        transferStation,
        stationByCode.get(nextSection.stationCodes[1])?.stationName,
        nextSection.service,
      );
      const transferGroup = createPlatformGroup(
        `transfer-${index + 1}`,
        transferStation,
        nextDirection,
      );
      facilityGroups.push(transferGroup);
      steps.push({
        order: 0,
        type: JOURNEY_STEP_TYPE.TRANSFER,
        stationName: transferStation.stationName,
        instruction: `${transferStation.stationName}에서 ${toDirectionName(nextSection)} 열차로 갈아타세요. 승강장 엘리베이터를 이용하세요.`,
        facilityGroupId: transferGroup.id,
        evidence: toEvidence(transferStation),
      });
    }
  });

  const destinationPlatformGroup = createPlatformGroup(
    'destination-platform',
    destination,
    destinationDirection,
  );
  const destinationSurfaceGroup = createSurfaceGroup(
    'destination',
    destination,
  );
  facilityGroups.push(destinationPlatformGroup, destinationSurfaceGroup);
  const destinationDoor = selectDoor(destinationDirection);
  steps.push(
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.ELEVATOR,
      stationName: destination.stationName,
      instruction: destinationDoor
        ? `하차 후 ${formatDoor(destinationDoor.door)} 부근의 엘리베이터를 이용해 대합실로 이동하세요.`
        : '하차 후 승강장 엘리베이터를 이용해 대합실로 이동하세요. 위치는 현장 안내를 확인하세요.',
      facilityGroupId: destinationPlatformGroup.id,
      evidence: toEvidence(destination),
    },
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.GATE,
      stationName: destination.stationName,
      instruction: '대합실에서 하차 태그 후 개찰구를 통과하세요.',
      evidence: toEvidence(destination),
    },
    {
      order: 0,
      type: JOURNEY_STEP_TYPE.EXIT,
      stationName: destination.stationName,
      instruction: toExitInstruction(destination.exitNumbers),
      facilityGroupId: destinationSurfaceGroup.id,
      evidence: toEvidence(destination),
    },
  );
  steps.forEach((step, index) => {
    step.order = index + 1;
  });

  return {
    id: `line-2-${originStationCode}-to-${destinationStationCode}`,
    originStationCode,
    originStationName: origin.stationName,
    destinationStationCode,
    destinationStationName: destination.stationName,
    dataVersion: LINE_2_GUIDANCE.dataVersion,
    verifiedAt: LINE_2_GUIDANCE.verifiedAt,
    candidates: [
      {
        id: 'line-2-route',
        label:
          sections.length === 1 ? '2호선 직통 경로' : '2호선 지선 환승 경로',
        priority: 1,
        transferStation:
          sections.length > 1
            ? (stationByCode.get(sections[0].stationCodes.at(-1)!)
                ?.stationName ?? null)
            : null,
        lines: ['2호선'],
        facilityGroups,
        steps,
      },
    ],
  };
}

function createGraph() {
  const result = new Map<string, GraphEdge[]>();
  for (const [service, codes] of Object.entries(
    LINE_2_GUIDANCE.topologies,
  ) as Array<[Line2Service, readonly string[]]>) {
    const pairs = codes
      .slice(0, -1)
      .map((code, index) => [code, codes[index + 1]] as const);
    if (service === 'main') pairs.push([codes.at(-1)!, codes[0]]);
    for (const [left, right] of pairs) {
      addEdge(result, { from: left, to: right, service });
      addEdge(result, { from: right, to: left, service });
    }
  }
  return result;
}

function addEdge(graphMap: Map<string, GraphEdge[]>, edge: GraphEdge) {
  graphMap.set(edge.from, [...(graphMap.get(edge.from) ?? []), edge]);
}

function findShortestPath(origin: string, destination: string) {
  if (!graph.has(origin) || !graph.has(destination)) return null;
  const queue: Array<{ codes: string[]; edges: GraphEdge[] }> = [
    { codes: [origin], edges: [] },
  ];
  const visited = new Set([origin]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    const last = current.codes.at(-1)!;
    if (last === destination) return current;
    for (const edge of graph.get(last) ?? []) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      queue.push({
        codes: [...current.codes, edge.to],
        edges: [...current.edges, edge],
      });
    }
  }
  return null;
}

function splitTrainSections(path: { codes: string[]; edges: GraphEdge[] }) {
  const sections: TrainSection[] = [];
  path.edges.forEach((edge, index) => {
    const current = sections.at(-1);
    if (!current || current.service !== edge.service) {
      sections.push({
        service: edge.service,
        stationCodes: [edge.from, edge.to],
      });
    } else {
      current.stationCodes.push(edge.to);
    }
    if (index === path.edges.length - 1) return;
  });
  return sections;
}

function findArrivalDirection(section: TrainSection) {
  const destinationCode = section.stationCodes.at(-1)!;
  const previousCode = section.stationCodes.at(-2)!;
  const destination = stationByCode.get(destinationCode)!;
  const toward = continuationToward(
    section.service,
    previousCode,
    destinationCode,
  );
  return findDirection(destination, toward, section.service);
}

function continuationToward(
  service: Line2Service,
  previousCode: string,
  destinationCode: string,
) {
  const topology = LINE_2_GUIDANCE.topologies[service] as readonly string[];
  const previousIndex = topology.indexOf(previousCode);
  const destinationIndex = topology.indexOf(destinationCode);
  if (service === 'main') {
    const forward = (previousIndex + 1) % topology.length === destinationIndex;
    const nextIndex = forward
      ? (destinationIndex + 1) % topology.length
      : (destinationIndex - 1 + topology.length) % topology.length;
    return stationByCode.get(topology[nextIndex])?.stationName;
  }
  const step = Math.sign(destinationIndex - previousIndex);
  const nextCode = topology[destinationIndex + step];
  if (nextCode) return stationByCode.get(nextCode)?.stationName;
  if (service === 'sinjeong' && destinationCode === '0234') return '대림';
  return stationByCode.get(destinationCode)?.stationName;
}

function findDirection(
  station: Line2Station,
  toward: string | undefined,
  service: Line2Service,
) {
  const serviceDirections = station.directions.filter(
    (direction) => !direction.service || direction.service === service,
  );
  return (
    serviceDirections.find(
      (direction) =>
        direction.service === service &&
        (direction.toward === toward ||
          direction.aliases.includes(toward ?? '')),
    ) ??
    serviceDirections.find(
      (direction) =>
        direction.toward === toward || direction.aliases.includes(toward ?? ''),
    ) ??
    serviceDirections.find((direction) => direction.service === service) ??
    serviceDirections.find((direction) => direction.recommendedDoors.length > 0)
  );
}

function selectDoor(direction?: Line2Direction) {
  if (!direction) return null;
  const candidates = direction.recommendedDoors
    .map((door) => ({
      door,
      gap: direction.doorGaps.find((item) => item.door === door)?.gap ?? null,
    }))
    .filter((candidate) => candidate.gap?.level !== 'red')
    .sort((left, right) => {
      if (left.gap && right.gap)
        return left.gap.distanceCm - right.gap.distanceCm;
      if (left.gap) return -1;
      if (right.gap) return 1;
      return left.door.localeCompare(right.door, 'ko', { numeric: true });
    });
  return candidates[0] ?? null;
}

function createSurfaceGroup(prefix: string, station: Line2Station) {
  const facilities = station.liveElevators.filter(
    (facility) => facility.kind === 'surface',
  );
  if (facilities.length === 0) {
    return createUnknownGroup(
      `${prefix}-${station.stationCode}-surface-unverified`,
      station,
      `${station.stationName} 지상 엘리베이터`,
      '지상 연결 실시간 시설 미확인',
    );
  }
  return {
    id: `${prefix}-${station.stationCode}-surface`,
    label: `${station.stationName} 지상 엘리베이터`,
    policy: 'any' as const,
    facilities: facilities.map((facility) =>
      toFacility(station, facility, '지상과 대합실 이동'),
    ),
  };
}

function createPlatformGroup(
  prefix: string,
  station: Line2Station,
  direction?: Line2Direction,
): FacilityRequirementGroup {
  const facilities = direction
    ? station.liveElevators.filter(
        (facility) =>
          facility.kind === 'platform' &&
          ([direction.toward, ...direction.aliases].some((toward) =>
            normalize(facility.location).includes(normalize(toward)),
          ) ||
            direction.recommendedDoors.some((door) =>
              normalize(facility.location).includes(normalize(door)),
            )),
      )
    : [];
  if (!direction || facilities.length === 0) {
    return createUnknownGroup(
      `${prefix}-${station.stationCode}-unverified`,
      station,
      `${station.stationName} 승강장 엘리베이터`,
      '승강장 연결 실시간 시설 미확인',
    );
  }
  return {
    id: `${prefix}-${station.stationCode}`,
    label: `${station.stationName} ${direction.toward} 방면 승강장 엘리베이터`,
    policy: 'any',
    facilities: facilities.map((facility) =>
      toFacility(station, facility, '대합실과 승강장 이동'),
    ),
  };
}

function createUnknownGroup(
  id: string,
  station: Line2Station,
  label: string,
  role: string,
): FacilityRequirementGroup {
  return {
    id,
    label,
    policy: 'all',
    facilities: [
      {
        id,
        stationCode: station.stationCode,
        stationName: station.stationName,
        role,
        sourceFacilityName: null,
        expectedOperatingSection: null,
        expectedLocation: null,
      },
    ],
  };
}

function toFacility(
  station: Line2Station,
  facility: Line2LiveElevator,
  role: string,
) {
  return {
    id: facility.id,
    stationCode: station.stationCode,
    stationName: station.stationName,
    role,
    sourceFacilityName: facility.name,
    expectedOperatingSection: facility.operatingSection,
    expectedLocation: facility.location,
  };
}

function toDirectionName(section: TrainSection) {
  const next = stationByCode.get(section.stationCodes[1])?.stationName;
  const destination = stationByCode.get(
    section.stationCodes.at(-1)!,
  )?.stationName;
  if (section.service === 'main') return `${next} 방면`;
  return `${destination} 방면`;
}

function toDoorPosition(door: string) {
  const match = /^(\d+)-(\d+)$/.exec(door);
  return match
    ? { carNumber: Number(match[1]), doorNumber: Number(match[2]) }
    : null;
}

function formatDoor(door: string) {
  const [car, entrance] = door.split('-');
  return `${car}호차 ${entrance}번 문`;
}

function toEntryInstruction(exitNumbers: readonly string[]) {
  if (exitNumbers.length === 0)
    return '지상 엘리베이터 출구 정보가 확인되지 않았습니다. 현장 안내를 확인하세요.';
  if (exitNumbers.length === 1)
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용해 대합실로 이동하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 가까운 출구의 지상 엘리베이터를 이용해 대합실로 이동하세요.`;
}

function toExitInstruction(exitNumbers: readonly string[]) {
  if (exitNumbers.length === 0)
    return '지상으로 연결되는 엘리베이터 출구가 확인되지 않았습니다. 다른 노선 환승 안내 또는 현장 안내를 확인하세요.';
  if (exitNumbers.length === 1)
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 목적지와 가까운 지상 엘리베이터를 이용하세요.`;
}

function toGapWarning(gap: Line2Gap | null) {
  if (!gap) return ' (승강장 간격 미확인)';
  return gap.level === 'yellow' ? ' (승강장 간격 주의)' : '';
}

function toEvidence(station: Line2Station) {
  return station.verificationMethod === 'manual_verification'
    ? '사용자 수동 검증값 및 서울교통공사 승강기 현황'
    : '서울교통공사 승강기 현황 및 KRIC 접근성 API';
}

function normalize(value: string) {
  return value.replace(/[\s()]/g, '');
}
