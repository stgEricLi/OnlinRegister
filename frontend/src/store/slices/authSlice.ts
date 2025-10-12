import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import httpService from "../../services/httpService";
import type { ApiError } from "../../interfaces/IHttp";
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResult,
  AuthState,
} from "../../interfaces/IAuth";

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("authToken"),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Listen for unauthorized events from httpService
if (typeof window !== "undefined") {
  // Check window.dispatchEvent(new CustomEvent("auth:unauthorized")) in httpService.ts
  // The custom event acts as a bridge between HTTP service and Redux store for handling authentication errors globally.
  window.addEventListener("auth:unauthorized", () => {
    // This will be handled by the store dispatch in the component
    // The event listener is set up here for reference
  });
}

//#region ---- Login THUNK ----
// When you create an async thunk, Redux Toolkit automatically generates 3 action types:
// loginUser.pending - Dispatched when the async function starts
// loginUser.fulfilled - Dispatched when the async function succeeds
// loginUser.rejected - Dispatched when the async function fails
// If successful, Redux dispatches loginUser.fulfilled → Builder handles it: .addCase(loginUser.fulfilled, (state, action) => { state.user = action.payload.user })
export const loginUser = createAsyncThunk<
  AuthResult, // Return type on success (This becomes action.payload when successful)
  LoginRequest, // Input parameter type
  { rejectValue: string } // Rejected value type
>("auth/login", async (credentials, { rejectWithValue }) => {
  // "auth/login", - This is the action type string for Redux.
  // The first parameter contains the login data
  // The second parameter is destructured from Redux Toolkit's thunk API, giving you access to rejectWithValue function
  try {
    console.log("authSlice: Calling httpService POST");
    const data: AuthResult = await httpService.post("/auth/login", credentials);
    console.log("authSlice: loginUser() response: %O", data);

    if (!data.success) {
      return rejectWithValue(data.message || "Login failed");
    }

    // Store token using httpService
    if (data.token) {
      httpService.setAuthToken(data);
    }
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || "Network error occurred");
  }
});
//#endregion
