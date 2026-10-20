import { AIRPORT_RAILROAD_GUIDANCE } from './data/airport-railroad-guidance.generated.js';
import { EVERLINE_GUIDANCE } from './data/everline-guidance.generated.js';
import { LINE_1_NETWORK_GUIDANCE } from './data/line-1-network-guidance.generated.js';
import { createAirportRailroadJourneyDefinition } from './airport-railroad-journey.factory.js';
import { createEverlineJourneyDefinition } from './everline-journey.factory.js';
import { createInterlineJourneyDefinition } from './interline-journey.factory.js';
import { createLine1JourneyDefinition } from './line-1-journey.factory.js';

describe('1호선·공항철도·용인에버라인 경로', () => {
  it.each([
    [
      '공항철도',
      AIRPORT_RAILROAD_GUIDANCE,
      createAirportRailroadJourneyDefinition,
    ],
    ['용인에버라인', EVERLINE_GUIDANCE, createEverlineJourneyDefinition],
  ] as const)(
    '%s의 모든 서로 다른 역 조합을 생성한다',
    (lineName, data, create) => {
      for (const origin of data.topology) {
        for (const destination of data.topology) {
          if (origin === destination) continue;
          const definition = create(origin, destination);
          expect(definition).not.toBeNull();
          expect(definition?.candidates[0].lines).toEqual([lineName]);
        }
      }
    },
  );

  it('1호선의 모든 역 조합과 분기 환승을 생성한다', () => {
    for (const origin of LINE_1_NETWORK_GUIDANCE.topology) {
      for (const destination of LINE_1_NETWORK_GUIDANCE.topology) {
        if (origin === destination) continue;
        expect(
          createLine1JourneyDefinition(origin, destination),
        ).not.toBeNull();
      }
    }

    const branchJourney = createLine1JourneyDefinition('KR0161', 'KRP177');
    expect(branchJourney?.candidates[0]).toMatchObject({
      transferStation: '구로',
      lines: ['1호선'],
    });
    expect(
      branchJourney?.candidates[0].steps.some(
        (step) => step.type === 'transfer',
      ),
    ).toBe(true);
    expect(
      branchJourney?.candidates[0].steps
        .filter((step) => step.type === 'train')
        .map((step) => step.trainSegment?.direction),
    ).toEqual(['연천행', '신창(순천향대)행']);
  });

  it.each([
    ['KR0110', 'A11', '서울역', ['1호선', '공항철도']],
    ['A04', '0222', '홍대입구', ['공항철도', '2호선']],
    ['A06', '2511', '김포공항', ['공항철도', '5호선']],
    ['KR0110', '2733', '도봉산', ['1호선', '7호선']],
  ] as const)(
    '%s에서 %s까지 %s 환승 경로를 생성한다',
    (origin, destination, transferStation, lines) => {
      const definition = createInterlineJourneyDefinition(origin, destination);
      expect(definition?.candidates[0]).toMatchObject({
        transferStation,
        lines,
      });
    },
  );
});
