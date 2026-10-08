import { describe, expect, it } from 'vitest';
import { LINE_4_GUIDANCE } from './data/line-4-guidance.generated.js';
import { createLine4JourneyDefinition } from './line-4-journey.factory.js';

describe('createLine4JourneyDefinition', () => {
  it('supports the complete 51-station topology with terminal direction', () => {
    const southbound = createLine4JourneyDefinition('0405', '0456');
    const northbound = createLine4JourneyDefinition('0456', '0405');

    expect(southbound?.originStationName).toBe('진접');
    expect(southbound?.destinationStationName).toBe('오이도');
    expect(findTrain(southbound)?.trainSegment?.direction).toBe('오이도 방면');
    expect(findTrain(northbound)?.trainSegment?.direction).toBe('진접 방면');
  });

  it('records all 26 surface-exit verification results including Sangnoksu unknown', () => {
    const manualStations = LINE_4_GUIDANCE.stations.filter(
      (station) => station.verificationMethod === 'manual_verification',
    );
    expect(manualStations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ stationName: '불암산', exitNumbers: ['1', '4'] }),
        expect.objectContaining({ stationName: '상록수', exitNumbers: [] }),
        expect.objectContaining({ stationName: '고잔', exitNumbers: ['1', '2'] }),
        expect.objectContaining({ stationName: '미아사거리', exitNumbers: ['1'] }),
        expect.objectContaining({ stationName: '동작', exitNumbers: ['1'] }),
        expect.objectContaining({ stationName: '금정', exitNumbers: ['2', '4', '7'] }),
        expect.objectContaining({ stationName: '안산', exitNumbers: ['1', '2'] }),
      ]),
    );
  });

  it('uses all user-verified direction-specific doors', () => {
    const cases = [
      ['0406', '진접', ['6-1']],
      ['0406', '별내별가람', ['5-4']],
      ['0412', '노원', ['2-4', '8-2']],
      ['0412', '쌍문', ['3-2', '8-4']],
      ['0424', '충무로', ['1-1']],
      ['0424', '회현', ['10-4']],
      ['0405', '오남', ['7-3']],
      ['0421', '4호선 동대문역사문화공원', ['5-1']],
      ['0421', '4호선 혜화', ['6-3']],
      ['0449', '반월', ['6-3']],
      ['0455', '신길온천', ['5-2']],
      ['0455', '오이도', ['6-3']],
    ] as const;

    for (const [stationCode, toward, doors] of cases) {
      const direction = findDirection(stationCode, toward);
      expect(direction?.recommendedDoors).toEqual(doors);
      expect(direction?.warning).toBeNull();
    }
  });

  it('keeps confirmed source gaps unavailable without asking for them again', () => {
    expect(findDirection('0406', '진접')).toMatchObject({
      gapVerificationStatus: 'source_unavailable',
      recommendedDoors: ['6-1'],
    });
    expect(findDirection('0406', '별내별가람')).toMatchObject({
      gapVerificationStatus: 'source_unavailable',
      recommendedDoors: ['5-4'],
    });
    expect(findDirection('0408', '오남')).toMatchObject({
      verificationStatus: 'source_unavailable',
      recommendedDoors: [],
      accessibilityVerified: false,
    });
    expect(findDirection('0408', '불암산')).toMatchObject({
      verificationStatus: 'source_unavailable',
      recommendedDoors: [],
      accessibilityVerified: false,
    });
  });

  it('treats the four manually verified platform-gap stations as safe', () => {
    const cases = [
      ['0444', '금정'],
      ['0444', '수리산'],
      ['0448', '반월'],
      ['0448', '한대앞'],
      ['0453', '초지'],
      ['0453', '신길온천'],
      ['0456', '정왕'],
    ] as const;

    for (const [stationCode, toward] of cases) {
      const direction = findDirection(stationCode, toward);
      expect(direction?.doorGaps.length).toBeGreaterThan(0);
      expect(direction?.doorGaps.every((item) => item.gap?.level === 'green')).toBe(true);
    }
  });
});

function findDirection(stationCode: string, toward: string) {
  return LINE_4_GUIDANCE.stations
    .find((station) => station.stationCode === stationCode)
    ?.directions.find((direction) => direction.toward === toward);
}

function findTrain(
  definition: ReturnType<typeof createLine4JourneyDefinition>,
) {
  return definition?.candidates[0].steps.find((step) => step.type === 'train');
}
