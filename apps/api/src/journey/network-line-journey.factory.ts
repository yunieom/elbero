import { toPlatformGap } from './platform-gap.js';
import {
  JOURNEY_STEP_TYPE,
  type FacilityRequirementGroup,
  type VerifiedJourneyDefinition,
  type VerifiedJourneyStep,
} from './types/verified-journey.type.js';

interface NetworkGap {
  distanceCm: number;
  level: string;
}

interface NetworkDirection {
  toward: string;
  terminalName: string;
  recommendedDoors: readonly string[];
  doorGaps: ReadonlyArray<{ door: string; gap: NetworkGap | null }>;
}

interface NetworkStation {
  stationCode: string;
  stationName: string;
  exitNumbers: readonly string[];
  elevators: readonly NetworkElevator[];
  directions: readonly NetworkDirection[];
}

interface NetworkElevator {
  id: string;
  name: string;
  operatingSection: string | null;
  location: string;
  kind: 'surface' | 'platform' | 'other';
}

interface NetworkPath {
  id: string;
  terminals: readonly [string, string];
  stationCodes: readonly string[];
}

interface NetworkGuidance {
  dataVersion: string;
  verifiedAt: string;
  topology: readonly string[];
  paths: readonly NetworkPath[];
  stations: readonly NetworkStation[];
}

interface NetworkLineConfig {
  id: string;
  lineName: string;
  guidance: NetworkGuidance;
}

interface Segment {
  path: NetworkPath;
  originCode: string;
  destinationCode: string;
}

export function createNetworkLineAdapter(config: NetworkLineConfig) {
  const stationByCode = new Map(
    config.guidance.stations.map((station) => [station.stationCode, station]),
  );

  function hasStation(stationCode: string) {
    return stationByCode.has(stationCode);
  }

  function distance(originStationCode: string, destinationStationCode: string) {
    const segments = findSegments(
      config.guidance.paths,
      originStationCode,
      destinationStationCode,
    );
    if (!segments) return null;
    return segments.reduce(
      (sum, segment) =>
        sum +
        Math.abs(
          segment.path.stationCodes.indexOf(segment.destinationCode) -
            segment.path.stationCodes.indexOf(segment.originCode),
        ),
      0,
    );
  }

  function create(
    originStationCode: string,
    destinationStationCode: string,
  ): VerifiedJourneyDefinition | null {
    if (originStationCode === destinationStationCode) return null;
    const segments = findSegments(
      config.guidance.paths,
      originStationCode,
      destinationStationCode,
    );
    const origin = stationByCode.get(originStationCode);
    const destination = stationByCode.get(destinationStationCode);
    if (!segments || !origin || !destination) return null;

    const evidence = 'KRIC 이동경로·승강기 인접 차량 문·승강장 이격거리';
    const firstDirection = segmentDirection(segments[0], stationByCode);
    const destinationDirection = arrivalPlatformDirection(
      segments.at(-1)!,
      stationByCode,
    );
    const facilityGroups = [
      surfaceGroup(config.id, 'origin-surface', origin, '출발역 지상 진입'),
      platformGroup(
        config.id,
        'origin-platform',
        origin,
        firstDirection,
        '출발 승강장 이동',
      ),
      platformGroup(
        config.id,
        'destination-platform',
        destination,
        destinationDirection,
        '도착 승강장 하차',
      ),
      surfaceGroup(
        config.id,
        'destination-surface',
        destination,
        '도착역 지상 퇴장',
      ),
    ];
    const trainSteps = segments.flatMap((segment, index) => {
      const train = trainStep(
        config.lineName,
        segment,
        stationByCode,
        evidence,
      );
      if (index === 0) return [train];
      const transferStation = stationByCode.get(segment.originCode)!;
      return [
        {
          order: 0,
          type: JOURNEY_STEP_TYPE.TRANSFER,
          stationName: transferStation.stationName,
          instruction: `${transferStation.stationName}에서 다음 1호선 운행 계통 열차로 갈아타세요. 승강장 엘리베이터와 현장 표지를 이용하세요.`,
          evidence: '1호선 분기 운행 계통 연결',
        } satisfies VerifiedJourneyStep,
        train,
      ];
    });
    const lastTrain = trainSteps.findLast(
      (step) => step.type === JOURNEY_STEP_TYPE.TRAIN,
    );
    const boarding = lastTrain?.trainSegment?.alightingPosition;
    const steps: VerifiedJourneyStep[] = renumber([
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.ENTRY,
        stationName: origin.stationName,
        instruction: entryInstruction(origin.exitNumbers),
        facilityGroupId: facilityGroups[0].id,
        evidence,
      },
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.GATE,
        stationName: origin.stationName,
        instruction: '대합실에서 교통카드를 태그하고 개찰구를 통과하세요.',
        evidence,
      },
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.ELEVATOR,
        stationName: origin.stationName,
        instruction: firstDirection
          ? `${firstDirection.toward} 방향 승강장 엘리베이터를 이용하세요.`
          : '진행 방향 승강장 엘리베이터 위치를 현장 안내에서 확인하세요.',
        facilityGroupId: facilityGroups[1].id,
        evidence,
      },
      ...trainSteps,
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.ELEVATOR,
        stationName: destination.stationName,
        instruction: boarding
          ? `하차 후 ${boarding.carNumber}호차 ${boarding.doorNumber}번 문 부근의 엘리베이터를 이용해 대합실로 이동하세요.`
          : '하차 후 승강장 엘리베이터를 이용해 대합실로 이동하세요. 위치는 현장 안내를 확인하세요.',
        facilityGroupId: facilityGroups[2].id,
        evidence,
      },
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.GATE,
        stationName: destination.stationName,
        instruction: '대합실에서 하차 태그 후 개찰구를 통과하세요.',
        evidence,
      },
      {
        order: 0,
        type: JOURNEY_STEP_TYPE.EXIT,
        stationName: destination.stationName,
        instruction: exitInstruction(destination.exitNumbers),
        facilityGroupId: facilityGroups[3].id,
        evidence,
      },
    ]);

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
          id: `${config.id}-route`,
          label:
            segments.length === 1
              ? `${config.lineName} 직통 경로`
              : `${config.lineName} 분기 환승 경로`,
          priority: 1,
          transferStation:
            segments.length > 1
              ? (stationByCode.get(segments[1].originCode)?.stationName ?? null)
              : null,
          lines: [config.lineName],
          facilityGroups,
          steps,
        },
      ],
    };
  }

  return { hasStation, distance, create };
}

function findSegments(
  paths: readonly NetworkPath[],
  originCode: string,
  destinationCode: string,
): Segment[] | null {
  const direct = paths
    .filter(
      (path) =>
        path.stationCodes.includes(originCode) &&
        path.stationCodes.includes(destinationCode),
    )
    .toSorted(
      (left, right) =>
        pathDistance(left, originCode, destinationCode) -
        pathDistance(right, originCode, destinationCode),
    )[0];
  if (direct) return [{ path: direct, originCode, destinationCode }];

  const options = paths.flatMap((first) =>
    paths.flatMap((second) => {
      if (
        !first.stationCodes.includes(originCode) ||
        !second.stationCodes.includes(destinationCode)
      )
        return [];
      return first.stationCodes
        .filter((code) => second.stationCodes.includes(code))
        .map((transferCode) => ({
          first,
          second,
          transferCode,
          distance:
            pathDistance(first, originCode, transferCode) +
            pathDistance(second, transferCode, destinationCode),
        }));
    }),
  );
  const best = options.toSorted(
    (left, right) => left.distance - right.distance,
  )[0];
  if (!best) return null;
  return [
    { path: best.first, originCode, destinationCode: best.transferCode },
    {
      path: best.second,
      originCode: best.transferCode,
      destinationCode,
    },
  ].filter((segment) => segment.originCode !== segment.destinationCode);
}

function pathDistance(
  path: NetworkPath,
  originCode: string,
  destinationCode: string,
) {
  return Math.abs(
    path.stationCodes.indexOf(destinationCode) -
      path.stationCodes.indexOf(originCode),
  );
}

function trainStep(
  lineName: string,
  segment: Segment,
  stationByCode: ReadonlyMap<string, NetworkStation>,
  evidence: string,
): VerifiedJourneyStep {
  const origin = stationByCode.get(segment.originCode)!;
  const destination = stationByCode.get(segment.destinationCode)!;
  const terminalName = segmentTerminal(segment);
  const arrivalDirection = arrivalPlatformDirection(segment, stationByCode);
  const boarding = selectDoor(arrivalDirection);
  return {
    order: 0,
    type: JOURNEY_STEP_TYPE.TRAIN,
    stationName: origin.stationName,
    instruction: `${lineName} ${terminalName}행 열차를 타고 ${destination.stationName}까지 이동하세요.`,
    evidence,
    trainSegment: {
      lineName,
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
  };
}

function segmentDirection(
  segment: Segment,
  stationByCode: ReadonlyMap<string, NetworkStation>,
) {
  const originIndex = segment.path.stationCodes.indexOf(segment.originCode);
  const destinationIndex = segment.path.stationCodes.indexOf(
    segment.destinationCode,
  );
  const nextCode =
    segment.path.stationCodes[
      originIndex + Math.sign(destinationIndex - originIndex)
    ];
  const next = stationByCode.get(nextCode);
  return stationByCode
    .get(segment.originCode)
    ?.directions.find((direction) => direction.toward === next?.stationName);
}

function arrivalPlatformDirection(
  segment: Segment,
  stationByCode: ReadonlyMap<string, NetworkStation>,
) {
  const destination = stationByCode.get(segment.destinationCode);
  const terminalName = segmentTerminal(segment);
  return destination?.directions.find(
    (direction) => direction.terminalName === terminalName,
  );
}

function segmentTerminal(segment: Segment) {
  const originIndex = segment.path.stationCodes.indexOf(segment.originCode);
  const destinationIndex = segment.path.stationCodes.indexOf(
    segment.destinationCode,
  );
  return destinationIndex > originIndex
    ? segment.path.terminals[1]
    : segment.path.terminals[0];
}

function selectDoor(direction?: NetworkDirection) {
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

function unknownGroup(
  lineId: string,
  prefix: string,
  station: NetworkStation,
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

function surfaceGroup(
  lineId: string,
  prefix: string,
  station: NetworkStation,
  role: string,
) {
  const elevators = station.elevators.filter(
    (elevator) => elevator.kind === 'surface',
  );
  return elevators.length > 0
    ? knownGroup(lineId, prefix, station, elevators, role)
    : unknownGroup(lineId, prefix, station, role);
}

function platformGroup(
  lineId: string,
  prefix: string,
  station: NetworkStation,
  direction: NetworkDirection | undefined,
  role: string,
) {
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
    ? knownGroup(lineId, prefix, station, elevators, role)
    : unknownGroup(lineId, prefix, station, role);
}

function knownGroup(
  lineId: string,
  prefix: string,
  station: NetworkStation,
  elevators: readonly NetworkElevator[],
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

function renumber(steps: VerifiedJourneyStep[]) {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}
