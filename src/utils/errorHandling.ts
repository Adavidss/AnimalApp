// Error handling utilities with retry logic and exponential backoff

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Increase delay for next attempt (exponential backoff)
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError!;
}

/**
 * Error types for better error handling
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode?: number, retryable: boolean = false) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Parse and categorize errors
 */
export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      'Network error. Please check your internet connection.',
      ErrorType.NETWORK,
      undefined,
      true
    );
  }

  if (error instanceof Error) {
    // Check for timeout
    if (error.message.includes('timeout') || error.message.includes('aborted')) {
      return new AppError(
        'Request timed out. Please try again.',
        ErrorType.TIMEOUT,
        408,
        true
      );
    }

    // Generic error
    return new AppError(
      error.message,
      ErrorType.UNKNOWN,
      undefined,
      false
    );
  }

  return new AppError(
    'An unknown error occurred.',
    ErrorType.UNKNOWN,
    undefined,
    false
  );
}

/**
 * Parse HTTP response errors
 */
export function parseHttpError(response: Response): AppError {
  const { status } = response;

  if (status === 404) {
    return new AppError(
      'Resource not found.',
      ErrorType.NOT_FOUND,
      404,
      false
    );
  }

  if (status === 429) {
    return new AppError(
      'Too many requests. Please try again later.',
      ErrorType.RATE_LIMIT,
      429,
      true
    );
  }

  if (status >= 500) {
    return new AppError(
      'Server error. Please try again later.',
      ErrorType.API,
      status,
      true
    );
  }

  if (status >= 400) {
    return new AppError(
      'Bad request. Please check your input.',
      ErrorType.VALIDATION,
      status,
      false
    );
  }

  return new AppError(
    `HTTP Error ${status}`,
    ErrorType.API,
    status,
    status >= 500
  );
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const appError = parseError(error);

  switch (appError.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect. Please check your internet connection and try again.';
    case ErrorType.TIMEOUT:
      return 'The request took too long. Please try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested information could not be found.';
    case ErrorType.RATE_LIMIT:
      return 'Too many requests. Please wait a moment and try again.';
    case ErrorType.VALIDATION:
      return 'Invalid input. Please check your data and try again.';
    case ErrorType.API:
      return 'Server error. Our team has been notified. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
  const appError = parseError(error);
  return appError.retryable;
}

/**
 * Fetch with retry and timeout
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const timeout = 30000; // 30 seconds

  const fetchWithTimeout = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw parseHttpError(response);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AppError('Request timeout', ErrorType.TIMEOUT, 408, true);
      }

      throw error;
    }
  };

  return retryWithBackoff(fetchWithTimeout, {
    maxRetries: 3,
    initialDelay: 1000,
    ...retryOptions,
    onRetry: (attempt, error) => {
      console.warn(`Retry attempt ${attempt} for ${url}:`, error.message);
      retryOptions.onRetry?.(attempt, error);
    }
  });
}

/**
 * Log error to console (in production, this would send to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const appError = parseError(error);

  console.error('Error logged:', {
    message: appError.message,
    type: appError.type,
    statusCode: appError.statusCode,
    retryable: appError.retryable,
    context,
    timestamp: new Date().toISOString()
  });

  // In production, send to error tracking service (Sentry, LogRocket, etc.)
  // if (process.env.NODE_ENV === 'production') {
  //   sentryClient.captureException(appError, { contexts: { custom: context } });
  // }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError(error, { json });
    return defaultValue;
  }
}

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  getItem: (key: string, defaultValue: string | null = null): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logError(error, { operation: 'getItem', key });
      return defaultValue;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logError(error, { operation: 'setItem', key });
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logError(error, { operation: 'removeItem', key });
      return false;
    }
  }
};

/**
 * Debounced error reporter (prevents spam)
 */
const errorReportQueue = new Map<string, NodeJS.Timeout>();

export function reportErrorDebounced(error: unknown, key: string, delay: number = 5000): void {
  // Clear existing timeout for this error type
  const existing = errorReportQueue.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  // Set new timeout
  const timeoutId = setTimeout(() => {
    logError(error, { key });
    errorReportQueue.delete(key);
  }, delay);

  errorReportQueue.set(key, timeoutId);
}

/**
 * Silently handle API errors without console spam
 * Only logs errors in development mode and uses console.debug
 * Perfect for external APIs that may be unreliable (CORS, down, etc.)
 */
export function handleApiErrorSilently(
  error: unknown,
  apiName: string,
  fallbackValue: any = null
): typeof fallbackValue {
  // Check if it's an expected error (404, etc.) - don't log those at all
  const appError = parseError(error);
  
  // Don't log expected errors like 404s (not found)
  if (appError.statusCode === 404 || appError.type === ErrorType.NOT_FOUND) {
    return fallbackValue;
  }

  // Only log unexpected errors in development mode
  if (import.meta.env.DEV) {
    console.debug(`[${apiName}] API error (silent):`, {
      message: appError.message,
      type: appError.type,
      statusCode: appError.statusCode
    });
  }

  return fallbackValue;
}

/**
 * Track failed API calls to show user a message if too many fail
 */
const apiFailureCount = new Map<string, number>();

export function trackApiFailure(apiName: string, threshold: number = 3): boolean {
  const current = apiFailureCount.get(apiName) || 0;
  const newCount = current + 1;
  apiFailureCount.set(apiName, newCount);

  // Reset count after 5 minutes
  setTimeout(() => {
    apiFailureCount.set(apiName, Math.max(0, (apiFailureCount.get(apiName) || 0) - 1));
  }, 5 * 60 * 1000);

  return newCount >= threshold;
}

export function resetApiFailureCount(apiName: string): void {
  apiFailureCount.set(apiName, 0);
}
