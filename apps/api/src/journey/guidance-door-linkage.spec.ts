import { LINE_2_GUIDANCE } from './data/line-2-guidance.generated.js';
import { LINE_3_GUIDANCE } from './data/line-3-guidance.generated.js';
import { LINE_4_GUIDANCE } from './data/line-4-guidance.generated.js';
import { LINE_5_GUIDANCE } from './data/line-5-guidance.generated.js';
import { LINE_7_GUIDANCE } from './data/line-7-guidance.generated.js';

describe('directional elevator door linkage', () => {
  it.each([
    ['2호선', LINE_2_GUIDANCE.stations],
    ['3호선', LINE_3_GUIDANCE.stations],
    ['4호선', LINE_4_GUIDANCE.stations],
    ['5호선', LINE_5_GUIDANCE.stations],
    ['7호선', LINE_7_GUIDANCE.stations],
  ] as const)(
    '%s fills a recommendation when a directional elevator location has a door',
    (_lineName, stations) => {
      const missing: string[] = [];

      for (const station of stations) {
        for (const direction of station.directions) {
          const sourceDoors = station.liveElevators
            .filter((facility) => facility.kind === 'platform')
            .flatMap((facility) =>
              directionalDoors(facility.location, direction.toward),
            );

          if (
            sourceDoors.length > 0 &&
            direction.recommendedDoors.length === 0
          ) {
            missing.push(
              `${station.stationName} ${direction.toward} 방면: ${sourceDoors.join(', ')}`,
            );
          }
        }
      }

      expect(missing).toEqual([]);
    },
  );
});

function directionalDoors(location: string, toward: string) {
  return location
    .split(',')
    .filter((segment) => normalize(segment).includes(normalize(toward)))
    .flatMap((segment) => segment.match(/\d+-\d+/gu) ?? []);
}

function normalize(value: string) {
  return value.replace(/[\s()]/gu, '');
}
