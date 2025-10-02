
export interface ExchangerProviderExceptionOptions {
  code?: number;
  status?: number; // HTTP status you want the filter to use (default 502)
  provider?: string;
  details?: unknown; // any structured details you want surfaced/logged
  retryable?: boolean; // signal to clients/backoffs
  cause?: unknown; // original error (ES2022 Error.cause)
}

export class ExchangerProviderException extends Error {
  readonly name = 'ProviderException';
  readonly code: number;
  readonly status: number;
  readonly provider?: string;
  readonly details?: unknown;
  readonly retryable: boolean;
  // mark as operational for process-level error handling strategies
  readonly isOperational = true;

  constructor(
    message: string,
    options: ExchangerProviderExceptionOptions = {},
  ) {
    super(message);
    // Ensure `instanceof Error` works across TS/JS transpilation targets
    Object.setPrototypeOf(this, new.target.prototype);

    this.code = options.code ?? 0;
    this.status = options.status ?? 502;
    this.provider = options.provider;
    this.details = options.details;
    this.retryable = options.retryable ?? false;

    // Attach cause for modern runtimes / Node 16.9+ with ES2022
    if (options.cause !== undefined) {
      (this as any).cause = options.cause;
    }

    // Maintain clean stack without constructor frame
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      provider: this.provider,
      retryable: this.retryable,
      details: this.details,
    };
  }
}
