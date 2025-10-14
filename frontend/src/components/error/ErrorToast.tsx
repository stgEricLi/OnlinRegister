import React, { useState, useEffect } from "react";
import type { AppError, ToastError } from "../../interfaces/IError";
import errorHandlingService from "../../services/ErrorHandlingService";
import "./ErrorToast.css";

interface ErrorToastProps {
  autoHideDuration?: number;
  maxToasts?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export const ErrorToastContainer: React.FC<ErrorToastProps> = ({
  autoHideDuration = 5000,
  maxToasts = 3,
  position = "top-right",
}) => {
  const [toasts, setToasts] = useState<ToastError[]>([]);

  useEffect(() => {
    const handleError = (error: AppError) => {
      // Only show certain types of errors as toasts
      const severity = errorHandlingService.getErrorSeverity(error);

      // Skip low severity errors or validation errors (they're usually handled by forms)
      if (severity === "low" || error.type === "validation") {
        return;
      }

      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastError = {
        id,
        error,
        timestamp: Date.now(),
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev].slice(0, maxToasts);
        return updated;
      });

      // Auto-hide toast based on severity
      if (autoHideDuration > 0) {
        const hideDelay =
          severity === "critical" ? autoHideDuration * 2 : autoHideDuration;
        setTimeout(() => {
          removeToast(id);
        }, hideDelay);
      }
    };

    errorHandlingService.addErrorListener(handleError);

    return () => {
      errorHandlingService.removeErrorListener(handleError);
    };
  }, [autoHideDuration, maxToasts]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleRetry = async (toast: ToastError) => {
    try {
      // Emit a retry event that components can listen to
      window.dispatchEvent(
        new CustomEvent("error-retry", {
          detail: { error: toast.error },
        })
      );

      // Remove the toast immediately on retry
      removeToast(toast.id);

      // You could also implement automatic retry logic here
      // For example, if it's a network error, retry the last failed request
    } catch (error) {
      console.error("Retry failed:", error);
      // The error will be handled by the global error handler
    }
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`error-toast-container error-toast-container--${position}`}>
      {toasts.length > 1 && (
        <div className="error-toast-header">
          <button
            className="error-toast-clear-all"
            onClick={clearAllToasts}
            title="Clear all notifications"
          >
            Clear All ({toasts.length})
          </button>
        </div>
      )}
      {toasts.map((toast) => (
        <ErrorToast
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
          onRetry={() => handleRetry(toast)}
        />
      ))}
    </div>
  );
};

interface ErrorToastItemProps {
  toast: ToastError;
  onDismiss: () => void;
  onRetry: () => void;
}

const ErrorToast: React.FC<ErrorToastItemProps> = ({
  toast,
  onDismiss,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300); // Wait for exit animation
  };

  const severity = errorHandlingService.getErrorSeverity(toast.error);
  const canRetry = errorHandlingService.canRetry(toast.error);
  const message = errorHandlingService.getUserFriendlyMessage(toast.error);

  const getSeverityClass = () => {
    switch (severity) {
      case "low":
        return "error-toast--info";
      case "medium":
        return "error-toast--warning";
      case "high":
        return "error-toast--error";
      case "critical":
        return "error-toast--critical";
      default:
        return "error-toast--warning";
    }
  };

  const getSeverityIcon = () => {
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
    <div
      className={`
        error-toast 
        ${getSeverityClass()} 
        ${isVisible ? "error-toast--visible" : ""} 
        ${isExiting ? "error-toast--exiting" : ""}
      `}
    >
      <div className="error-toast__content">
        <div className="error-toast__header">
          <span className="error-toast__icon">{getSeverityIcon()}</span>
          <span className="error-toast__message">{message}</span>
          <button
            className="error-toast__close"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {canRetry && (
          <div className="error-toast__actions">
            <button className="error-toast__retry" onClick={onRetry}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
