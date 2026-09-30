import { describe, expect, it } from 'vitest';
import { createLine7JourneyDefinition } from './line-7-journey.factory.js';

describe('createLine7JourneyDefinition', () => {
  it('uses the verified destination-side door toward Seongnam', () => {
    const definition = createLine7JourneyDefinition('2713', '2731');

    expect(definition?.originStationName).toBe('수락산');
    expect(definition?.destinationStationName).toBe('청담');
    expect(definition?.candidates[0].lines).toEqual(['7호선']);
    const trainStep = definition?.candidates[0].steps.find(
      (step) => step.type === 'train',
    );
    expect(trainStep?.trainSegment).toMatchObject({
      direction: '석남 방면',
      boardingPosition: { carNumber: 2, doorNumber: 1 },
      alightingPosition: { carNumber: 2, doorNumber: 1 },
      positionBasis: 'destination_elevator',
    });
  });

  it('uses the verified reverse-direction door and surface exit', () => {
    const definition = createLine7JourneyDefinition('2731', '2713');
    const steps = definition?.candidates[0].steps ?? [];

    const trainStep = steps.find((step) => step.type === 'train');
    const exitStep = steps.find((step) => step.type === 'exit');
    expect(trainStep?.trainSegment).toMatchObject({
      direction: '장암 방면',
      boardingPosition: { carNumber: 1, doorNumber: 1 },
    });
    expect(exitStep?.instruction).toBe(
      '1번 출구 쪽 지상 엘리베이터를 이용하세요.',
    );
    expect(steps.map((step) => step.type)).toEqual([
      'entry',
      'gate',
      'elevator',
      'train',
      'elevator',
      'gate',
      'exit',
    ]);
  });

  it('supports the complete 53-station linear topology', () => {
    expect(createLine7JourneyDefinition('2711', '0761')).not.toBeNull();
    expect(createLine7JourneyDefinition('0761', '2711')).not.toBeNull();
    expect(createLine7JourneyDefinition('2711', '2711')).toBeNull();
  });
});
