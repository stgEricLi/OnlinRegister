import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import RegisterForm from "../../components/user/RegisterForm";
// import {
//   registerUser,
//   currAuthState,
//   clearError,
// } from "../../store/slices/authSlice";
import errorHandlingService from "../../services/ErrorHandlingService";
//import type { RegisterRequest } from "../interfaces/IAuth";
import type { RegisteredUser } from "../../interfaces/IUser";

import {
  getSingleUser,
  selectedUser,
  getUsersLoading,
  getUsersError,
  allUsers,
  setError,
  registerUser,
  clearError,
  updateUser,
} from "../../store/slices/userSlice";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Get error message from store
  const error = useAppSelector(getUsersError);
  const isLoading = useAppSelector(getUsersLoading);

  //const { isAuthenticated, error } = useAppSelector(currAuthState);
  //const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle successful registration
  //   useEffect(() => {
  //     if (isAuthenticated) {
  //       console.log("Signup - isAuthenticated:", isAuthenticated);
  //       navigate("/"); // Navigate to home page after successful registration
  //     }
  //   }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  // useEffect(() => {
  //   dispatch(clearError());
  //   setSubmitError(null);
  // }, [dispatch]);

  const handleSubmit = async (formData: RegisteredUser): Promise<void> => {
    try {
      // Clear any previous errors
      dispatch(clearError());

      console.log("🚀 Signup - dispatching registerUser with:", formData);

      // 🌐 Calling userSlice.registerUser Thunk → httpService.post("/auth/register", userData)
      const result = await dispatch(registerUser(formData));

      // Check if registration was rejected
      if (registerUser.rejected.match(result)) {
        const errorMessage = result.payload || "Registration failed";
        // Update Error Message in Store
        dispatch(setError(errorMessage));

        // Handle error with ErrorHandlingService
        errorHandlingService.handleError(errorMessage, {
          component: "Signup",
          action: "register",
        });

        throw new Error(errorMessage);
      }

      console.log("Signup - Registration successful");

      // Navigate to home page after successful registration
      navigate("/");
    } catch (error) {
      console.error("Signup - Registration error:", error);

      // Handle different types of errors
      if (error instanceof Error) {
        dispatch(setError(error.message)); // Update Error Message in Store
        errorHandlingService.handleError(error, {
          component: "Signup",
          action: "register",
        });
      } else {
        const fallbackError =
          "An unexpected error occurred during registration";
        dispatch(setError(fallbackError)); // Update Error Message in Store
        errorHandlingService.handleError(fallbackError, {
          component: "Signup",
          action: "register",
        });
      }
      // Re-throw to let RegisterForm know submission failed
      throw error;
    }
  };

  // Use error from Redux state or local submit error
  const displayError = error || undefined;

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <RegisterForm
              onSubmit={handleSubmit}
              error={displayError}
              showRole={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
