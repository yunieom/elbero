import { LINE_8_GUIDANCE } from './data/line-8-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'line-8',
  lineName: '8호선',
  guidance: LINE_8_GUIDANCE,
});

export const hasLine8Station = adapter.hasStation;
export const getLine8Distance = adapter.distance;
export const createLine8JourneyDefinition = adapter.create;
