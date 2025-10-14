# ErrorToast Component

A comprehensive toast notification system that integrates seamlessly with the ErrorHandlingService to display user-friendly error messages.

## Features

- **Automatic Error Display**: Listens to the ErrorHandlingService and automatically shows relevant errors
- **Smart Filtering**: Only shows medium, high, and critical severity errors (skips low severity and validation errors)
- **Severity-Based Styling**: Different colors and animations based on error severity
- **Auto-Hide with Smart Timing**: Critical errors stay longer than regular errors
- **Retry Functionality**: Shows retry button for retryable errors
- **Responsive Design**: Adapts to mobile screens
- **Multiple Positions**: Supports 6 different positioning options
- **Clear All**: Bulk dismiss functionality when multiple toasts are shown
- **Smooth Animations**: Entrance and exit animations

## Usage

### Basic Setup

Add the ErrorToastContainer to your app root:

```tsx
import { ErrorToastContainer } from "./components/error/ErrorToast";

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      <main>{/* Your routes and components */}</main>

      {/* Add at the root level */}
      <ErrorToastContainer />
    </div>
  );
}
```

### With Custom Configuration

```tsx
<ErrorToastContainer
  autoHideDuration={6000} // 6 seconds (critical errors stay 12 seconds)
  maxToasts={5} // Maximum 5 toasts at once
  position="top-right" // Position on screen
/>
```

### Triggering Toasts

Toasts are automatically triggered when errors are handled by the ErrorHandlingService:

```tsx
import errorHandlingService from "./services/ErrorHandlingService";

// These will automatically show as toasts
const handleApiError = async () => {
  try {
    await api.fetchData();
  } catch (error) {
    // This will trigger a toast
    errorHandlingService.handleError(error);
  }
};

// Manual error creation
const showNetworkError = () => {
  const error = errorHandlingService.createNetworkError(
    "Connection failed",
    !navigator.onLine
  );
  errorHandlingService.handleError(error);
};
```

## Props

### ErrorToastContainer Props

| Prop               | Type     | Default       | Description                                        |
| ------------------ | -------- | ------------- | -------------------------------------------------- |
| `autoHideDuration` | `number` | `5000`        | Auto-hide delay in milliseconds (0 = no auto-hide) |
| `maxToasts`        | `number` | `3`           | Maximum number of toasts to show simultaneously    |
| `position`         | `string` | `'top-right'` | Toast position on screen                           |

### Position Options

- `'top-right'` - Top right corner
- `'top-left'` - Top left corner
- `'bottom-right'` - Bottom right corner
- `'bottom-left'` - Bottom left corner
- `'top-center'` - Top center
- `'bottom-center'` - Bottom center

## Error Filtering

The toast system intelligently filters which errors to display:

### Shown as Toasts:

- **Network errors** - Connection issues, offline status
- **Authentication errors** - Session expired, unauthorized
- **Server errors** - API failures, server issues
- **Timeout errors** - Request timeouts

### Not Shown as Toasts:

- **Validation errors** - Form validation (handled by form components)
- **Low severity errors** - Minor issues that don't need user attention

## Severity Levels and Styling

| Severity   | Color    | Auto-Hide Time | Animation |
| ---------- | -------- | -------------- | --------- |
| `medium`   | Orange   | Normal         | Standard  |
| `high`     | Red      | Normal         | Standard  |
| `critical` | Dark Red | 2x Duration    | Pulsing   |

## Retry Functionality

Toasts automatically show a "Try Again" button for retryable errors:

- Network errors (when online)
- Server errors marked as retryable
- Timeout errors

### Listening for Retry Events

Components can listen for retry events:

```tsx
useEffect(() => {
  const handleRetry = (event: CustomEvent) => {
    const { error } = event.detail;
    console.log("User requested retry for:", error);
    // Implement your retry logic
  };

  window.addEventListener("error-retry", handleRetry);
  return () => window.removeEventListener("error-retry", handleRetry);
}, []);
```

## Styling

The component includes comprehensive CSS with:

- Smooth animations
- Responsive design
- Accessibility support
- Customizable severity colors
- Mobile-friendly layout

### CSS Classes

- `.error-toast-container` - Main container
- `.error-toast` - Individual toast
- `.error-toast--info` - Info severity
- `.error-toast--warning` - Warning severity
- `.error-toast--error` - Error severity
- `.error-toast--critical` - Critical severity

## Integration with ErrorHandlingService

The ErrorToast automatically integrates with ErrorHandlingService:

1. **Listens for errors** via `addErrorListener()`
2. **Gets error severity** via `getErrorSeverity()`
3. **Checks retry capability** via `canRetry()`
4. **Gets user message** via `getUserFriendlyMessage()`

## Mobile Responsiveness

On mobile devices (< 480px):

- Toasts span full width with margins
- Animations change from horizontal to vertical
- Touch-friendly button sizes
- Optimized spacing

## Accessibility

- ARIA labels for dismiss buttons
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus management

## Best Practices

1. **Place at app root** - Ensure toasts appear above all content
2. **Limit toast count** - Don't overwhelm users (max 3-5)
3. **Appropriate timing** - Critical errors need more time
4. **Clear messaging** - Use getUserFriendlyMessage() for user-facing text
5. **Test on mobile** - Ensure good mobile experience

## Advanced Usage

### Custom Error Handling

```tsx
// Create custom error types
const customError = {
  type: "server" as const,
  message: "Custom error message",
  statusCode: 500,
  canRetry: true,
};

errorHandlingService.handleError(customError);
```

### Programmatic Control

```tsx
// Clear all toasts programmatically
const clearAllToasts = () => {
  // Toasts will clear automatically when component unmounts
  // or you can implement custom clearing logic
};
```

This toast system provides a robust, user-friendly way to display errors while maintaining a clean and professional interface.
