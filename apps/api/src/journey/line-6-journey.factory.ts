import { LINE_6_LOOP_GUIDANCE } from './data/line-6-loop-guidance.generated.js';
import { createLoopLineAdapter } from './loop-line-journey.factory.js';

const adapter = createLoopLineAdapter({
  id: 'line-6',
  lineName: '6호선',
  guidance: LINE_6_LOOP_GUIDANCE,
});

export const hasLine6Station = adapter.hasStation;
export const getLine6Distance = adapter.distance;
export const createLine6JourneyDefinition = adapter.create;
