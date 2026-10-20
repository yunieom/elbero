import { EVERLINE_GUIDANCE } from './data/everline-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'everline',
  lineName: '용인에버라인',
  guidance: EVERLINE_GUIDANCE,
});

export const hasEverlineStation = adapter.hasStation;
export const getEverlineDistance = adapter.distance;
export const createEverlineJourneyDefinition = adapter.create;
