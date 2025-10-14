// Example usage of ErrorHandlingService

import errorHandlingService from "./ErrorHandlingService";
import httpService from "./httpService";

// Example 1: Basic error handling
export const handleApiError = (error: any) => {
  errorHandlingService.handleError(error, {
    component: "UserProfile",
    action: "fetchUserData",
  });
};

// Example 2: Using with async operations and retry
export const fetchUserDataWithRetry = async (userId: string) => {
  try {
    return await errorHandlingService.retryOperation(
      () => httpService.get(`/users/${userId}`),
      3, // max retries
      1000 // delay between retries
    );
  } catch (error) {
    // Error is already handled by the service
    throw error;
  }
};

// Example 3: Manual error creation
export const handleFormValidation = (field: string, message: string) => {
  const validationError = errorHandlingService.createValidationError(
    field,
    message
  );
  errorHandlingService.handleError(validationError);
};

// Example 4: Network error handling
export const handleNetworkIssue = () => {
  const networkError = errorHandlingService.createNetworkError(
    "Unable to connect to server",
    !navigator.onLine
  );
  errorHandlingService.handleError(networkError);
};

// Example 5: Integration with React components
export const useErrorHandler = () => {
  const handleError = (error: any, context?: any) => {
    errorHandlingService.handleError(error, context);
  };

  const clearErrors = () => {
    errorHandlingService.clearErrorQueue();
  };

  const getErrors = () => {
    return errorHandlingService.getErrorQueue();
  };

  return { handleError, clearErrors, getErrors };
};
