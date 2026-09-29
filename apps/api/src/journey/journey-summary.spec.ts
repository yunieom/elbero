import { VERIFIED_JOURNEYS } from './data/verified-journeys.data.js';
import { calculateJourneySummary } from './journey-summary.js';
import { createLine5JourneyDefinition } from './line-5-journey.factory.js';
import type { VerifiedRouteCandidate } from './types/verified-journey.type.js';

describe('calculateJourneySummary', () => {
  it('답십리→굽은다리 fixture의 승하차 문과 시설 횟수를 계산한다', () => {
    const journey = VERIFIED_JOURNEYS.find(
      (item) => item.id === 'dapsimni-to-gubeundari',
    )!;
    const result = calculateJourneySummary(journey.candidates[0]);

    expect(result.validationIssues).toEqual([]);
    expect(result.summary).toEqual({
      lineNames: ['5호선'],
      directions: ['하남검단산·상일동 방면'],
      transferCount: 0,
      elevatorCount: 4,
    });
    expect(result.trainSegments).toEqual([
      expect.objectContaining({
        originStationName: '답십리',
        destinationStationName: '굽은다리',
        boardingPosition: { carNumber: 3, doorNumber: 2 },
        alightingPosition: { carNumber: 3, doorNumber: 2 },
        positionBasis: 'destination_elevator',
      }),
    ]);
  });

  it('마천 지선→하남 지선 fixture의 열차 구간과 환승 횟수를 계산한다', () => {
    const journey = createLine5JourneyDefinition('2561', '2565')!;
    const result = calculateJourneySummary(journey.candidates[0]);

    expect(result.validationIssues).toEqual([]);
    expect(result.summary.lineNames).toEqual(['5호선']);
    expect(result.summary.directions).toEqual(['방화 방면', '하남검단산 방면']);
    expect(result.summary.transferCount).toBe(1);
    expect(result.trainSegments).toHaveLength(2);
  });

  it('승차 위치와 하차 위치가 다르면 데이터 불일치로 기록한다', () => {
    const candidate = mismatchCandidate();
    const result = calculateJourneySummary(candidate);

    expect(result.validationIssues).toEqual([
      '출발역→도착역 구간의 승차·하차 위치가 일치하지 않습니다.',
    ]);
  });
});

function mismatchCandidate(): VerifiedRouteCandidate {
  return {
    id: 'mismatch',
    label: '불일치 fixture',
    priority: 1,
    transferStation: null,
    lines: ['5호선'],
    facilityGroups: [],
    steps: [
      {
        order: 1,
        type: 'train',
        stationName: '출발역',
        instruction: '열차를 이용하세요.',
        evidence: 'fixture',
        trainSegment: {
          lineName: '5호선',
          direction: '도착역 방면',
          originStationName: '출발역',
          destinationStationName: '도착역',
          boardingPosition: { carNumber: 4, doorNumber: 4 },
          alightingPosition: { carNumber: 5, doorNumber: 1 },
          positionBasis: 'destination_elevator',
        },
      },
    ],
  };
}
