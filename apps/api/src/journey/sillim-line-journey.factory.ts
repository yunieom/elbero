import { SILLIM_LINE_GUIDANCE } from './data/sillim-line-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'sillim-line',
  lineName: '신림선',
  guidance: SILLIM_LINE_GUIDANCE,
});

export const hasSillimLineStation = adapter.hasStation;
export const getSillimLineDistance = adapter.distance;
export const createSillimLineJourneyDefinition = adapter.create;
