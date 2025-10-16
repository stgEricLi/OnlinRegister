import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import RegisterForm from "../components/user/RegisterForm";
import {
  registerUser,
  currAuthState,
  clearError,
} from "../store/slices/authSlice";
import errorHandlingService from "../services/ErrorHandlingService";
import type { RegisterRequest } from "../interfaces/IAuth";

const Signup: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error } = useAppSelector(currAuthState);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle successful registration
  //   useEffect(() => {
  //     if (isAuthenticated) {
  //       console.log("Signup - isAuthenticated:", isAuthenticated);
  //       navigate("/"); // Navigate to home page after successful registration
  //     }
  //   }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    setSubmitError(null);
  }, [dispatch]);

  const handleSubmit = async (formData: RegisterRequest): Promise<void> => {
    try {
      // Clear any previous errors
      setSubmitError(null);
      dispatch(clearError());

      console.log("Signup - dispatching registerUser with:", formData);

      // Dispatch the register action: authSlice.registerUser thunk -> httpService (Error handled here)
      const result = await dispatch(registerUser(formData));

      // Check if registration was rejected
      if (registerUser.rejected.match(result)) {
        const errorMessage = result.payload || "Registration failed";
        setSubmitError(errorMessage);

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
        setSubmitError(error.message);
        errorHandlingService.handleError(error, {
          component: "Signup",
          action: "register",
        });
      } else {
        const fallbackError =
          "An unexpected error occurred during registration";
        setSubmitError(fallbackError);
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
  const displayError = error || submitError || undefined;

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
