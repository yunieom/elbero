import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  SeoulElevatorFacilityRow,
  SeoulElevatorStatusSnapshot,
} from './types/seoul-elevator-status.type.js';

const API_ROOT = 'http://openapi.seoul.go.kr:8088';
const SERVICE_NAME = 'SeoulMetroFaciInfo';
const PAGE_SIZE = 1_000;
const CACHE_TTL_MS = 60 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 20_000;

interface SeoulApiResult {
  CODE?: string;
  MESSAGE?: string;
}

interface SeoulApiServicePayload {
  list_total_count?: number;
  RESULT?: SeoulApiResult;
  row?: SeoulElevatorFacilityRow[];
}

interface SeoulApiPayload {
  [SERVICE_NAME]?: SeoulApiServicePayload;
}

@Injectable()
export class ElevatorStatusClient {
  private readonly logger = new Logger(ElevatorStatusClient.name);
  private snapshot: SeoulElevatorStatusSnapshot | null = null;
  private inFlight: Promise<SeoulElevatorStatusSnapshot> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async getSnapshot(): Promise<SeoulElevatorStatusSnapshot> {
    if (this.snapshot && this.snapshot.expiresAt > Date.now()) {
      return this.snapshot;
    }

    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.fetchSnapshot();

    try {
      this.snapshot = await this.inFlight;
      return this.snapshot;
    } finally {
      this.inFlight = null;
    }
  }

  private async fetchSnapshot(): Promise<SeoulElevatorStatusSnapshot> {
    const apiKey = this.configService.get<string>('SEOUL_OPEN_DATA_API_KEY');

    if (!apiKey || /^https?:\/\//i.test(apiKey)) {
      throw new ServiceUnavailableException(
        '서울 승강기 상태 API 인증키가 올바르게 설정되지 않았습니다.',
      );
    }

    try {
      const checkedAt = new Date().toISOString();
      const firstPage = await this.fetchPage(apiKey, 1, PAGE_SIZE);
      const totalCount = firstPage.list_total_count;

      if (!Number.isInteger(totalCount) || (totalCount ?? 0) < 0) {
        throw new Error('invalid total count');
      }

      const pageRequests: Promise<SeoulApiServicePayload>[] = [];
      for (
        let startIndex = PAGE_SIZE + 1;
        startIndex <= totalCount!;
        startIndex += PAGE_SIZE
      ) {
        const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount!);
        pageRequests.push(this.fetchPage(apiKey, startIndex, endIndex));
      }

      const remainingPages = await Promise.all(pageRequests);
      const rows = [
        ...(firstPage.row ?? []),
        ...remainingPages.flatMap((page) => page.row ?? []),
      ];

      return {
        checkedAt,
        expiresAt: Date.now() + CACHE_TTL_MS,
        rows,
      };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      const reason = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`서울 승강기 상태 조회 실패: ${reason}`);
      throw new ServiceUnavailableException(
        '서울 승강기 상태를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      );
    }
  }

  private async fetchPage(
    apiKey: string,
    startIndex: number,
    endIndex: number,
  ): Promise<SeoulApiServicePayload> {
    const url = `${API_ROOT}/${encodeURIComponent(apiKey)}/json/${SERVICE_NAME}/${startIndex}/${endIndex}/`;
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const body = await response.text();
    let payload: SeoulApiPayload;

    try {
      payload = JSON.parse(body) as SeoulApiPayload;
    } catch {
      throw new Error(`non-JSON response (HTTP ${response.status})`);
    }

    const servicePayload = payload[SERVICE_NAME];
    if (
      !response.ok ||
      !servicePayload ||
      servicePayload.RESULT?.CODE !== 'INFO-000'
    ) {
      throw new Error(
        `upstream error (HTTP ${response.status}, API ${servicePayload?.RESULT?.CODE ?? 'unknown'})`,
      );
    }

    return servicePayload;
  }
}
