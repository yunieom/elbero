import {
  BOARDING_DOOR_DECISION,
  PLATFORM_GAP_LEVEL,
  recommendBoardingDoor,
  toPlatformGap,
} from './platform-gap.js';

describe('toPlatformGap', () => {
  it.each([0, 10])('%scm는 green 안전이다', (distanceCm) => {
    expect(toPlatformGap(distanceCm)).toEqual({
      distanceCm,
      level: PLATFORM_GAP_LEVEL.GREEN,
      label: '안전',
    });
  });

  it.each([10.1, 15])('%scm는 yellow 유의다', (distanceCm) => {
    expect(toPlatformGap(distanceCm)).toEqual({
      distanceCm,
      level: PLATFORM_GAP_LEVEL.YELLOW,
      label: '유의',
    });
  });

  it('15cm 초과는 red 추천하지 않음이다', () => {
    expect(toPlatformGap(15.1)).toEqual({
      distanceCm: 15.1,
      level: PLATFORM_GAP_LEVEL.RED,
      label: '추천하지 않음',
    });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    '유효하지 않은 값 %s를 거절한다',
    (distanceCm) => {
      expect(() => toPlatformGap(distanceCm)).toThrow(RangeError);
    },
  );
});

describe('recommendBoardingDoor', () => {
  it('김포공항 3-2가 red이면 양옆 중 이격거리가 더 짧은 3-1을 안내한다', () => {
    expect(
      recommendBoardingDoor('3-2', [
        { carNumber: 3, doorNumber: 1, distanceCm: 12 },
        { carNumber: 3, doorNumber: 2, distanceCm: 17 },
        { carNumber: 3, doorNumber: 3, distanceCm: 15 },
      ]),
    ).toEqual({
      sourceDoor: '3-2',
      recommendedDoor: '3-1',
      sourceGap: {
        distanceCm: 17,
        level: PLATFORM_GAP_LEVEL.RED,
        label: '추천하지 않음',
      },
      recommendedGap: {
        distanceCm: 12,
        level: PLATFORM_GAP_LEVEL.YELLOW,
        label: '유의',
      },
      decision: BOARDING_DOOR_DECISION.SAFER_ADJACENT_DOOR,
    });
  });

  it('원본 문이 red가 아니면 그대로 안내한다', () => {
    expect(
      recommendBoardingDoor('4-1', [
        { carNumber: 4, doorNumber: 1, distanceCm: 10 },
      ]),
    ).toMatchObject({
      recommendedDoor: '4-1',
      decision: BOARDING_DOOR_DECISION.SOURCE_DOOR_ACCEPTABLE,
    });
  });

  it('원본 문의 이격거리 레코드가 없으면 추천하지 않는다', () => {
    expect(recommendBoardingDoor('4-1', [])).toEqual({
      sourceDoor: '4-1',
      recommendedDoor: null,
      sourceGap: null,
      recommendedGap: null,
      decision: BOARDING_DOOR_DECISION.GAP_UNKNOWN,
    });
  });

  it('양옆 문도 모두 red이면 안전하다고 추정하지 않는다', () => {
    expect(
      recommendBoardingDoor('3-2', [
        { carNumber: 3, doorNumber: 1, distanceCm: 16 },
        { carNumber: 3, doorNumber: 2, distanceCm: 17 },
        { carNumber: 3, doorNumber: 3, distanceCm: 18 },
      ]),
    ).toMatchObject({
      recommendedDoor: null,
      decision: BOARDING_DOOR_DECISION.NO_ACCEPTABLE_ADJACENT_DOOR,
    });
  });
});
