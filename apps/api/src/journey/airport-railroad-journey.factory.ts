import { AIRPORT_RAILROAD_GUIDANCE } from './data/airport-railroad-guidance.generated.js';
import { createLinearLineAdapter } from './linear-line-journey.factory.js';

const adapter = createLinearLineAdapter({
  id: 'airport-railroad',
  lineName: '공항철도',
  guidance: AIRPORT_RAILROAD_GUIDANCE,
});

export const hasAirportRailroadStation = adapter.hasStation;
export const getAirportRailroadDistance = adapter.distance;
export const createAirportRailroadJourneyDefinition = adapter.create;
