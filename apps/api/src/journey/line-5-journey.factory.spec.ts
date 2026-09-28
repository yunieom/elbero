import { createLine5JourneyDefinition } from './line-5-journey.factory.js';
import { LINE_5_GUIDANCE } from './data/line-5-guidance.generated.js';

describe('createLine5JourneyDefinition', () => {
  it('광화문에서 오금까지 종착역 우선 방향과 도착 엘리베이터 문을 안내한다', () => {
    const journey = createLine5JourneyDefinition('2534', '2558');

    expect(journey).not.toBeNull();
    expect(journey?.candidates[0]).toMatchObject({
      label: '5호선 직통 경로',
      transferStation: null,
    });
    const trainStep = journey?.candidates[0].steps.find(
      (step) => step.type === 'train',
    );
    expect(trainStep?.instruction).toContain('마천 방면');
    expect(trainStep?.instruction).toContain('5호차 1번 문');
    expect(trainStep?.platformGap?.level).not.toBe('red');
  });

  it('마천 지선과 하남 지선 사이는 강동 환승 경로를 만든다', () => {
    const journey = createLine5JourneyDefinition('2561', '2565');

    expect(journey?.candidates[0].transferStation).toBe('강동');
    expect(journey?.candidates[0].steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'transfer',
          stationName: '강동',
        }),
      ]),
    );
    const trainInstructions = journey?.candidates[0].steps
      .filter((step) => step.type === 'train')
      .map((step) => step.instruction);
    expect(trainInstructions?.[0]).toContain('방화 방면');
    expect(trainInstructions?.[1]).toContain('하남검단산 방면');
  });

  it('차량·문 정보가 없는 역도 일반 경로를 만들고 현장 확인을 안내한다', () => {
    const journey = createLine5JourneyDefinition('2534', '2519');
    const trainStep = journey?.candidates[0].steps.find(
      (step) => step.type === 'train',
    );

    expect(journey).not.toBeNull();
    expect(trainStep?.instruction).toContain('추천 차량·문을 확인할 수 없어');
    const facilityRoles = journey?.candidates[0].facilityGroups.flatMap(
      (group) => group.facilities.map((facility) => facility.role),
    );
    expect(facilityRoles).toContain('엘리베이터 안전 경로 미확인');
  });

  it('5호선의 서로 다른 모든 역 조합에서 일반 경로를 만들고 red 문은 안내하지 않는다', () => {
    const stationCodes = LINE_5_GUIDANCE.stations.map(
      (station) => station.stationCode,
    );

    for (const originStationCode of stationCodes) {
      for (const destinationStationCode of stationCodes) {
        if (originStationCode === destinationStationCode) continue;

        const journey = createLine5JourneyDefinition(
          originStationCode,
          destinationStationCode,
        );
        expect(journey).not.toBeNull();
        for (const step of journey?.candidates[0].steps ?? []) {
          expect(step.platformGap?.level).not.toBe('red');
        }
      }
    }
  });

  it('5호선 전체 역의 퇴장 문구를 출구 개수에 맞게 만든다', () => {
    const stations = LINE_5_GUIDANCE.stations;

    for (const destination of stations) {
      const exitNumbers: readonly string[] = destination.exitNumbers;
      const origin = stations.find(
        (station) => station.stationCode !== destination.stationCode,
      )!;
      const journey = createLine5JourneyDefinition(
        origin.stationCode,
        destination.stationCode,
      );
      const exitStep = journey?.candidates[0].steps.find(
        (step) => step.type === 'exit',
      );

      expect(exitStep).toBeDefined();
      if (exitNumbers.length === 0) {
        expect(exitStep?.instruction).toContain('출구 정보가 확인되지 않았습니다');
      } else if (exitNumbers.length === 1) {
        expect(exitStep?.instruction).toBe(
          `${exitNumbers[0]}번 출구 쪽 지상 엘리베이터를 이용하세요.`,
        );
        expect(exitStep?.instruction).not.toContain('출구 중');
      } else {
        expect(exitStep?.instruction).toContain('출구 중 목적지와 가까운');
      }
    }
  });
});
