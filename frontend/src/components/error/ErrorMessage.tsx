import React from "react";
import type { AppError } from "../../interfaces/IError";
import type { ErrorSeverity } from "../../interfaces/IError";
import errorHandlingService from "../../services/ErrorHandlingService";
import "./ErrorMessage.css";

// AppError = NetworkError | ValidationError | AuthenticationError | ServerError | TimeoutError
interface ErrorMessageProps {
  error: AppError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  className = "",
  showDetails = false,
}) => {
  if (!error) return null;

  // Convert string error to AppError format
  const appError =
    typeof error === "string"
      ? errorHandlingService.createServerError(error, 500, false)
      : error;
  const severity = errorHandlingService.getErrorSeverity(appError);
  const canRetry = errorHandlingService.canRetry(appError);
  const userMessage = errorHandlingService.getUserFriendlyMessage(appError);

  const getSeverityClass = (severity: ErrorSeverity): string => {
    switch (severity) {
      case "low":
        return "error-message--info";
      case "medium":
        return "error-message--warning";
      case "high":
        return "error-message--error";
      case "critical":
        return "error-message--critical";
      default:
        return "error-message--warning";
    }
  };

  const getSeverityIcon = (severity: ErrorSeverity): string => {
    switch (severity) {
      case "low":
        return "ℹ️";
      case "medium":
        return "⚠️";
      case "high":
        return "❌";
      case "critical":
        return "🚨";
      default:
        return "⚠️";
    }
  };

  return (
    <div className={`error-message ${getSeverityClass(severity)} ${className}`}>
      <div className="error-message__content">
        <div className="error-message__header">
          <span className="error-message__icon">
            {getSeverityIcon(severity)}
          </span>
          <span className="error-message__text">{userMessage}</span>
        </div>

        {showDetails && (
          <div className="error-message__details">
            <details>
              <summary>Technical Details</summary>
              <pre>{JSON.stringify(appError, null, 2)}</pre>
            </details>
          </div>
        )}

        <div className="error-message__actions">
          {canRetry && onRetry && (
            <button
              className="error-message__button error-message__button--retry"
              onClick={onRetry}
            >
              Try Again
            </button>
          )}
          {onDismiss && (
            <button
              className="error-message__button error-message__button--dismiss"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized error message components
export const NetworkErrorMessage: React.FC<{ onRetry?: () => void }> = ({
  onRetry,
}) => (
  <ErrorMessage
    error={errorHandlingService.createNetworkError(
      "Network connection failed",
      !navigator.onLine
    )}
    onRetry={onRetry}
  />
);

export const ValidationErrorMessage: React.FC<{
  field: string;
  message: string;
  onDismiss?: () => void;
}> = ({ field, message, onDismiss }) => (
  <ErrorMessage
    error={{
      type: "validation",
      field,
      message,
    }}
    onDismiss={onDismiss}
  />
);

export const AuthErrorMessage: React.FC<{ onLogin?: () => void }> = ({
  onLogin,
}) => (
  <ErrorMessage
    error={{
      type: "authentication",
      message: "Authentication required",
      requiresLogin: true,
    }}
    onRetry={onLogin}
  />
);
