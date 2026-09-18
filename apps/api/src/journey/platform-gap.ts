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
