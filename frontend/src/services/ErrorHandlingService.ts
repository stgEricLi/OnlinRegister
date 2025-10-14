import { store } from "../store/store";
import { handleUnauthorized } from "../store/slices/authSlice";
import type {
  AppError,
  ErrorContext,
  NetworkError,
  ValidationError,
  AuthenticationError,
  ServerError,
  TimeoutError,
} from "../interfaces/IError";
import { ErrorSeverity } from "../interfaces/IError";
import type { ApiError } from "../interfaces/IHttp";

class ErrorHandlingService {
  private errorQueue: AppError[] = [];
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private errorListeners: ((error: AppError) => void)[] = [];

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  // Setup global error handlers for unhandled errors
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      console.error(
        "ErrorHandlingService: Unhandled promise rejection:",
        event.reason
      );
      this.handleError(
        this.createServerError("Unhandled promise rejection", 500, false)
      );
      event.preventDefault();
    });

    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      console.error(
        "ErrorHandlingService: Global JavaScript error:",
        event.error
      );
      this.handleError(
        this.createServerError(
          event.error?.message || "JavaScript error occurred",
          500,
          false
        )
      );
    });

    // Listen for auth unauthorized events
    window.addEventListener("auth:unauthorized", () => {
      this.handleAuthError("Session expired. Please log in again.", true);
    });
  }

  //#region ---- Error handling functions ----
  // AppError = NetworkError | ValidationError | AuthenticationError | ServerError | TimeoutError
  // ApiError { message: string; status?: number; data?: any;}
  // Error is from the JS library
  // ErrorContext { component?: string; action?: string; userId?: string; timestamp: string; userAgent: string; url: string;}
  public handleError(
    error: AppError | ApiError | Error | string,
    context?: Partial<ErrorContext>
  ): void {
    const normalizedError = this.normalizeError(error);
    const errorContext = this.createErrorContext(context);

    // Log error with context
    this.logError(normalizedError, errorContext);

    // Handle specific error types
    switch (normalizedError.type) {
      case "authentication":
        this.handleAuthenticationError(normalizedError);
        break;
      case "network":
        this.handleNetworkError(normalizedError);
        break;
      case "validation":
        this.handleValidationError(normalizedError);
        break;
      case "server":
        this.handleServerError(normalizedError);
        break;
      case "timeout":
        this.handleTimeoutError(normalizedError);
        break;
      default:
        this.handleGenericError(normalizedError);
    }

    // Add to error queue for potential retry
    this.addToErrorQueue(normalizedError);

    // Notify error listeners (like ErrorToast)
    this.notifyErrorListeners(normalizedError);
  }

  // Handle auth errors specifically
  public handleAuthError(message: string, requiresLogin: boolean = true): void {
    const authError = this.createAuthError(message, requiresLogin);
    this.handleError(authError);
  }

  // Handle authentication errors: { type: "authentication"; message: string; requiresLogin: boolean;}
  private handleAuthenticationError(error: AuthenticationError): void {
    if (error.requiresLogin) {
      // Dispatch to Redux store (update state)
      store.dispatch(handleUnauthorized());

      // Clear any stored tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");

      // Redirect to login if needed
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  // Handle network errors: { type: "network"; message: string; isOffline: boolean;}
  private handleNetworkError(error: NetworkError): void {
    if (error.isOffline) {
      this.showNotification(
        "You appear to be offline. Please check your connection.",
        "warning"
      );
    } else {
      this.showNotification(
        "Network error occurred. Please try again.",
        "error"
      );
    }
  }

  // Handle validation errors: { type: "validation"; field: string; message: string;}
  private handleValidationError(error: ValidationError): void {
    // Validation errors are typically handled by form components
    // But we can log them or show global notifications if needed
    console.warn("Validation error:", error);
  }

  // Handle server errors { type: "server"; message: string; statusCode: number; canRetry: boolean;}
  private handleServerError(error: ServerError): void {
    if (error.statusCode >= 500) {
      this.showNotification(
        "Server error occurred. Please try again later.",
        "error"
      );
    } else {
      this.showNotification(error.message, "warning");
    }
  }

  // Handle timeout errors: { type: "timeout"; message: string; canRetry: boolean;}
  private handleTimeoutError(error: TimeoutError): void {
    this.showNotification("Request timed out. Please try again.", "warning");
  }

  // Handle generic errors: NetworkError | ValidationError | AuthenticationError | ServerError | TimeoutError
  private handleGenericError(error: AppError): void {
    this.showNotification(error.message, "error");
  }
  //#endregion

  //#region ---- Error creating Functions ----
  // return ServerError object: { type: "server"; message: string; statusCode: number; canRetry: boolean;}
  public createServerError(
    message: string,
    statusCode: number,
    canRetry: boolean = false
  ): ServerError {
    return { type: "server", message, statusCode, canRetry };
  }

  // return AuthenticationError object: { type: "authentication"; message: string; requiresLogin: boolean;}
  public createAuthError(
    message: string,
    requiresLogin: boolean = true
  ): AuthenticationError {
    return {
      type: "authentication",
      message,
      requiresLogin,
    };
  }

  // return ValidationError object: { type: "validation"; field: string; message: string;}
  public createValidationError(
    field: string,
    message: string
  ): ValidationError {
    return {
      type: "validation",
      field,
      message,
    };
  }

  // return NetworkError object:  { type: "network"; message: string; isOffline: boolean;}
  public createNetworkError(
    message: string,
    isOffline: boolean = false
  ): NetworkError {
    return { type: "network", message, isOffline };
  }

  // return TimeoutError object:  { type: "timeout"; message: string; canRetry: boolean;}
  public createTimeoutError(
    message: string,
    canRetry: boolean = true
  ): TimeoutError {
    return { type: "timeout", message, canRetry };
  }
  //#endregion

  //#region ---- Error Queen Functions ----
  // Add error to queue for potential retry
  private addToErrorQueue(error: AppError): void {
    this.errorQueue.push(error);

    // Keep queue size manageable
    if (this.errorQueue.length > 10) {
      this.errorQueue.shift();
    }
  }

  // Clear error queue
  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Get current error queue
  public getErrorQueue(): AppError[] {
    return [...this.errorQueue];
  }
  //#endregion

  //#region ---- Helper Functions ----
  // AppError = NetworkError | ValidationError | AuthenticationError | ServerError | TimeoutError
  // ApiError { message: string; status?: number; data?: any;}
  // Error is from the JS library
  private normalizeError(
    error: AppError | ApiError | Error | string
  ): AppError {
    if (typeof error === "string") {
      return this.createServerError(error, 500, false);
    }

    if (error instanceof Error) {
      return this.createServerError(error.message, 500, false);
    }

    // Check if it's an ApiError
    if ("status" in error && "message" in error) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        return this.createAuthError(apiError.message, true);
      } else if (apiError.status === 422) {
        return this.createValidationError("general", apiError.message);
      } else if (apiError.status && apiError.status >= 500) {
        return this.createServerError(apiError.message, apiError.status, true);
      } else if (apiError.status && apiError.status >= 400) {
        return this.createServerError(apiError.message, apiError.status, false);
      }
    }

    // If it's already an AppError, return as is
    if ("type" in error) {
      return error as AppError;
    }

    // Fallback
    return this.createServerError("Unknown error occurred", 500, false);
  }

  // Create error context
  // ErrorContext { component?: string; action?: string; userId?: string; timestamp: string; userAgent: string; url: string;}
  private createErrorContext(context?: Partial<ErrorContext>): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context,
    };
  }

  private showNotification(
    message: string,
    type: "info" | "warning" | "error" | "success"
  ): void {
    // This could integrate with a toast notification system
    // For now, we'll use console and could dispatch to a notification slice
    console.log(`[${type.toUpperCase()}] ${message}`);

    // You could dispatch to a notification slice here
    // store.dispatch(showNotification({ message, type }));
  }

  // Error severity classification
  public getErrorSeverity(error: AppError): ErrorSeverity {
    switch (error.type) {
      case "network":
        return error.isOffline ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
      case "validation":
        return ErrorSeverity.LOW;
      case "authentication":
        return error.requiresLogin ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH;
      case "server":
        return error.statusCode >= 500
          ? ErrorSeverity.HIGH
          : ErrorSeverity.MEDIUM;
      case "timeout":
        return ErrorSeverity.MEDIUM;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  //Retry failed operations
  public async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    delay: number = this.retryDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          this.handleError(lastError);
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError!;
  }

  // Check if error can be retried
  public canRetry(error: AppError): boolean {
    switch (error.type) {
      case "network":
        return true;
      case "validation":
        return false;
      case "authentication":
        return false;
      case "server":
        return error.canRetry;
      case "timeout":
        return error.canRetry;
      default:
        return false;
    }
  }

  // Get user-friendly error message
  public getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case "network":
        return error.isOffline
          ? "You appear to be offline. Please check your internet connection and try again."
          : "Connection problem. Please check your internet connection and try again.";
      case "validation":
        return error.message;
      case "authentication":
        return error.requiresLogin
          ? "Please log in to continue."
          : "You don't have permission to perform this action.";
      case "server":
        return error.canRetry
          ? "Server is temporarily unavailable. Please try again in a moment."
          : error.message;
      case "timeout":
        return "The request is taking longer than expected. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  // Log error with context
  private logError(error: AppError, context: ErrorContext): void {
    const logData = {
      error,
      context,
      timestamp: context.timestamp,
    };

    console.error("ErrorHandlingService:", logData);

    // In production, you might want to send this to a logging service
    if (import.meta.env.PROD) {
      // Send to logging service (e.g., Sentry, LogRocket, etc.)
      // this.sendToLoggingService(logData);
    }
  }

  //#region ---- Event Listener Methods ----
  // Add error listener for components like ErrorToast
  public addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  // Remove error listener
  public removeErrorListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  // Notify all listeners about an error
  private notifyErrorListeners(error: AppError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error("Error in error listener:", err);
      }
    });
  }
  //#endregion
  //#endregion
}

// Create and export singleton instance
const errorHandlingService = new ErrorHandlingService();
export default errorHandlingService;
