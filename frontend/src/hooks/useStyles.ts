import { useMemo } from "react";

interface ButtonVariant {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const useButtonStyles = ({
  variant = "primary",
  size = "md",
  disabled = false,
}: ButtonVariant = {}) => {
  return useMemo(() => {
    const baseStyles =
      "font-medium rounded transition-colors focus:outline-none focus:ring-2";

    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary:
        "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    };

    const sizes = {
      sm: "py-1 px-2 text-sm",
      md: "py-2 px-4",
      lg: "py-3 px-6 text-lg",
    };

    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

    return `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles}`.trim();
  }, [variant, size, disabled]);
};

export const useCardStyles = (elevated = false) => {
  return useMemo(() => {
    const baseStyles = "bg-white rounded-lg border";
    const elevationStyles = elevated ? "shadow-lg" : "shadow-md";
    return `${baseStyles} ${elevationStyles} p-6`;
  }, [elevated]);
};
