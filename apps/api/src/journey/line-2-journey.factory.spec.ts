import { describe, expect, it } from 'vitest';
import { createLine2JourneyDefinition } from './line-2-journey.factory.js';

describe('createLine2JourneyDefinition', () => {
  it('uses the manually verified city-hall door by travel direction', () => {
    const towardChungjeongno = createLine2JourneyDefinition('0202', '0201');
    const towardEuljiro = createLine2JourneyDefinition('0243', '0201');

    expect(findTrainSteps(towardChungjeongno)[0]?.trainSegment).toMatchObject({
      direction: '시청 방면',
      boardingPosition: { carNumber: 6, doorNumber: 2 },
    });
    expect(findTrainSteps(towardEuljiro)[0]?.trainSegment).toMatchObject({
      direction: '시청 방면',
      boardingPosition: { carNumber: 5, doorNumber: 3 },
    });
  });

  it('keeps the Sinjeong branch separate from the main circle at Sindorim', () => {
    const branch = createLine2JourneyDefinition('0234', '0248');
    const main = createLine2JourneyDefinition('0235', '0233');

    expect(findTrainSteps(branch)).toHaveLength(1);
    expect(findTrainSteps(branch)[0]?.trainSegment).toMatchObject({
      originStationName: '신도림',
      destinationStationName: '양천구청',
      boardingPosition: { carNumber: 4, doorNumber: 1 },
    });
    expect(findTrainSteps(main)[0]?.trainSegment).toMatchObject({
      originStationName: '문래',
      destinationStationName: '대림',
      boardingPosition: { carNumber: 3, doorNumber: 2 },
    });
  });

  it('creates transfers between both branches and the main circle', () => {
    const definition = createLine2JourneyDefinition('0248', '0246');
    const steps = definition?.candidates[0].steps ?? [];

    expect(findTrainSteps(definition)).toHaveLength(3);
    expect(steps.filter((step) => step.type === 'transfer')).toHaveLength(2);
    expect(definition?.candidates[0].transferStation).toBe('신도림');
    expect(steps.map((step) => step.order)).toEqual(
      steps.map((_, index) => index + 1),
    );
  });

  it('uses the closer-exit wording when multiple surface elevators exist', () => {
    const definition = createLine2JourneyDefinition('0234', '0248');
    const entry = definition?.candidates[0].steps.find(
      (step) => step.type === 'entry',
    );

    expect(entry?.instruction).toBe(
      '1, 3번 출구 중 가까운 출구의 지상 엘리베이터를 이용해 대합실로 이동하세요.',
    );
  });
});

function findTrainSteps(
  definition: ReturnType<typeof createLine2JourneyDefinition>,
) {
  return (
    definition?.candidates[0].steps.filter((step) => step.type === 'train') ??
    []
  );
}
