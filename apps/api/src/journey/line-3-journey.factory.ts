import { LINE_3_GUIDANCE } from './data/line-3-guidance.generated.js';
import { toPlatformGap } from './platform-gap.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

interface Line3Gap {
  distanceCm: number;
  level: string;
  label: string;
}

interface Line3Direction {
  toward: string;
  platformNumber: string | null;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{ door: string; gap: Line3Gap | null }>;
  accessibilityVerified: boolean;
  warning: string | null;
}

interface Line3LiveElevator {
  id: string;
  name: string;
  operatingSection: string;
  location: string;
  kind: 'surface' | 'platform' | 'other';
}

interface Line3Station {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  verificationMethod: string;
  liveElevators: readonly Line3LiveElevator[];
  directions: readonly Line3Direction[];
}

const topology = LINE_3_GUIDANCE.topology as readonly string[];
const stations = LINE_3_GUIDANCE.stations as readonly Line3Station[];

export function hasLine3Station(stationCode: string) {
  return topology.includes(stationCode);
}

export function getLine3Distance(
  originStationCode: string,
  destinationStationCode: string,
) {
  const originIndex = topology.indexOf(originStationCode);
  const destinationIndex = topology.indexOf(destinationStationCode);
  if (originIndex === -1 || destinationIndex === -1) return null;
  return Math.abs(destinationIndex - originIndex);
}

export function createLine3JourneyDefinition(
  originStationCode: string,
  destinationStationCode: string,
): VerifiedJourneyDefinition | null {
  if (originStationCode === destinationStationCode) return null;
  const originIndex = topology.indexOf(originStationCode);
  const destinationIndex = topology.indexOf(destinationStationCode);
  if (originIndex === -1 || destinationIndex === -1) return null;

  const origin = stations[originIndex];
  const destination = stations[destinationIndex];
  const step = Math.sign(destinationIndex - originIndex);
  const terminalName = step > 0 ? '오금' : '대화';
  const departureToward = stations[originIndex + step]?.stationName;
  const arrivalToward =
    stations[destinationIndex + step]?.stationName ?? destination.stationName;
  const originDirection = findDirection(origin, departureToward, terminalName);
  const destinationDirection = findDirection(
    destination,
    arrivalToward,
    terminalName,
  );
  const boarding = selectDoor(destinationDirection);

  const originSurfaceGroup = createSurfaceGroup(
    'origin',
    origin,
    '출발역 지상 진입',
  );
  const originPlatformGroup = createPlatformGroup(
    'origin-platform',
    origin,
    originDirection,
    '출발 승강장 이동',
  );
  const destinationPlatformGroup = createPlatformGroup(
    'destination-platform',
    destination,
    destinationDirection,
    '도착 승강장 하차',
  );
  const destinationSurfaceGroup = createSurfaceGroup(
    'destination',
    destination,
    '도착역 지상 퇴장',
  );
  const facilityGroups: FacilityRequirementGroup[] = [
    originSurfaceGroup,
    originPlatformGroup,
    destinationPlatformGroup,
    destinationSurfaceGroup,
  ];
  if (
    !originDirection?.accessibilityVerified ||
    !destinationDirection?.accessibilityVerified
  ) {
    facilityGroups.push(
      createUnknownGroup(
        'line-3-static-accessibility-unverified',
        destination,
        '3호선 정적 엘리베이터 안전 경로 확인',
        '엘리베이터 안전 경로 미확인',
      ),
    );
  }

  const steps: VerifiedJourneyStep[] = [
    {
      order: 1,
      type: JOURNEY_STEP_TYPE.ENTRY,
      stationName: origin.stationName,
      instruction: toEntryInstruction(origin.exitNumbers),
      facilityGroupId: originSurfaceGroup.id,
      evidence: toEvidence(origin),
    },
    {
      order: 2,
      type: JOURNEY_STEP_TYPE.GATE,
      stationName: origin.stationName,
      instruction: '대합실에서 교통카드를 태그하고 개찰구를 통과하세요.',
      evidence: toEvidence(origin),
    },
    {
      order: 3,
      type: JOURNEY_STEP_TYPE.ELEVATOR,
      stationName: origin.stationName,
      instruction: originDirection
        ? `${originDirection.toward} 방면 승강장 엘리베이터를 이용하세요.`
        : '진행 방향 승강장 엘리베이터 위치를 현장 안내에서 확인하세요.',
      facilityGroupId: originPlatformGroup.id,
      evidence: toEvidence(origin),
    },
    {
      order: 4,
      type: JOURNEY_STEP_TYPE.TRAIN,
      stationName: origin.stationName,
      instruction: `3호선 ${terminalName} 방면 열차를 타고 ${destination.stationName}까지 이동하세요. ${
        boarding
          ? `${formatDoor(boarding.door)}을 이용하세요${toGapWarning(boarding.gap)}`
          : '추천 차량·문은 현장 승강기 위치 안내를 확인하세요'
      }.`,
      evidence: boarding
        ? 'KRIC stationElevatorCarNumber · stationPlatformTrainDistance 및 사용자 검증값'
        : 'KRIC subwayRouteInfo',
      trainSegment: {
        lineName: '3호선',
        direction: `${terminalName} 방면`,
        originStationName: origin.stationName,
        destinationStationName: destination.stationName,
        boardingPosition: boarding ? toDoorPosition(boarding.door) : null,
        alightingPosition: boarding ? toDoorPosition(boarding.door) : null,
        positionBasis: boarding ? 'destination_elevator' : 'unverified',
      },
      ...(boarding?.gap
        ? { platformGap: toPlatformGap(boarding.gap.distanceCm) }
        : {}),
    },
    {
      order: 5,
      type: JOURNEY_STEP_TYPE.ELEVATOR,
      stationName: destination.stationName,
      instruction: boarding
        ? `하차 후 ${formatDoor(boarding.door)} 부근의 엘리베이터를 이용해 대합실로 이동하세요.`
        : '하차 후 승강장 엘리베이터를 이용해 대합실로 이동하세요. 위치는 현장 안내를 확인하세요.',
      facilityGroupId: destinationPlatformGroup.id,
      evidence: toEvidence(destination),
    },
    {
      order: 6,
      type: JOURNEY_STEP_TYPE.GATE,
      stationName: destination.stationName,
      instruction: '대합실에서 하차 태그 후 개찰구를 통과하세요.',
      evidence: toEvidence(destination),
    },
    {
      order: 7,
      type: JOURNEY_STEP_TYPE.EXIT,
      stationName: destination.stationName,
      instruction: toExitInstruction(destination.exitNumbers),
      facilityGroupId: destinationSurfaceGroup.id,
      evidence: toEvidence(destination),
    },
  ];

  return {
    id: `line-3-${originStationCode}-to-${destinationStationCode}`,
    originStationCode,
    originStationName: origin.stationName,
    destinationStationCode,
    destinationStationName: destination.stationName,
    dataVersion: LINE_3_GUIDANCE.dataVersion,
    verifiedAt: LINE_3_GUIDANCE.verifiedAt,
    candidates: [
      {
        id: 'line-3-direct',
        label: '3호선 직통 경로',
        priority: 1,
        transferStation: null,
        lines: ['3호선'],
        facilityGroups,
        steps,
      },
    ],
  };
}

function findDirection(
  station: Line3Station,
  toward?: string,
  terminalName?: string,
) {
  return (
    station.directions.find((direction) => direction.toward === toward) ??
    station.directions.find((direction) => direction.toward === terminalName) ??
    station.directions.find(
      (direction) => direction.recommendedDoors.length > 0,
    )
  );
}

function selectDoor(direction?: Line3Direction) {
  if (!direction || direction.recommendedDoors.length === 0) return null;
  return direction.recommendedDoors
    .map((door) => ({
      door,
      gap: direction.doorGaps.find((item) => item.door === door)?.gap ?? null,
    }))
    .sort((left, right) => {
      if (left.gap && right.gap)
        return left.gap.distanceCm - right.gap.distanceCm;
      if (left.gap) return -1;
      if (right.gap) return 1;
      return left.door.localeCompare(right.door, 'ko', { numeric: true });
    })[0];
}

function createSurfaceGroup(
  prefix: string,
  station: Line3Station,
  role: string,
): FacilityRequirementGroup {
  const facilities = station.liveElevators.filter(
    (facility) => facility.kind === 'surface',
  );
  if (facilities.length === 0) {
    return createUnknownGroup(
      `${prefix}-surface-unverified`,
      station,
      `${station.stationName} 지상 엘리베이터`,
      `${role} 실시간 시설 연결 미확인`,
    );
  }
  return {
    id: `${prefix}-${station.stationCode}-surface`,
    label: `${station.stationName} 지상 엘리베이터`,
    policy: 'any',
    facilities: facilities.map((facility) =>
      toFacility(station, facility, role),
    ),
  };
}

function createPlatformGroup(
  prefix: string,
  station: Line3Station,
  direction: Line3Direction | undefined,
  role: string,
): FacilityRequirementGroup {
  const facilities = direction
    ? station.liveElevators.filter(
        (facility) =>
          facility.kind === 'platform' &&
          (normalize(facility.location).includes(normalize(direction.toward)) ||
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
      `${role} 실시간 시설 연결 미확인`,
    );
  }
  return {
    id: `${prefix}-${station.stationCode}`,
    label: `${station.stationName} ${direction.toward} 방면 승강장 엘리베이터`,
    policy: 'any',
    facilities: facilities.map((facility) =>
      toFacility(station, facility, role),
    ),
  };
}

function createUnknownGroup(
  id: string,
  station: Line3Station,
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
  station: Line3Station,
  facility: Line3LiveElevator,
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
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 가까운 지상 엘리베이터를 이용하세요.`;
}

function toExitInstruction(exitNumbers: readonly string[]) {
  if (exitNumbers.length === 0)
    return '지상으로 연결되는 엘리베이터 출구가 확인되지 않았습니다. 다른 노선 환승 안내 또는 현장 안내를 확인하세요.';
  if (exitNumbers.length === 1)
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 목적지와 가까운 지상 엘리베이터를 이용하세요.`;
}

function toGapWarning(gap: Line3Gap | null) {
  if (!gap) return ' (승강장 간격 미확인)';
  return gap.level === 'yellow' ? ' (승강장 간격 주의)' : '';
}

function toEvidence(station: Line3Station) {
  return station.verificationMethod === 'manual_verification'
    ? '사용자 수동 검증값'
    : 'KRIC 접근성 API 연결값';
}

function normalize(value: string) {
  return value.replace(/[\s()]/g, '');
}
