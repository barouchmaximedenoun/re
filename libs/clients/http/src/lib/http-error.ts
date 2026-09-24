import { AppError } from '@platform/errors';

export class HttpError extends AppError {
  public readonly data: unknown;

  constructor(
    message: string,
    options: {
      statusCode: number;
      code?: string;
      data?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, {
      statusCode: options.statusCode,
      code: options.code ?? 'HTTP_ERROR',
      cause: options.cause,
    });

    this.name = 'HttpError';
    this.data = options.data;
  }
}