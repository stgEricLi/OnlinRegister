import React, { useState } from "react";
import type { RegisterRequest } from "../../interfaces/IAuth";

import Input from "../ui/Input";
import Button from "../ui/Button";
interface RegisterFormProp {
  onSubmit: (data: RegisterRequest) => Promise<void>;
  error?: string;
  showRole?: boolean;
}

interface FormErrors {
  username?: string;
  password?: string;
  email?: string;
}

const RegisterForm: React.FC<RegisterFormProp> = ({
  onSubmit,
  error,
  showRole,
}) => {
  // Form Data state
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });

  // Manage current login form inputs error state
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Manage loading state internally
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle role field conversion to number
    const fieldValue = name === "role" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear field-specific error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    const err: FormErrors = {};

    // validate user name
    if (formData.userName.trim().length === 0) {
      err.username = "Username is required";
    } else if (/[<>%@^&]/.test(formData.userName)) {
      err.username = "Username cannot contain special characters: < > % @ ^ &";
    }

    // validate email
    if (formData.email.trim().length === 0) {
      err.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      err.email = "Please enter a valid email address";
    }

    // validate password
    if (formData.password.trim().length === 0) {
      err.password = "Password is required";
    } else if (formData.password.length < 6) {
      err.password = "Password must be at least 6 characters long";
    }

    // validate confirm password
    if (
      !showRole &&
      formData.password.trim() !== formData.confirmPassword.trim()
    ) {
      err.password = "Passwords do not match";
    }

    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Form before submitting
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Form submitted:", formData);
      await onSubmit(formData);
    } catch {
      // Error handling is managed by parent component
      console.error("Registration submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded border-neutral-500 px-12 py-12">
      <h1 className="text-blue-500 text-lg font-bold mb-6">Sign Up Form</h1>
      <form onSubmit={handleSubmit}>
        <Input
          label="Username"
          name="userName"
          type="text"
          value={formData.userName}
          onChange={handleChange}
          error={formErrors.username}
          disabled={isLoading}
          required
          placeholder="Enter your username"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          disabled={isLoading}
          required
          autoComplete="email"
          placeholder="Enter your email address"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          disabled={isLoading}
          required
          placeholder="Enter your passwrod"
        />

        {!showRole && (
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
            placeholder="Enter your passwrod again"
          />
        )}

        {showRole && (
          <div>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              required
            >
              <option value="User">User</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {showRole
            ? isLoading
              ? "Submitting..."
              : "Submit"
            : isLoading
            ? "Signing Up..."
            : "Sign Up"}
        </Button>
        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
