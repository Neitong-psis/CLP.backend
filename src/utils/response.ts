import type { Response } from 'express';
import { z } from 'zod';

export type ResponseErrorWrapper = {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown;
};

export type ResponseSuccessWrapper = {
  success: true;
  message?: string;
  data: unknown;
  hasMore?: boolean;
};

export class ResponseError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;

    // Fix prototype chain
    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}

const getGenericErrorMessage = (code: string) => {
  const errorMessages = {
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '409': 'Conflict',
    '422': 'Unprocessable Entity',
    '429': 'Too Many Requests',
    '500': 'Internal Server Error',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    default: 'Unknown Error',
  };

  return errorMessages[code as keyof typeof errorMessages] || errorMessages.default;
};

const isProd = process.env.ENVIRONMENT === 'production';

export const sendResponseError = (res: Response, err: unknown) => {
  if (err instanceof ResponseError) {
    const response: ResponseErrorWrapper = {
      success: false,
      error: isProd ? getGenericErrorMessage(err.code.toString()) : err.message,
    };
    console.error('Response Error:', response);
    return res.status(err.code).json(response);
  }

  if (err instanceof z.ZodError) {
    const response: ResponseErrorWrapper = {
      success: false,
      error: isProd
        ? getGenericErrorMessage('400')
        : err.issues.map((issue) => issue.message).join(', '),
    };
    console.error('Zod Error:', response);
    return res.status(400).json(response);
  }

  const response: ResponseErrorWrapper = {
    success: false,
    error: isProd
      ? getGenericErrorMessage('500')
      : err instanceof Error
        ? err.message
        : 'Internal Server Error',
  };
  console.error('Response Error:', response);
  return res.status(500).json(response);
};

export const sendResponseSuccess = (
  res: Response,
  data: unknown,
  message?: string,
  hasMore?: boolean,
) => {
  const response: ResponseSuccessWrapper = {
    success: true,
    message: message ? (isProd ? 'Success' : message) : undefined,
    data,
    hasMore,
  };
  return res.status(200).json(response);
};

export const getResponseSuccessSchema = (dataSchema: z.ZodTypeAny) => {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
};

export const getResponseErrorSchema = (errorSchema?: z.ZodTypeAny) => {
  return z.object({
    success: z.literal(false),
    error: errorSchema ?? z.string(),
  });
};
