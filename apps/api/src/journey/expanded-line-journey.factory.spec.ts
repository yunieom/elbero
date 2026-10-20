import { AIRPORT_RAILROAD_GUIDANCE } from './data/airport-railroad-guidance.generated.js';
import { EVERLINE_GUIDANCE } from './data/everline-guidance.generated.js';
import { LINE_1_NETWORK_GUIDANCE } from './data/line-1-network-guidance.generated.js';
import { LINE_6_LOOP_GUIDANCE } from './data/line-6-loop-guidance.generated.js';
import { LINE_8_GUIDANCE } from './data/line-8-guidance.generated.js';
import { LINE_9_GUIDANCE } from './data/line-9-guidance.generated.js';
import { createAirportRailroadJourneyDefinition } from './airport-railroad-journey.factory.js';
import { createEverlineJourneyDefinition } from './everline-journey.factory.js';
import { createInterlineJourneyDefinition } from './interline-journey.factory.js';
import { createLine1JourneyDefinition } from './line-1-journey.factory.js';
import { createLine6JourneyDefinition } from './line-6-journey.factory.js';
import { createLine8JourneyDefinition } from './line-8-journey.factory.js';
import { createLine9JourneyDefinition } from './line-9-journey.factory.js';

describe('1호선·공항철도·용인에버라인 경로', () => {
  it.each([
    [
      '공항철도',
      AIRPORT_RAILROAD_GUIDANCE,
      createAirportRailroadJourneyDefinition,
    ],
    ['용인에버라인', EVERLINE_GUIDANCE, createEverlineJourneyDefinition],
    ['8호선', LINE_8_GUIDANCE, createLine8JourneyDefinition],
    ['9호선', LINE_9_GUIDANCE, createLine9JourneyDefinition],
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

  it('6호선의 모든 역 조합과 응암순환 단방향을 생성한다', () => {
    for (const origin of LINE_6_LOOP_GUIDANCE.topology) {
      for (const destination of LINE_6_LOOP_GUIDANCE.topology) {
        if (origin === destination) continue;
        expect(
          createLine6JourneyDefinition(origin, destination),
        ).not.toBeNull();
      }
    }

    const wrapped = createLine6JourneyDefinition('2616', '2612');
    const train = wrapped?.candidates[0].steps.find(
      (step) => step.type === 'train',
    );
    expect(train?.trainSegment?.direction).toBe('응암순환행');
    expect(train?.instruction).toContain('역촌까지 이동');

    const mainToEungam = createLine6JourneyDefinition('2617', '2611');
    expect(
      mainToEungam?.candidates[0].steps.find((step) => step.type === 'train')
        ?.trainSegment?.boardingPosition,
    ).toEqual({ carNumber: 5, doorNumber: 4 });
  });

  it.each([
    ['KR0110', 'A11', '서울역', ['1호선', '공항철도']],
    ['A04', '0222', '홍대입구', ['공항철도', '2호선']],
    ['A06', '2511', '김포공항', ['공항철도', '5호선']],
    ['KR0110', '2733', '도봉산', ['1호선', '7호선']],
    ['2611', 'A11', '디지털미디어시티', ['6호선', '공항철도']],
    ['2804', '0938', '석촌', ['8호선', '9호선']],
    ['0901', 'S411', '샛강', ['9호선', '신림선']],
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

  it('두 번 이상 환승하는 지원 노선 경로도 연결한다', () => {
    const definition = createInterlineJourneyDefinition('2611', '0938');
    const candidate = definition?.candidates[0];

    expect(candidate).toBeDefined();
    expect(candidate!.lines[0]).toBe('6호선');
    expect(candidate!.lines.at(-1)).toBe('9호선');
    const transfers = candidate!.steps.filter(
      (step) => step.type === 'transfer',
    );
    expect(transfers.length).toBeGreaterThanOrEqual(2);
    expect(transfers.every((step) => step.facilityGroupId)).toBe(true);
  });

  it('에버라인을 제외한 지원 노선 사이를 모두 연결한다', () => {
    const representatives = [
      'KR0110',
      '0222',
      '0330',
      '0433',
      '2543',
      '2611',
      '2733',
      '2804',
      '0901',
      'A06',
      'G100',
      'S411',
    ];

    for (const origin of representatives) {
      for (const destination of representatives) {
        if (origin === destination) continue;
        expect(
          createInterlineJourneyDefinition(origin, destination),
          `${origin} -> ${destination}`,
        ).not.toBeNull();
      }
    }
  });
});
