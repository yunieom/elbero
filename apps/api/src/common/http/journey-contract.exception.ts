import { HttpException } from '@nestjs/common';
import {
  JOURNEY_ERROR_POLICY,
  type JourneyContractResult,
} from '@elbero/contracts';

export class JourneyContractException extends HttpException {
  constructor(result: Extract<JourneyContractResult<unknown>, { ok: false }>) {
    super(result, JOURNEY_ERROR_POLICY[result.error.code].httpStatus);
  }
}
