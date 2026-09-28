import { LINE_5_GUIDANCE } from './data/line-5-guidance.generated.js';
import { toPlatformGap } from './platform-gap.js';
import {
  JOURNEY_STEP_TYPE,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

type Line5Topology = readonly string[];
type Line5Segment = ReturnType<typeof toSegment>;
interface Line5Direction {
  toward: string;
  platformNumber: string | null;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{
    door: string;
    gap: { distanceCm: number; level: string; label: string } | null;
  }>;
  accessibilityVerified: boolean;
  warning: string | null;
}

interface Line5LiveElevator {
  id: string;
  name: string;
  operatingSection: string;
  location: string;
  kind: 'surface' | 'platform' | 'other';
}

interface Line5Station {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  verificationMethod: string;
  liveElevators: readonly Line5LiveElevator[];
  directions: readonly Line5Direction[];
}

const line5Stations = LINE_5_GUIDANCE.stations as readonly Line5Station[];
const line5Topologies =
  LINE_5_GUIDANCE.topologies as readonly Line5Topology[];

const TRANSFER_STATION_CODE = '2549';

export function listLine5Stations() {
  return line5Stations.map((station) => ({
    stationCode: station.stationCode,
    stationName: station.stationName,
    lineName: '5호선' as const,
  }));
}

export function createLine5JourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  if (originStationCode === destinationStationCode) return null;

  const origin = findStation(originStationCode);
  const destination = findStation(destinationStationCode);
  if (!origin || !destination) return null;

  const segments = resolveSegments(originStationCode, destinationStationCode);
  if (!segments) return null;

  const steps: VerifiedJourneyStep[] = [];
  let order = 1;
  steps.push({
    order: order++,
    type: JOURNEY_STEP_TYPE.ENTRY,
    stationName: origin.stationName,
    instruction:
      origin.exitNumbers.length > 0
        ? `${origin.exitNumbers.join(', ')}번 출구의 지상 엘리베이터를 이용해 대합실로 이동하세요.`
        : '지상 엘리베이터 출구 정보가 확인되지 않았습니다. 현장 안내를 확인하세요.',
    evidence: toStationEvidence(origin),
  });

  let hasUnverifiedAccessibility =
    origin.exitNumbers.length === 0 || segments.length > 1;
  for (const [index, segment] of segments.entries()) {
    if (index > 0) {
      steps.push({
        order: order++,
        type: JOURNEY_STEP_TYPE.TRANSFER,
        stationName: findStation(segment.codes[0])!.stationName,
        instruction: `강동역에서 ${segment.terminalLabel} 열차로 갈아타세요. 엘리베이터 안전 경로는 현장 표지를 함께 확인하세요.`,
        evidence: '5호선 노선 분기 검증값',
      });
    }

    const arrival = findStation(segment.codes.at(-1)!)!;
    const arrivalDirection = findArrivalDirection(arrival, segment);
    const boarding = selectBoardingDoor(arrivalDirection);
    if (!boarding || !arrivalDirection?.accessibilityVerified) {
      hasUnverifiedAccessibility = true;
    }

    const boardingText = boarding
      ? `${formatDoor(boarding.door)}을 이용하세요${toGapWarning(boarding.gap)}`
      : '추천 차량·문을 확인할 수 없어 현장 승강기 위치 안내를 확인하세요';
    steps.push({
      order: order++,
      type: JOURNEY_STEP_TYPE.TRAIN,
      stationName: findStation(segment.codes[0])!.stationName,
      instruction: `5호선 ${segment.terminalLabel} 열차를 타고 ${arrival.stationName}까지 이동하세요. ${boardingText}.`,
      evidence: 'KRIC stPlf · stationElevatorCarNumber · stationPlatformTrainDistance',
      ...(boarding?.gap
        ? { platformGap: toPlatformGap(boarding.gap.distanceCm) }
        : {}),
    });
  }

  const finalSegment = segments.at(-1)!;
  const destinationDirection = findArrivalDirection(destination, finalSegment);
  const destinationBoarding = selectBoardingDoor(destinationDirection);
  steps.push({
    order: order++,
    type: JOURNEY_STEP_TYPE.ELEVATOR,
    stationName: destination.stationName,
    instruction: destinationBoarding
      ? `하차 후 ${formatDoor(destinationBoarding.door)} 부근의 엘리베이터로 이동하세요.`
      : '하차 후 엘리베이터 위치가 확인되지 않았습니다. 현장 안내를 확인하세요.',
    evidence: toStationEvidence(destination),
  });
  steps.push({
    order: order++,
    type: JOURNEY_STEP_TYPE.EXIT,
    stationName: destination.stationName,
    instruction:
      destination.exitNumbers.length > 0
        ? `${destination.exitNumbers.join(', ')}번 출구 중 목적지와 가까운 지상 엘리베이터를 이용하세요.`
        : '지상 엘리베이터 출구 정보가 확인되지 않았습니다. 현장 안내를 확인하세요.',
    evidence: toStationEvidence(destination),
  });

  const firstSegment = segments[0];
  const originDirection = findDepartureDirection(origin, firstSegment);
  const facilityGroups = [
    createSurfaceFacilityGroup('origin', origin, '출발역 지상 진입'),
    ...createDirectionalFacilityGroups(
      'origin-platform',
      origin,
      originDirection,
      '출발 승강장 이동',
    ),
    ...createTransferFacilityGroups(segments),
    ...createDirectionalFacilityGroups(
      'destination-platform',
      destination,
      destinationDirection,
      '도착 승강장 하차',
    ),
    createSurfaceFacilityGroup(
      'destination',
      destination,
      '도착역 지상 퇴장',
    ),
  ];
  if (hasUnverifiedAccessibility) {
    facilityGroups.push(
      createUnknownFacilityGroup(
        'line-5-static-accessibility-unverified',
        destination,
        '정적 엘리베이터 안전 경로 확인',
        '엘리베이터 안전 경로 미확인',
      ),
    );
  }

  const transferStation = segments.length > 1 ? '강동' : null;
  return {
    id: `line-5-${originStationCode}-to-${destinationStationCode}`,
    originStationCode,
    originStationName: origin.stationName,
    destinationStationCode,
    destinationStationName: destination.stationName,
    dataVersion: LINE_5_GUIDANCE.dataVersion,
    verifiedAt: LINE_5_GUIDANCE.verifiedAt,
    candidates: [
      {
        id: 'line-5-general-route',
        label: transferStation
          ? '5호선 강동 환승 경로'
          : '5호선 직통 경로',
        priority: 1,
        transferStation,
        lines: ['5호선'],
        facilityGroups,
        steps,
      },
    ],
  };
}

function resolveSegments(originCode: string, destinationCode: string) {
  const directTopologies = line5Topologies.filter(
    (topology) => topology.includes(originCode) && topology.includes(destinationCode),
  );
  if (directTopologies.length > 0) {
    const topology = chooseDirectTopology(
      directTopologies,
      originCode,
      destinationCode,
    );
    return [toSegment(topology, originCode, destinationCode, directTopologies.length > 1)];
  }

  const originTopology = line5Topologies.find(
    (topology) => topology.includes(originCode) && topology.includes(TRANSFER_STATION_CODE),
  );
  const destinationTopology = line5Topologies.find(
    (topology) => topology.includes(destinationCode) && topology.includes(TRANSFER_STATION_CODE),
  );
  if (!originTopology || !destinationTopology) return null;
  return [
    toSegment(originTopology, originCode, TRANSFER_STATION_CODE, false),
    toSegment(destinationTopology, TRANSFER_STATION_CODE, destinationCode, false),
  ];
}

function chooseDirectTopology(
  topologies: readonly Line5Topology[],
  originCode: string,
  destinationCode: string,
) {
  const travelingEast =
    topologies[0].indexOf(destinationCode) > topologies[0].indexOf(originCode);
  if (!travelingEast || topologies.length === 1) return topologies[0];
  return topologies[0];
}

function toSegment(
  topology: Line5Topology,
  originCode: string,
  destinationCode: string,
  sharedCommonSection: boolean,
) {
  const originIndex = topology.indexOf(originCode);
  const destinationIndex = topology.indexOf(destinationCode);
  const step = Math.sign(destinationIndex - originIndex);
  const codes: string[] = [];
  for (
    let index = originIndex;
    index !== destinationIndex + step;
    index += step
  ) {
    codes.push(topology[index]);
  }
  const terminalLabel =
    step < 0
      ? '방화 방면'
      : sharedCommonSection
        ? '하남검단산·마천 방면'
        : `${findStation(topology.at(-1)!)!.stationName} 방면`;
  return { topology, codes, step, terminalLabel };
}

function findArrivalDirection(
  station: Line5Station,
  segment: ReturnType<typeof toSegment>,
) {
  const destinationCode = segment.codes.at(-1)!;
  const destinationIndex = segment.topology.indexOf(destinationCode);
  const nextCode =
    segment.topology[destinationIndex + segment.step] ?? destinationCode;
  const nextName = findStation(nextCode)?.stationName;
  return station.directions.find((direction) => direction.toward === nextName);
}

function findDepartureDirection(
  station: Line5Station,
  segment: ReturnType<typeof toSegment>,
) {
  const nextCode = segment.codes[1] ?? segment.codes[0];
  const nextName = findStation(nextCode)?.stationName;
  return station.directions.find((direction) => direction.toward === nextName);
}

function createTransferFacilityGroups(
  segments: readonly Line5Segment[],
) {
  if (segments.length < 2) return [];
  const transferStation = findStation(TRANSFER_STATION_CODE)!;
  const arrivalDirection = findArrivalDirection(transferStation, segments[0]);
  const departureDirection = findDepartureDirection(
    transferStation,
    segments[1],
  );
  return [
    ...createDirectionalFacilityGroups(
      'transfer-arrival',
      transferStation,
      arrivalDirection,
      '강동역 환승 하차',
    ),
    ...createDirectionalFacilityGroups(
      'transfer-departure',
      transferStation,
      departureDirection,
      '강동역 환승 승차',
    ),
  ];
}

function createSurfaceFacilityGroup(
  prefix: string,
  station: Line5Station,
  role: string,
) {
  const facilities = station.liveElevators.filter(
    (facility) => facility.kind === 'surface',
  );
  if (facilities.length === 0) {
    return createUnknownFacilityGroup(
      `${prefix}-surface-unverified`,
      station,
      `${station.stationName} 지상 엘리베이터`,
      `${role} 실시간 시설 연결 미확인`,
    );
  }
  return {
    id: `${prefix}-${station.stationCode}-surface`,
    label: `${station.stationName} 지상 엘리베이터`,
    policy: 'any' as const,
    facilities: facilities.map((facility) =>
      toFacilityRef(station, facility, role),
    ),
  };
}

function createDirectionalFacilityGroups(
  prefix: string,
  station: Line5Station,
  direction: Line5Direction | undefined,
  role: string,
) {
  const facilities = direction
    ? station.liveElevators.filter(
        (facility) =>
          facility.kind === 'platform' &&
          normalizeText(facility.location).includes(
            normalizeText(direction.toward),
          ),
      )
    : [];
  if (!direction || facilities.length === 0) {
    return [
      createUnknownFacilityGroup(
        `${prefix}-${station.stationCode}-unverified`,
        station,
        `${station.stationName} 승강장 엘리베이터`,
        `${role} 실시간 시설 연결 미확인`,
      ),
    ];
  }

  const bySection = new Map<string, Line5LiveElevator[]>();
  for (const facility of facilities) {
    const sectionFacilities = bySection.get(facility.operatingSection) ?? [];
    sectionFacilities.push(facility);
    bySection.set(facility.operatingSection, sectionFacilities);
  }
  return [...bySection.entries()].map(
    ([operatingSection, sectionFacilities], index) => ({
      id: `${prefix}-${station.stationCode}-${index + 1}`,
      label: `${station.stationName} ${direction.toward} 방면 ${operatingSection} 엘리베이터`,
      policy: 'any' as const,
      facilities: sectionFacilities.map((facility) =>
        toFacilityRef(station, facility, role),
      ),
    }),
  );
}

function createUnknownFacilityGroup(
  id: string,
  station: Line5Station,
  label: string,
  role: string,
) {
  return {
    id,
    label,
    policy: 'all' as const,
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

function toFacilityRef(
  station: Line5Station,
  facility: Line5LiveElevator,
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

function normalizeText(value: string) {
  return value.replace(/[\s()]/g, '');
}

function selectBoardingDoor(
  direction: Line5Station['directions'][number] | undefined,
) {
  if (!direction || direction.recommendedDoors.length === 0) return null;
  const candidates = direction.recommendedDoors.map((door) => ({
    door,
    gap: direction.doorGaps.find((item) => item.door === door)?.gap ?? null,
  }));
  return candidates.sort((left, right) => {
    if (left.gap && right.gap) {
      return left.gap.distanceCm - right.gap.distanceCm;
    }
    if (left.gap) return -1;
    if (right.gap) return 1;
    return left.door.localeCompare(right.door, 'ko', { numeric: true });
  })[0];
}

function findStation(stationCode: string) {
  return line5Stations.find(
    (station) => station.stationCode === stationCode,
  );
}

function formatDoor(door: string) {
  const [car, entrance] = door.split('-');
  return `${car}호차 ${entrance}번 문`;
}

function toGapWarning(gap: { level: string } | null) {
  if (!gap) return ' (이격거리 미확인)';
  if (gap.level === 'yellow') return ' (승강장 간격 주의)';
  return '';
}

function toStationEvidence(station: Line5Station) {
  return station.verificationMethod === 'manual_direction_assignment'
    ? '사용자 수동 검증값'
    : 'KRIC 접근성 API 연결값';
}
