import { SUIN_BUNDANG_LINE_GUIDANCE } from './data/suin-bundang-line-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'suin-bundang-line',
  lineName: '수인분당선',
  guidance: SUIN_BUNDANG_LINE_GUIDANCE,
});

export const hasSuinBundangLineStation = adapter.hasStation;
export const getSuinBundangLineDistance = adapter.distance;
export const createSuinBundangLineJourneyDefinition = adapter.create;
