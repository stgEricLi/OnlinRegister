import React from "react";
import { ErrorToastContainer } from "./ErrorToast";
import errorHandlingService from "../../services/ErrorHandlingService";

// Example usage of ErrorToast component
export const ErrorToastExample: React.FC = () => {
  const triggerNetworkError = () => {
    const networkError = errorHandlingService.createNetworkError(
      "Failed to connect to server",
      false
    );
    errorHandlingService.handleError(networkError);
  };

  const triggerAuthError = () => {
    const authError = errorHandlingService.createAuthError(
      "Your session has expired",
      true
    );
    errorHandlingService.handleError(authError);
  };

  const triggerServerError = () => {
    const serverError = errorHandlingService.createServerError(
      "Internal server error occurred",
      500,
      true
    );
    errorHandlingService.handleError(serverError);
  };

  const triggerCriticalError = () => {
    const criticalError = errorHandlingService.createServerError(
      "Critical system failure - immediate attention required",
      500,
      false
    );
    // Manually set severity to critical for demo
    errorHandlingService.handleError(criticalError);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Error Toast Examples</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={triggerNetworkError}>Trigger Network Error</button>
        <button onClick={triggerAuthError}>Trigger Auth Error</button>
        <button onClick={triggerServerError}>Trigger Server Error</button>
        <button onClick={triggerCriticalError}>Trigger Critical Error</button>
      </div>

      {/* Add the ErrorToastContainer to your app root */}
      <ErrorToastContainer
        autoHideDuration={5000}
        maxToasts={5}
        position="top-right"
      />
    </div>
  );
};

// How to integrate in your main App component:
export const AppWithErrorToasts: React.FC = () => {
  return (
    <div className="app">
      {/* Your app content */}
      <main>{/* Your routes and components */}</main>

      {/* Add ErrorToastContainer at the root level */}
      <ErrorToastContainer
        autoHideDuration={6000}
        maxToasts={3}
        position="top-right"
      />
    </div>
  );
};
