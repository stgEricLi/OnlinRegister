import { useAppDispatch, useAppSelector } from "../../store/hooks";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import type { LoginRequest } from "../../interfaces/IAuth";
import { currAuthState, loginUser } from "../../store/slices/authSlice";
import { styles as css } from "../login/loginCss";

interface vaildateErr {
  email?: string;
  password?: string;
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Only need these tree properties from Auth state
  // AuthState = { user, token, isAuthenticated, isLoading, error}
  const { isLoading, error, isAuthenticated } = useAppSelector(currAuthState);

  // Manage current login form inputs state
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  // Manage current login form inputs error state
  const [formErrors, setFormErrors] = useState<vaildateErr>({});

  // Handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Login - isAuthenticated:", isAuthenticated);
      navigate("/"); // Navigate to home page after successful login
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user starts typing
    // This tells TypeScript that 'name' is one of the valid keys
    // typeof formErrors - Gets the type of the formErrors object = { email?: string; password?: string }
    if (formErrors[name as keyof typeof formErrors]) {
      // keyof typeof formErrors = "email" | "password"
      // TypeScript now knows name is either 'email' or 'password'
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: vaildateErr = {};

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmition = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      console.info("Login - dispatch: loginUser()");
      // Calling the loginUser Thunk in authSlice
      // calling auth/login API
      // authSlice.extraReducers will handel state updating
      // admin@stg.com, Stg123&%
      await dispatch(loginUser(formData));
    } catch {
      // Error has been handled by Redux state (authSlice)
      console.error("Login failed:", error);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>

            <form
              onSubmit={handleSubmition}
              noValidate
              className="space-y-4 md:space-y-6"
            >
              <div>
                <label className={css.label}>Your email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className={css.input}
                />
                {formErrors.email && (
                  <span className={css.err}>{formErrors.email}</span>
                )}
              </div>
              <div>
                <label className={css.label}>Your password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className={css.input}
                />
                {formErrors.password && (
                  <span className={css.err}>{formErrors.password}</span>
                )}
              </div>
              <button type="submit" disabled={isLoading} className={css.btn}>
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
              {error && <div className={css.err}>{error}</div>}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
