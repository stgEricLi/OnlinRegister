// Error types for comprehensive error handling
export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface NetworkError {
  type: "network";
  message: string;
  isOffline: boolean;
}

export interface ValidationError {
  type: "validation";
  field: string;
  message: string;
}

export interface AuthenticationError {
  type: "authentication";
  message: string;
  requiresLogin: boolean;
}

export interface ServerError {
  type: "server";
  message: string;
  statusCode: number;
  canRetry: boolean;
}

export interface TimeoutError {
  type: "timeout";
  message: string;
  canRetry: boolean;
}

export type AppError =
  | NetworkError
  | ValidationError
  | AuthenticationError
  | ServerError
  | TimeoutError;

export type { AuthError } from "../interfaces/IAuth";
export type { ApiError } from "../interfaces/IHttp";

export interface ErrorState {
  hasError: boolean;
  error?: AppError;
  isRetrying: boolean;
  retryCount: number;
}

// Error severity levels
export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

// Error categories for better handling
export const ErrorCategory = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  SERVER: "server",
  CLIENT: "client",
  TIMEOUT: "timeout",
} as const;

export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export interface ToastError {
  id: string;
  error: AppError;
  timestamp: number;
}
