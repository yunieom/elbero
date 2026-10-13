import { GIMPO_GOLDLINE_GUIDANCE } from './data/gimpo-goldline-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'gimpo-goldline',
  lineName: '김포골드라인',
  guidance: GIMPO_GOLDLINE_GUIDANCE,
});

export const hasGimpoGoldlineStation = adapter.hasStation;
export const getGimpoGoldlineDistance = adapter.distance;
export const createGimpoGoldlineJourneyDefinition = adapter.create;
