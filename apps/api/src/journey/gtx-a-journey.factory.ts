import { GTX_A_GUIDANCE } from './data/gtx-a-guidance.generated.js';
import { createNetworkLineAdapter } from './network-line-journey.factory.js';

const adapter = createNetworkLineAdapter({
  id: 'gtx-a',
  lineName: 'GTX-A',
  guidance: GTX_A_GUIDANCE,
});

export const hasGtxAStation = adapter.hasStation;
export const getGtxADistance = adapter.distance;
export const createGtxAJourneyDefinition = adapter.create;
