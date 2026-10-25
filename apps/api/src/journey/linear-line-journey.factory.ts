import { toPlatformGap } from './platform-gap.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

interface LinearGap {
  distanceCm: number;
  level: string;
  label: string;
}

interface LinearDirection {
  toward: string;
  terminalName: string;
  platformNumber: string | null;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{ door: string; gap: LinearGap | null }>;
  accessibilityVerified: boolean;
  warning: string | null;
}

interface LinearStation {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  verificationMethod: string;
  elevators: readonly LinearElevator[];
  directions: readonly LinearDirection[];
}

interface LinearElevator {
  id: string;
  name: string;
  operatingSection: string | null;
  location: string;
  kind: 'surface' | 'platform' | 'other';
}

interface LinearGuidance {
  dataVersion: string;
  verifiedAt: string;
  topology: readonly string[];
  terminals: readonly [string, string];
  stations: readonly LinearStation[];
}

interface LinearLineConfig {
  id: string;
  lineName: string;
  guidance: LinearGuidance;
}

export function createLinearLineAdapter(config: LinearLineConfig) {
  const { topology, stations, terminals } = config.guidance;

  function hasStation(stationCode: string) {
    return topology.includes(stationCode);
  }

  function distance(originStationCode: string, destinationStationCode: string) {
    const originIndex = topology.indexOf(originStationCode);
    const destinationIndex = topology.indexOf(destinationStationCode);
    if (originIndex === -1 || destinationIndex === -1) return null;
    return Math.abs(destinationIndex - originIndex);
  }

  function create(
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
    const terminalName = step > 0 ? terminals[1] : terminals[0];
    const departureToward = stations[originIndex + step]?.stationName;
    const originDirection = findDirection(
      origin,
      terminalName,
      departureToward,
    );
    const destinationDirection = findDirection(destination, terminalName);
    const boarding = selectDoor(destinationDirection);
    const facilityGroups = [
      createSurfaceGroup(
        config.id,
        'origin-surface',
        origin,
        '출발역 지상 진입',
      ),
      createPlatformGroup(
        config.id,
        'origin-platform',
        origin,
        originDirection,
        '출발 승강장 이동',
      ),
      createPlatformGroup(
        config.id,
        'destination-platform',
        destination,
        destinationDirection,
        '도착 승강장 하차',
      ),
      createSurfaceGroup(
        config.id,
        'destination-surface',
        destination,
        '도착역 지상 퇴장',
      ),
    ];
    const evidence = 'KRIC 이동경로·승강기 인접 차량 문·승강장 이격거리';
    const steps: VerifiedJourneyStep[] = [
      {
        order: 1,
        type: JOURNEY_STEP_TYPE.ENTRY,
        stationName: origin.stationName,
        instruction: entryInstruction(origin.exitNumbers),
        facilityGroupId: facilityGroups[0].id,
        evidence,
      },
      {
        order: 2,
        type: JOURNEY_STEP_TYPE.GATE,
        stationName: origin.stationName,
        instruction: '대합실에서 교통카드를 태그하고 개찰구를 통과하세요.',
        evidence,
      },
      {
        order: 3,
        type: JOURNEY_STEP_TYPE.ELEVATOR,
        stationName: origin.stationName,
        instruction: originDirection
          ? `${originDirection.toward} 방향 승강장 엘리베이터를 이용하세요.`
          : '진행 방향 승강장 엘리베이터 위치를 현장 안내에서 확인하세요.',
        facilityGroupId: facilityGroups[1].id,
        evidence,
      },
      {
        order: 4,
        type: JOURNEY_STEP_TYPE.TRAIN,
        stationName: origin.stationName,
        instruction: `${config.lineName} ${terminalName}행 열차를 타고 ${destination.stationName}까지 이동하세요.`,
        evidence,
        trainSegment: {
          lineName: config.lineName,
          direction: `${terminalName}행`,
          originStationName: origin.stationName,
          destinationStationName: destination.stationName,
          boardingPosition: boarding ? doorPosition(boarding.door) : null,
          alightingPosition: boarding ? doorPosition(boarding.door) : null,
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
        facilityGroupId: facilityGroups[2].id,
        evidence,
      },
      {
        order: 6,
        type: JOURNEY_STEP_TYPE.GATE,
        stationName: destination.stationName,
        instruction: '대합실에서 하차 태그 후 개찰구를 통과하세요.',
        evidence,
      },
      {
        order: 7,
        type: JOURNEY_STEP_TYPE.EXIT,
        stationName: destination.stationName,
        instruction: exitInstruction(destination.exitNumbers),
        facilityGroupId: facilityGroups[3].id,
        evidence,
      },
    ];

    return {
      id: `${config.id}-${originStationCode}-to-${destinationStationCode}`,
      originStationCode,
      originStationName: origin.stationName,
      destinationStationCode,
      destinationStationName: destination.stationName,
      dataVersion: config.guidance.dataVersion,
      verifiedAt: config.guidance.verifiedAt,
      candidates: [
        {
          id: `${config.id}-direct`,
          label: `${config.lineName} 직통 경로`,
          priority: 1,
          transferStation: null,
          lines: [config.lineName],
          facilityGroups,
          steps,
        },
      ],
    };
  }

  return { hasStation, distance, create };
}

function findDirection(
  station: LinearStation,
  terminalName: string,
  toward?: string,
) {
  return (
    station.directions.find(
      (direction) => direction.terminalName === terminalName,
    ) ??
    station.directions.find((direction) => direction.toward === toward) ??
    (station.directions.length === 1 ? station.directions[0] : undefined)
  );
}

function selectDoor(direction?: LinearDirection) {
  if (!direction) return null;
  return (
    direction.recommendedDoors
      .map((door) => ({
        door,
        gap: direction.doorGaps.find((item) => item.door === door)?.gap ?? null,
      }))
      .filter(({ gap }) => gap?.level !== 'red')
      .toSorted((left, right) => {
        if (left.gap && right.gap)
          return left.gap.distanceCm - right.gap.distanceCm;
        if (left.gap) return -1;
        if (right.gap) return 1;
        return left.door.localeCompare(right.door, 'ko', { numeric: true });
      })[0] ?? null
  );
}

function createUnknownGroup(
  lineId: string,
  prefix: string,
  station: LinearStation,
  role: string,
): FacilityRequirementGroup {
  const id = `${lineId}-${prefix}-${station.stationCode}-status-unverified`;
  return {
    id,
    label: `${station.stationName} 엘리베이터 실시간 상태 미확인`,
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

function createSurfaceGroup(
  lineId: string,
  prefix: string,
  station: LinearStation,
  role: string,
): FacilityRequirementGroup {
  const elevators = station.elevators.filter(
    (elevator) => elevator.kind === 'surface',
  );
  return elevators.length > 0
    ? createKnownGroup(lineId, prefix, station, elevators, role)
    : createUnknownGroup(lineId, prefix, station, role);
}

function createPlatformGroup(
  lineId: string,
  prefix: string,
  station: LinearStation,
  direction: LinearDirection | undefined,
  role: string,
): FacilityRequirementGroup {
  const directionalElevators = direction
    ? station.elevators.filter(
        (elevator) =>
          elevator.kind === 'platform' &&
          (normalize(elevator.location).includes(normalize(direction.toward)) ||
            direction.recommendedDoors.some((door) =>
              normalize(elevator.location).includes(normalize(door)),
            )),
      )
    : [];
  const selectedDoor = selectDoor(direction)?.door;
  const doorElevators = selectedDoor
    ? directionalElevators.filter((elevator) =>
        normalize(elevator.location).includes(normalize(selectedDoor)),
      )
    : [];
  const elevators =
    doorElevators.length > 0 ? doorElevators : directionalElevators;
  return elevators.length > 0
    ? createKnownGroup(lineId, prefix, station, elevators, role)
    : createUnknownGroup(lineId, prefix, station, role);
}

function createKnownGroup(
  lineId: string,
  prefix: string,
  station: LinearStation,
  elevators: readonly LinearElevator[],
  role: string,
): FacilityRequirementGroup {
  return {
    id: `${lineId}-${prefix}-${station.stationCode}`,
    label: `${station.stationName} ${role}`,
    policy: 'any',
    facilities: elevators.map((elevator) => ({
      id: elevator.id,
      stationCode: station.stationCode,
      stationName: station.stationName,
      role,
      sourceFacilityName: elevator.name,
      expectedOperatingSection: elevator.operatingSection,
      expectedLocation: elevator.location,
    })),
  };
}

function normalize(value: string) {
  return value.replace(/방면|방향|행|역|[\s()]/gu, '');
}

function doorPosition(door: string) {
  const match = /^(\d+)-(\d+)$/u.exec(door);
  return match
    ? { carNumber: Number(match[1]), doorNumber: Number(match[2]) }
    : null;
}

function formatDoor(door: string) {
  const [car, entrance] = door.split('-');
  return `${car}호차 ${entrance}번 문`;
}

function entryInstruction(exitNumbers: readonly string[]) {
  if (exitNumbers.length === 0)
    return '지상 엘리베이터 출구 정보가 확인되지 않았습니다. 현장 안내를 확인하세요.';
  if (exitNumbers.length === 1)
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 가까운 지상 엘리베이터를 이용하세요.`;
}

function exitInstruction(exitNumbers: readonly string[]) {
  if (exitNumbers.length === 0)
    return '지상으로 연결되는 엘리베이터 출구가 확인되지 않았습니다. 현장 안내를 확인하세요.';
  if (exitNumbers.length === 1)
    return `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`;
  return `${exitNumbers.join(', ')}번 출구 중 목적지와 가까운 지상 엘리베이터를 이용하세요.`;
}
