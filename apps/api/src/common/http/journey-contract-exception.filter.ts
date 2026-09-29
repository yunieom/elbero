import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import {
  createJourneyContractError,
  createJourneyContractMeta,
  JOURNEY_ERROR_CODE,
  type JourneyContractResult,
} from '@elbero/contracts';
import type { Response } from 'express';

@Catch(HttpException)
export class JourneyContractExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = exception.getResponse();

    if (isJourneyFailure(body)) {
      response.status(exception.getStatus()).json(body);
      return;
    }

    const result: JourneyContractResult<never> = {
      ok: false,
      error: createJourneyContractError(
        exception.getStatus() === 503
          ? JOURNEY_ERROR_CODE.SOURCE_UNAVAILABLE
          : JOURNEY_ERROR_CODE.INVALID_REQUEST,
        readMessage(body) ?? exception.message,
      ),
      meta: createJourneyContractMeta('http-exception', null),
    };
    response.status(exception.getStatus()).json(result);
  }
}

function isJourneyFailure(
  body: string | object,
): body is Extract<JourneyContractResult<never>, { ok: false }> {
  if (typeof body !== 'object' || body === null) return false;
  const value = body as { ok?: unknown; error?: { code?: unknown } };
  return value.ok === false && typeof value.error?.code === 'string';
}

function readMessage(body: string | object): string | null {
  if (typeof body === 'string') return body;
  const message = (body as { message?: unknown }).message;
  if (Array.isArray(message)) return message.join(', ');
  return typeof message === 'string' ? message : null;
}
