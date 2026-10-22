import { SHINBUNDANG_LINE_GUIDANCE } from './data/shinbundang-line-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'shinbundang-line',
  lineName: '신분당선',
  guidance: SHINBUNDANG_LINE_GUIDANCE,
});

export const hasShinbundangLineStation = adapter.hasStation;
export const getShinbundangLineDistance = adapter.distance;
export const createShinbundangLineJourneyDefinition = adapter.create;
