import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// from export default userSlice.reducer; at In userSlice.ts
// Importing the default export and giving it the name userReducer. This is just an alias - you could name it anything you want.
//import userReducer from "./slices/userSlice";

// Create the Redux store with Redux Toolkit
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  // Middleware: Provides helpful development warnings and debugging tools
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Serializable Check: Helps catch common Redux mistakes (like storing functions or dates in state)
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  // Vite's way of accessing environment variables.
  // This is the proper way to check the environment in a Vite-based React application.
  // DevTools: Essential for debugging Redux state changes during development
  devTools: import.meta.env.MODE !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
