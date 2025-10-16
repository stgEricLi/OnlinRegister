import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string; // Required label text
  name: string; // Required input name
  type?: "email" | "text" | "password"; // Input type with sensible defaults
  value: string; // Required controlled input value
  error?: string; // Optional error message
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Typed onChange handler
  disabled?: boolean; // Loading/disabled state
  required?: boolean; // Required field indicator
  placeholder?: string; // Custom placeholder
  autoComplete?: string; // Accessibility support
  className?: string; // Custom styling override
  labelClassName?: string; // Custom label styling
  errorClassName?: string; // Custom error styling
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  error,
  onChange,
  disabled = false,
  required = false,
  placeholder,
  autoComplete,
  className = "",
  labelClassName = "",
  errorClassName = "",
  ...rest
}) => {
  // Default Tailwind classes (matching loginCss.ts)
  const defaultInputClasses =
    "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  const defaultLabelClasses =
    "block mb-2 text-sm font-medium text-gray-900 dark:text-white";
  const defaultErrorClasses = "text-red-500 text-sm mt-1";

  // Combine default classes with custom classes
  const inputClasses = className || defaultInputClasses;
  const labelClasses = labelClassName || defaultLabelClasses;
  const errorClasses = errorClassName || defaultErrorClasses;

  // Generate placeholder if not provided
  const inputPlaceholder = placeholder || `Enter your ${label.toLowerCase()}`;

  return (
    <div className="mb-4">
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={inputPlaceholder}
        autoComplete={autoComplete}
        className={inputClasses}
        {...rest}
      />
      {error && <span className={errorClasses}>{error}</span>}
    </div>
  );
};

export default Input;
