import { Injectable } from '@nestjs/common';
import type { JourneyContractResult } from '@elbero/contracts';
import { randomUUID } from 'node:crypto';
import { ElevatorStatusClient } from '../elevator-status/elevator-status.client.js';
import { VERIFIED_JOURNEYS } from './data/verified-journeys.data.js';
import type { JourneyPlanResDto } from './dto/res/journey-plan.res.dto.js';
import type { Line5StationResDto } from './dto/res/line-5-station.res.dto.js';
import { JourneyRouteEngine } from './journey-route-engine.service.js';
import {
  createLine5JourneyDefinition,
  listLine5Stations,
} from './line-5-journey.factory.js';
import { createLine5Line7JourneyDefinition } from './line-5-7-journey.factory.js';
import { createLine7JourneyDefinition } from './line-7-journey.factory.js';
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
      originStationCode.padStart(4, '0'),
      destinationStationCode.padStart(4, '0'),
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
      createLine5JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine7JourneyDefinition(originStationCode, destinationStationCode) ??
      createLine5Line7JourneyDefinition(
        originStationCode,
        destinationStationCode,
      )
    );
  }
}

function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === 'TimeoutError' ||
    error.name === 'AbortError' ||
    /timeout|시간.*초과/i.test(error.message)
  );
}
