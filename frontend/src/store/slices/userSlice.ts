import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "../../interfaces/IHttp";
import type { RegisteredUser, UserApiResult } from "../../interfaces/IUser";

import httpService from "../../services/httpService";

export interface UserState {
  users: RegisteredUser[];
  selectedUser: RegisteredUser | null;
  isLoading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  lastFetch: null,
};

//#region ---- Get All Users THUNK ----
export const getAllUsers = createAsyncThunk<
  RegisteredUser[], // ← Return type on success (This becomes action.payload when successful)
  void, // ← Input parameter type
  { rejectValue: string } // ← Rejected value type
>("user/getAll", async (_, { rejectWithValue }) => {
  // The underscore _ on is a parameter placeholder that represents the first argument passed to the async thunk function, but it's intentionally unused.
  // The second parameter is destructuring a specific function from the Redux Toolkit thunk API object.
  // allows you to reject a thunk with a custom error payload instead of the default error structure.
  try {
    console.log("userSlice - Calling httpService to get users");
    const users: RegisteredUser[] = await httpService.get("/users");
    console.log("userSlice - users: %O", users);
    return users; // ← This return value becomes action.payload
  } catch (error) {
    const apiErr = error as ApiError;
    return rejectWithValue(apiErr.message || "Failed to fetch users");
  }
});
//#endregion

//#region ---- Get Single User THUNK ----
export const getSingleUser = createAsyncThunk<
  RegisteredUser, // ← Return type on success (This becomes action.payload when successful)
  number, // ← Input parameter type
  { rejectValue: string } // ← Rejected value type
>("user/singleUser", async (id, { rejectWithValue }) => {
  try {
    console.log(`userSlice - Calling httpService to get a user, id=${id}`);
    const user: RegisteredUser = await httpService.get(`/users/${id}`);
    console.log("userSlice - cussent selected user: %O", user);
    return user; // ← This return value becomes action.payload
  } catch (error) {
    const apiErr = error as ApiError;
    return rejectWithValue(apiErr.message || `Failed to load user: ${id}`);
  }
});
//#endregion

//#region ---- Update User THUNK ----
export const updateUser = createAsyncThunk<
  RegisteredUser, // → Return type on success (This becomes action.payload when successful)
  { id: string; userData: RegisteredUser }, // → Input parameter type
  { rejectValue: string } // → Rejected value type
>("user/updateUser", async ({ id, userData }, { rejectWithValue }) => {
  try {
    console.log(`userSlice - Calling httpService to update a user, id=${id}`);
    console.log("userSlice - Update data:", userData);
    const user: RegisteredUser = await httpService.put(
      `/users/${id}`,
      userData
    );
    console.log("userSlice - update user result: %O", user);
    return user; // ← This return value becomes action.payload
  } catch (error) {
    const apiErr = error as ApiError;
    return rejectWithValue(apiErr.message || `Failed to update user: ${id}`);
  }
});
//#endregion

//#region ---- Signup THUNK ----
export const registerUser = createAsyncThunk<
  UserApiResult, // Return type on success
  RegisteredUser, // Input parameter type
  { rejectValue: string } // Rejected value type
>("Auth/register", async (userData, { rejectWithValue }) => {
  try {
    console.log("⏳ userSlice: Calling httpService POST: api/auth/register");
    // 🌐 Calling API
    const data: UserApiResult = await httpService.post(
      "/auth/register",
      userData
    );
    console.log("✅ authSlice: registerUser() response: %O", data);

    if (!data.success) {
      return rejectWithValue(data.message || "Registration failed");
    }
    return data;
  } catch (error) {
    const apiError = error as ApiError;
    return rejectWithValue(apiError.message || "Network error occurred");
  }
});
//#endregion

//#region ---- UserSlice ----
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.lastFetch = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    resetUserState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      //#region get all user cases
      .addCase(getAllUsers.pending, (state) => {
        console.log("userSlice - load users pending...");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        console.log("userSlice - load users loaded!");
        state.users = action.payload; // check getAllUsers Thunk first type
        state.isLoading = false;
        state.error = null;
        state.lastFetch = Date.now();
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        console.log("userSlice - load users failed.");
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch users";
      })
      //#endregion

      //#region load single cases
      .addCase(getSingleUser.pending, (state) => {
        console.log("userSlice - load a user pending...");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSingleUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getSingleUser.rejected, (state, action) => {
        console.log("userSlice - load a user failed.");
        state.isLoading = false;
        state.error = action.payload || "Failed to load a user";
      })
      //#endregion

      //#region update user cases
      .addCase(updateUser.pending, (state) => {
        console.log("userSlice - update users pending...");
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        // Also update the user in the users array if it exists
        const userIndex = state.users.findIndex(
          (user) => user.id.toString() === action.payload.id.toString()
        );
        if (userIndex !== -1) {
          state.users[userIndex] = action.payload;
        }
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        console.log("userSlice - update user failed.");
        state.isLoading = false;
        state.error = action.payload || "Failed to update user";
      })
      //#endregion

      //#region Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload.user || null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.selectedUser = null;
        state.error = action.payload || "Registration failed";
      });
    //#endregion
  },
});
//#endregion

//#region ---- Export Object ----
// Export reducer
export default userSlice.reducer; // impot to store.ts

// Export actions
export const {
  setError,
  clearError,
  clearUsers,
  setSelectedUser,
  clearSelectedUser,
  resetUserState,
} = userSlice.actions;

// A selector is a function that extracts specific pieces of data from the Redux store state.
// It's a clean way to access nested state properties.
export const allUsers = (state: { user: UserState }) => state.user.users;
export const selectedUser = (state: { user: UserState }) =>
  state.user.selectedUser;
export const getUsersLoading = (state: { user: UserState }) =>
  state.user.isLoading;
export const getUsersError = (state: { user: UserState }) => state.user.error;
export const getUsersLastFetch = (state: { user: UserState }) =>
  state.user.lastFetch;
//#endregion
