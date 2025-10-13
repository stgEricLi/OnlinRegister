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

//#region ---- Auth slice ----
//
const authSlice = createSlice({
  name: "auth", // slice name
  initialState, // AuthState Object
  // Define all reduce functions:
  reducers: {
    clearError: (state) => {
      // Update error property in state
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    handleUnauthorized: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please log in again.";
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    // Handle the 3 automatic action types that loginUser Thunk creates
    builder
      .addCase(loginUser.pending, (state) => {
        // Handles when loginUser is dispatched but not resolved yet
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // Handles when loginUser resolves successfully
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        // Handles when loginUser throws an error or rejects
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
        console.error(
          "authSlice: Login Failed- action.payload : %O",
          action.payload
        );
      });
  },
});
//#endregion

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
>("Auth/login", async (credentials, { rejectWithValue }) => {
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

//#region ---- Export Functions and State ----
// Export actions (reducer functions)
// These actions are used in components to dispatch state changes (dispatch(clearError()))
// Functions you call to trigger state changes
export const { clearError, setCredentials, handleUnauthorized } =
  authSlice.actions;

// Export the auth slice from the root Redux state.
// state.auth corresponds to the name: "auth" property defined in the createSlice function
// { auth: AuthState } - This is the TypeScript type definition
// selectAuth actually is the AuthState type
export const currAuthState = (state: { auth: AuthState }) => state.auth;

// Export reducer
// The reducer is used when configuring the Redux store to handle state updates
// The function Redux calls internally to actually update the state
export default authSlice.reducer;
//#endregion
