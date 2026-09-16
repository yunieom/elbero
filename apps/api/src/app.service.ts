import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@elbero/contracts';

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      service: 'elbero-api',
    };
  }
}
