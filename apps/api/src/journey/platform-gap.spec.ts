import { PLATFORM_GAP_LEVEL, toPlatformGap } from './platform-gap.js';

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
