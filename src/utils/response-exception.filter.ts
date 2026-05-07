import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ResponseError, sendResponseError } from './response';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = extractMessage(response);

      return sendResponseError(res, new ResponseError(message, status));
    }

    return sendResponseError(res, exception);
  }
}

function extractMessage(response: unknown) {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Unexpected error';
}
