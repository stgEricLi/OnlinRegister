# ErrorHandlingService

A comprehensive global error handling service that integrates with Redux store and provides centralized error management for the application.

## Features

- **Global Error Handling**: Catches unhandled promise rejections and JavaScript errors
- **Redux Integration**: Automatically dispatches auth-related actions to the store
- **Error Normalization**: Converts different error types to a standardized format
- **Retry Mechanism**: Built-in retry functionality for failed operations
- **Error Queue**: Maintains a queue of recent errors for debugging
- **Context Tracking**: Captures error context including component, action, and user info
- **Notification System**: Shows user-friendly error messages

## Usage

### Basic Error Handling

```typescript
import errorHandlingService from "./services/ErrorHandlingService";

// Handle any error
try {
  await someAsyncOperation();
} catch (error) {
  errorHandlingService.handleError(error, {
    component: "UserProfile",
    action: "fetchUserData",
  });
}
```

### Using with Retry

```typescript
// Automatically retry failed operations
const userData = await errorHandlingService.retryOperation(
  () => httpService.get("/users/123"),
  3, // max retries
  1000 // delay between retries
);
```

### Creating Specific Error Types

```typescript
// Network error
const networkError = errorHandlingService.createNetworkError(
  "Unable to connect to server",
  !navigator.onLine
);

// Validation error
const validationError = errorHandlingService.createValidationError(
  "email",
  "Invalid email format"
);

// Authentication error
const authError = errorHandlingService.createAuthError("Session expired", true);

// Handle the errors
errorHandlingService.handleError(networkError);
```

### React Hook Integration

```typescript
import { useErrorHandler } from "./services/ErrorHandlingService.example";

function MyComponent() {
  const { handleError, clearErrors, getErrors } = useErrorHandler();

  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (error) {
      handleError(error, {
        component: "MyComponent",
        action: "fetchData",
      });
    }
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={clearErrors}>Clear Errors</button>
    </div>
  );
}
```

## Error Types

The service handles the following error types:

### NetworkError

- Connection issues
- Offline status
- Network timeouts

### ValidationError

- Form validation failures
- Input format errors
- Required field errors

### AuthenticationError

- Login failures
- Session expiration
- Unauthorized access

### ServerError

- HTTP 4xx/5xx responses
- API errors
- Server-side failures

### TimeoutError

- Request timeouts
- Operation timeouts

## Integration with Redux

The service automatically integrates with your Redux store:

- **Authentication Errors**: Dispatches `handleUnauthorized` action
- **Token Management**: Clears stored tokens on auth errors
- **Automatic Redirects**: Redirects to login page when needed

## Integration with HttpService

The service is automatically integrated with `httpService.ts`:

- All HTTP errors are automatically handled
- API errors are normalized and processed
- Authentication errors trigger store updates

## Configuration

### Global Error Handlers

The service automatically sets up global error handlers for:

- Unhandled promise rejections
- JavaScript runtime errors
- Authentication events

### Retry Configuration

Default retry settings:

- Max retries: 3
- Retry delay: 1000ms (increases with each attempt)

### Error Queue

- Maximum queue size: 10 errors
- Automatic cleanup of old errors
- Access to recent error history

## Error Context

Each error is captured with context information:

```typescript
interface ErrorContext {
  component?: string; // Component where error occurred
  action?: string; // Action being performed
  userId?: string; // Current user ID
  timestamp: string; // When error occurred
  userAgent: string; // Browser information
  url: string; // Current page URL
}
```

## Logging

- Development: Errors logged to console
- Production: Ready for integration with logging services (Sentry, LogRocket, etc.)

## Best Practices

1. **Always provide context** when handling errors manually
2. **Use retry mechanism** for network-related operations
3. **Clear error queue** periodically to prevent memory leaks
4. **Handle specific error types** differently based on user experience needs
5. **Monitor error patterns** using the error queue for debugging

## Future Enhancements

- Integration with external logging services
- Error analytics and reporting
- User feedback collection on errors
- Offline error queuing and sync
- Error recovery suggestions
