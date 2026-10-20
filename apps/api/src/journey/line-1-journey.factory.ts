import { LINE_1_NETWORK_GUIDANCE } from './data/line-1-network-guidance.generated.js';
import { createNetworkLineAdapter } from './network-line-journey.factory.js';

const adapter = createNetworkLineAdapter({
  id: 'line-1',
  lineName: '1호선',
  guidance: LINE_1_NETWORK_GUIDANCE,
});

export const hasLine1Station = adapter.hasStation;
export const getLine1Distance = adapter.distance;
export const createLine1JourneyDefinition = adapter.create;
