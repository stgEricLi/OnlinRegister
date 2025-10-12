// Types for error handling
interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Type for error response data
interface ErrorResponseData {
  message?: string;
  [key: string]: any;
}

export type { ApiError, ErrorResponseData };
