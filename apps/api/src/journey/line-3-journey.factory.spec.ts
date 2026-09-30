import { describe, expect, it } from 'vitest';
import { LINE_3_GUIDANCE } from './data/line-3-guidance.generated.js';
import { createLine3JourneyDefinition } from './line-3-journey.factory.js';

describe('createLine3JourneyDefinition', () => {
  it('supports the complete 44-station topology with terminal-bound direction', () => {
    const southbound = createLine3JourneyDefinition('K309', '0342');
    const northbound = createLine3JourneyDefinition('0342', 'K309');

    expect(southbound?.originStationName).toBe('대화');
    expect(southbound?.destinationStationName).toBe('오금');
    expect(findTrain(southbound)?.trainSegment?.direction).toBe('오금 방면');
    expect(findTrain(northbound)?.trainSegment?.direction).toBe('대화 방면');
  });

  it('uses all 17 manually verified surface-exit values', () => {
    expect(
      LINE_3_GUIDANCE.stations.filter(
        (station) => station.verificationMethod === 'manual_verification',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stationName: '대화', exitNumbers: ['1', '4'] }),
        expect.objectContaining({ stationName: '종로3가', exitNumbers: ['2-1', '8'] }),
        expect.objectContaining({ stationName: '오금', exitNumbers: ['5', '7'] }),
      ]),
    );
  });

  it('uses the verified Jongno 3-ga and Jamwon directional doors', () => {
    const cases = [
      ['0319', '지축', '4-3'],
      ['0319', '오금', '7-1'],
      ['0328', '고속터미널', '8-2'],
      ['0328', '신사', '3-3'],
    ] as const;

    for (const [stationCode, toward, door] of cases) {
      const direction = LINE_3_GUIDANCE.stations
        .find((station) => station.stationCode === stationCode)
        ?.directions.find((item) => item.toward === toward);
      expect(direction?.recommendedDoors).toEqual([door]);
      expect(direction?.warning).toBeNull();
    }
  });
});

function findTrain(
  definition: ReturnType<typeof createLine3JourneyDefinition>,
) {
  return definition?.candidates[0].steps.find((step) => step.type === 'train');
}
