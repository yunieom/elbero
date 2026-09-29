import { describe, expect, it } from 'vitest';
import { createLine5Line7JourneyDefinition } from './line-5-7-journey.factory.js';

describe('createLine5Line7JourneyDefinition', () => {
  it('connects Gubeundari to Hakdong through Gunja', () => {
    const definition = createLine5Line7JourneyDefinition('2551', '2733');
    const candidate = definition?.candidates[0];

    expect(definition).toMatchObject({
      originStationName: '굽은다리',
      destinationStationName: '학동',
    });
    expect(candidate).toMatchObject({
      transferStation: '군자',
      lines: ['5호선', '7호선'],
    });
    expect(
      candidate?.steps.filter((step) => step.type === 'train'),
    ).toHaveLength(2);
    expect(candidate?.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'transfer',
          stationName: '군자',
          instruction: expect.stringContaining('7호선 석남 방면'),
        }),
      ]),
    );
  });

  it('supports the reverse 7-to-5 journey', () => {
    const definition = createLine5Line7JourneyDefinition('2733', '2551');

    expect(definition?.candidates[0]).toMatchObject({
      transferStation: '군자',
      lines: ['7호선', '5호선'],
    });
  });
});
