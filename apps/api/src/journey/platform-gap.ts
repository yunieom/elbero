export const PLATFORM_GAP_LEVEL = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
} as const;

export type PlatformGapLevel =
  (typeof PLATFORM_GAP_LEVEL)[keyof typeof PLATFORM_GAP_LEVEL];

export interface PlatformGapInfo {
  distanceCm: number;
  level: PlatformGapLevel;
  label: '안전' | '유의' | '추천하지 않음';
}

export interface PlatformDoorGap {
  carNumber: number;
  doorNumber: number;
  distanceCm: number;
}

export const BOARDING_DOOR_DECISION = {
  SOURCE_DOOR_ACCEPTABLE: 'source_door_acceptable',
  SAFER_ADJACENT_DOOR: 'safer_adjacent_door',
  GAP_UNKNOWN: 'gap_unknown',
  NO_ACCEPTABLE_ADJACENT_DOOR: 'no_acceptable_adjacent_door',
} as const;

export type BoardingDoorDecision =
  (typeof BOARDING_DOOR_DECISION)[keyof typeof BOARDING_DOOR_DECISION];

export interface BoardingDoorRecommendation {
  sourceDoor: string;
  recommendedDoor: string | null;
  sourceGap: PlatformGapInfo | null;
  recommendedGap: PlatformGapInfo | null;
  decision: BoardingDoorDecision;
}

export function toPlatformGap(distanceCm: number): PlatformGapInfo {
  if (!Number.isFinite(distanceCm) || distanceCm < 0) {
    throw new RangeError('승강장 이격거리는 0 이상의 유한한 cm 값이어야 합니다.');
  }
  if (distanceCm <= 10) {
    return { distanceCm, level: PLATFORM_GAP_LEVEL.GREEN, label: '안전' };
  }
  if (distanceCm <= 15) {
    return { distanceCm, level: PLATFORM_GAP_LEVEL.YELLOW, label: '유의' };
  }
  return {
    distanceCm,
    level: PLATFORM_GAP_LEVEL.RED,
    label: '추천하지 않음',
  };
}

export function recommendBoardingDoor(
  sourceDoor: string,
  gaps: PlatformDoorGap[],
  doorsPerCar = 4,
): BoardingDoorRecommendation {
  const sourcePosition = parseDoorPosition(sourceDoor, doorsPerCar);
  const normalizedGaps = gaps.map((gap) => ({
    ...gap,
    door: formatDoor(gap.carNumber, gap.doorNumber, doorsPerCar),
    ordinal: toDoorOrdinal(gap.carNumber, gap.doorNumber, doorsPerCar),
    platformGap: toPlatformGap(gap.distanceCm),
  }));
  const source = normalizedGaps.find((gap) => gap.door === sourceDoor);

  if (!source) {
    return {
      sourceDoor,
      recommendedDoor: null,
      sourceGap: null,
      recommendedGap: null,
      decision: BOARDING_DOOR_DECISION.GAP_UNKNOWN,
    };
  }

  if (source.platformGap.level !== PLATFORM_GAP_LEVEL.RED) {
    return {
      sourceDoor,
      recommendedDoor: sourceDoor,
      sourceGap: source.platformGap,
      recommendedGap: source.platformGap,
      decision: BOARDING_DOOR_DECISION.SOURCE_DOOR_ACCEPTABLE,
    };
  }

  const adjacent = normalizedGaps
    .filter(
      (gap) =>
        Math.abs(gap.ordinal - sourcePosition.ordinal) === 1 &&
        gap.platformGap.level !== PLATFORM_GAP_LEVEL.RED,
    )
    .sort(
      (left, right) =>
        left.distanceCm - right.distanceCm || left.ordinal - right.ordinal,
    )[0];

  if (!adjacent) {
    return {
      sourceDoor,
      recommendedDoor: null,
      sourceGap: source.platformGap,
      recommendedGap: null,
      decision: BOARDING_DOOR_DECISION.NO_ACCEPTABLE_ADJACENT_DOOR,
    };
  }

  return {
    sourceDoor,
    recommendedDoor: adjacent.door,
    sourceGap: source.platformGap,
    recommendedGap: adjacent.platformGap,
    decision: BOARDING_DOOR_DECISION.SAFER_ADJACENT_DOOR,
  };
}

function parseDoorPosition(door: string, doorsPerCar: number) {
  const match = /^(\d+)-(\d+)$/.exec(door);
  if (!match) {
    throw new RangeError('차량·문 번호는 "차량-문" 형식이어야 합니다.');
  }

  const carNumber = Number(match[1]);
  const doorNumber = Number(match[2]);
  return {
    carNumber,
    doorNumber,
    ordinal: toDoorOrdinal(carNumber, doorNumber, doorsPerCar),
  };
}

function formatDoor(
  carNumber: number,
  doorNumber: number,
  doorsPerCar: number,
) {
  toDoorOrdinal(carNumber, doorNumber, doorsPerCar);
  return `${carNumber}-${doorNumber}`;
}

function toDoorOrdinal(
  carNumber: number,
  doorNumber: number,
  doorsPerCar: number,
) {
  if (!Number.isInteger(doorsPerCar) || doorsPerCar < 1) {
    throw new RangeError('차량별 문 수는 1 이상의 정수여야 합니다.');
  }
  if (!Number.isInteger(carNumber) || carNumber < 1) {
    throw new RangeError('차량 번호는 1 이상의 정수여야 합니다.');
  }
  if (
    !Number.isInteger(doorNumber) ||
    doorNumber < 1 ||
    doorNumber > doorsPerCar
  ) {
    throw new RangeError(`문 번호는 1부터 ${doorsPerCar} 사이여야 합니다.`);
  }
  return (carNumber - 1) * doorsPerCar + doorNumber;
}
