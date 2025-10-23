import React from "react";

interface DropMenuProps
  extends Omit<React.InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string; // Required label text
  name: string; // Required input name
  data: any[];
  error?: string; // Optional error message
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Typed onChange handler
  disabled?: boolean; // Loading/disabled state
  required?: boolean; // Required field indicator
  className?: string; // Custom styling override
  labelClassName?: string; // Custom label styling
  errorClassName?: string; // Custom error styling
}

const DropMenu: React.FC<DropMenuProps> = ({
  label,
  name,
  data,
  value,
  error,
  onChange,
  disabled = false,
  required = false,
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
  return (
    <div className="mb-4">
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...rest}
      >
        {data.map((d) => (
          <option key={d.id} value={d.key} selected={d.key === value}>
            {d.value}
          </option>
        ))}
      </select>

      {error && <div className={errorClasses}>{error}</div>}
    </div>
  );
};

export default DropMenu;
