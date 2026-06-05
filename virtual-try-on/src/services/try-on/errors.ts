export type TryOnErrorCode =
  | 'API_UNAUTHORIZED'
  | 'API_RATE_LIMIT'
  | 'TIMEOUT'
  | 'API_ERROR';

export class TryOnServiceError extends Error {
  readonly code: TryOnErrorCode;

  readonly status: number;

  constructor(code: TryOnErrorCode, message: string, status: number) {
    super(message);
    this.name = 'TryOnServiceError';
    this.code = code;
    this.status = status;
  }
}

export function toHttpStatus(code: TryOnErrorCode): number {
  switch (code) {
    case 'API_UNAUTHORIZED':
      return 502;
    case 'API_RATE_LIMIT':
      return 429;
    case 'TIMEOUT':
      return 504;
    default:
      return 500;
  }
}

export function toClientMessage(code: TryOnErrorCode): string {
  switch (code) {
    case 'API_UNAUTHORIZED':
      return 'AI service authentication failed. Check server configuration.';
    case 'API_RATE_LIMIT':
      return 'AI service is busy. Please try again in a moment.';
    case 'TIMEOUT':
      return 'Generation timed out. Please try again.';
    default:
      return 'Try-on failed. Please try again.';
  }
}
