import { GIMPO_GOLDLINE_GUIDANCE } from './data/gimpo-goldline-guidance.generated.js';
import { SILLIM_LINE_GUIDANCE } from './data/sillim-line-guidance.generated.js';
import { createGimpoGoldlineJourneyDefinition } from './gimpo-goldline-journey.factory.js';
import { createInterlineJourneyDefinition } from './interline-journey.factory.js';
import { createSillimLineJourneyDefinition } from './sillim-line-journey.factory.js';

describe('김포골드라인·신림선 경로', () => {
  it.each([
    [
      '김포골드라인',
      GIMPO_GOLDLINE_GUIDANCE,
      createGimpoGoldlineJourneyDefinition,
    ],
    ['신림선', SILLIM_LINE_GUIDANCE, createSillimLineJourneyDefinition],
  ] as const)(
    '%s의 서로 다른 모든 역 조합을 생성한다',
    (lineName, data, create) => {
      for (const origin of data.topology) {
        for (const destination of data.topology) {
          if (origin === destination) continue;
          const definition = create(origin, destination);
          expect(definition).not.toBeNull();
          expect(definition?.candidates[0].lines).toEqual([lineName]);
          expect(
            definition?.candidates[0].steps.map((step) => step.type),
          ).toEqual([
            'entry',
            'gate',
            'elevator',
            'train',
            'elevator',
            'gate',
            'exit',
          ]);
          const train = definition?.candidates[0].steps.find(
            (step) => step.type === 'train',
          );
          expect(train?.trainSegment?.boardingPosition).not.toBeNull();
          expect(train?.platformGap?.level).not.toBe('red');
        }
      }
    },
  );

  it('김포공항에서 5호선과 김포골드라인을 연결한다', () => {
    const definition = createInterlineJourneyDefinition('G100', '2543');
    expect(definition?.candidates[0]).toMatchObject({
      transferStation: '김포공항',
      lines: ['김포골드라인', '5호선'],
    });
  });

  it('신림역에서 2호선과 신림선을 연결한다', () => {
    const definition = createInterlineJourneyDefinition('S411', '0222');
    expect(definition?.candidates[0]).toMatchObject({
      transferStation: '신림',
      lines: ['신림선', '2호선'],
    });
  });

  it('보라매역에서 7호선과 신림선을 연결한다', () => {
    const definition = createInterlineJourneyDefinition('S401', '2733');
    expect(definition?.candidates[0]).toMatchObject({
      transferStation: '보라매',
      lines: ['신림선', '7호선'],
    });
  });
});
