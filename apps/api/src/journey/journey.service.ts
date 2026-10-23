import { Injectable } from '@nestjs/common';
import type { JourneyContractResult } from '@elbero/contracts';
import { randomUUID } from 'node:crypto';
import { ElevatorStatusClient } from '../elevator-status/elevator-status.client.js';
import { VERIFIED_JOURNEYS } from './data/verified-journeys.data.js';
import type { JourneyPlanResDto } from './dto/res/journey-plan.res.dto.js';
import type { Line5StationResDto } from './dto/res/line-5-station.res.dto.js';
import { JourneyRouteEngine } from './journey-route-engine.service.js';
import { createGimpoGoldlineJourneyDefinition } from './gimpo-goldline-journey.factory.js';
import { createAirportRailroadJourneyDefinition } from './airport-railroad-journey.factory.js';
import { createEverlineJourneyDefinition } from './everline-journey.factory.js';
import { createInterlineJourneyDefinition } from './interline-journey.factory.js';
import { createLine2JourneyDefinition } from './line-2-journey.factory.js';
import { createLine1JourneyDefinition } from './line-1-journey.factory.js';
import { createLine3JourneyDefinition } from './line-3-journey.factory.js';
import { createLine4JourneyDefinition } from './line-4-journey.factory.js';
import {
  createLine5JourneyDefinition,
  listLine5Stations,
} from './line-5-journey.factory.js';
import { createLine6JourneyDefinition } from './line-6-journey.factory.js';
import { createLine7JourneyDefinition } from './line-7-journey.factory.js';
import { createLine8JourneyDefinition } from './line-8-journey.factory.js';
import { createLine9JourneyDefinition } from './line-9-journey.factory.js';
import { createSillimLineJourneyDefinition } from './sillim-line-journey.factory.js';
import { createShinbundangLineJourneyDefinition } from './shinbundang-line-journey.factory.js';
import { createSuinBundangLineJourneyDefinition } from './suin-bundang-line-journey.factory.js';
import { createGtxAJourneyDefinition } from './gtx-a-journey.factory.js';
import type { VerifiedJourneyDefinition } from './types/verified-journey.type.js';

@Injectable()
export class JourneyService {
  constructor(
    private readonly elevatorStatusClient: ElevatorStatusClient,
    private readonly routeEngine: JourneyRouteEngine,
  ) {}

  listLine5Stations(): Line5StationResDto[] {
    return listLine5Stations();
  }

  async plan(
    originStationCode: string,
    destinationStationCode: string,
  ): Promise<JourneyContractResult<JourneyPlanResDto>> {
    const requestId = randomUUID();
    const definition = this.findDefinition(
      normalizeStationCode(originStationCode),
      normalizeStationCode(destinationStationCode),
    );

    if (!definition) return this.routeEngine.plan(null, null, requestId);

    try {
      const snapshot = await this.elevatorStatusClient.getSnapshot();
      return this.routeEngine.plan(definition, snapshot, requestId);
    } catch (error) {
      return this.routeEngine.sourceFailure(
        requestId,
        definition.dataVersion,
        isTimeoutError(error),
      );
    }
  }

  private findDefinition(
    originStationCode: string,
    destinationStationCode: string,
  ): VerifiedJourneyDefinition | null {
    return (
      VERIFIED_JOURNEYS.find(
        (journey) =>
          journey.originStationCode === originStationCode &&
          journey.destinationStationCode === destinationStationCode,
      ) ??
      createLine1JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine2JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine3JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine4JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine5JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine6JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine7JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine8JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine9JourneyDefinition(originStationCode, destinationStationCode) ??
      createGimpoGoldlineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createSillimLineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createAirportRailroadJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createEverlineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createShinbundangLineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createSuinBundangLineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      ) ??
      createGtxAJourneyDefinition(originStationCode, destinationStationCode) ??
      createInterlineJourneyDefinition(
        originStationCode,
        destinationStationCode,
      )
    );
  }
}

function normalizeStationCode(stationCode: string): string {
  return /^\d{3}$/u.test(stationCode)
    ? stationCode.padStart(4, '0')
    : stationCode;
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /timeout|시간.*초과/i.test(error.message)
  );
}
