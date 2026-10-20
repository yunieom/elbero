import { LINE_9_GUIDANCE } from './data/line-9-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'line-9',
  lineName: '9호선',
  guidance: LINE_9_GUIDANCE,
});

export const hasLine9Station = adapter.hasStation;
export const getLine9Distance = adapter.distance;
export const createLine9JourneyDefinition = adapter.create;
