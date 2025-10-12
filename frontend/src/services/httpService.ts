import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiError, ErrorResponseData } from "../interfaces/IHttp";

class HttpService {
  private axiosInstance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  // Get the raw axios instance if needed for advanced usage
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  // Request interceptor
  private setupInterceptors(): void {
    // http requset setup
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Get auth token from local storage
        const token = this.getStoredToken();
        if (token) {
          // add auth token to header
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => {
        return Promise.reject(this.handleError(err));
      }
    ); // End Setup

    // Response interceptor for error handling and token refresh
    this.axiosInstance.interceptors.response.use(
      (resp: AxiosResponse) => {
        return resp;
      },
      async (err: AxiosError) => {
        const originalReq = err.config as AxiosRequestConfig & {
          _retry?: boolean;
        };
        // Handle 401 Unauthorized - token expired or invalid
        if (err.response?.status === 401 && !originalReq._retry) {
          originalReq._retry = true;
          // Clear invalid token
          this.clearStoredToken();

          // Redirect to login or dispatch logout action
          // This will be handled by the auth context/Redux store
          //window.dispatchEvent(new CustomEvent("auth:unauthorized"));

          return Promise.reject(this.handleError(err));
        } // End if 401 Unauthorized
        return Promise.reject(this.handleError(err));
      }
    ); // End Response
  }

  private handleError(err: AxiosError): ApiError {
    const apiErr: ApiError = {
      message: "An unexpected api call error occurred",
      status: err.response?.status,
      data: err.response?.data,
    };

    if (err.response) {
      // Server responded with error status
      const { status, data } = err.response;

      const errorData = data as ErrorResponseData;

      switch (status) {
        case 400:
          apiErr.message = errorData?.message || "Bad request";
          break;
        case 401:
          apiErr.message = errorData?.message || "Unauthorized access";
          break;
        case 403:
          apiErr.message = errorData?.message || "Forbidden access";
          break;
        case 404:
          apiErr.message = errorData?.message || "Resource not found";
          break;
        case 422:
          apiErr.message = errorData?.message || "Validation error";
          break;
        case 500:
          apiErr.message = errorData?.message || "Internal server error";
          break;
        default:
          apiErr.message = errorData?.message || `HTTP Error ${status}`;
      }
    } else if (err.request) {
      // Network error
      apiErr.message = "Network error - please check your connection";
    } else {
      // Request setup error
      apiErr.message = err.message || "Request configuration error";
    }

    // Log error for debugging
    console.error("HTTP Service Error:", {
      message: apiErr.message,
      status: apiErr.status,
      url: err.config?.url,
      method: err.config?.method,
      data: apiErr.data,
    });

    return apiErr;
  }

  //#region ---- Local Storage Token ----
  private getStoredToken(): string | null {
    try {
      return localStorage.getItem("authToken");
    } catch (error) {
      console.error("Error retrieving token from storage:", error);
      return null;
    }
  }

  private clearStoredToken(): void {
    try {
      console.log(
        "httpService: clearStoredToken: remove token from localStorage."
      );
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error clearing token from storage:", error);
    }
  }

  public setAuthToken(token: string): void {
    try {
      console.log("httpService: setAuthToken: write token to localStorage.");
      localStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  }

  public clearAuthToken(): void {
    console.log("httpService: clearAuthToken: remove token from localStorage.");
    this.clearStoredToken();
  }

  //#endregion

  //#region ---- HTTP Methods ----
  // GET METHOD
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.axiosInstance.get<T>(url, config);
    console.log("httpService - GET Response: %O", resp.data);
    return resp.data;
  }

  // POST METHOD
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.axiosInstance.post<T>(url, data, config);
    console.log("httpService - POST Response: %O", resp.data);
    return resp.data;
  }

  // PUT METHOD
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.axiosInstance.put<T>(url, data, config);
    console.log("httpService - PUT Response: %O", resp.data);
    return resp.data;
  }

  // PATCH METHOD
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.axiosInstance.patch<T>(url, data, config);
    console.log("httpService - PATCH Response: %O", resp.data);
    return resp.data;
  }

  // DELETE METHOD
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const resp = await this.axiosInstance.delete<T>(url, config);
    console.log("httpService - DELETE Response: %O", resp.data);
    return resp.data;
  }

  //#endregion
}

// Create and export a singleton instance
const httpService = new HttpService();
export default httpService;
