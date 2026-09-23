import { AppError } from '@platform/errors';

export class HttpError extends AppError {
  constructor(
    message: string,
    options: {
      statusCode: number;
      code?: string;
      cause?: unknown;
    },
  ) {
    super(message, {
      statusCode: options.statusCode,
      code: options.code ?? 'HTTP_ERROR',
      cause: options.cause,
    });

    this.name = 'HttpError';
  }
}
