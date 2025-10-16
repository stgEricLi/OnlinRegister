import React from "react";
import { cn } from "../../styles/tailwindStyles";

interface CardProps {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white p-6 rounded-lg border",
        elevated ? "shadow-lg" : "shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h3 className={cn("text-xl font-semibold text-gray-800 mb-3", className)}>
      {children}
    </h3>
  );
};

interface CardTextProps {
  children: React.ReactNode;
  className?: string;
}

export const CardText: React.FC<CardTextProps> = ({ children, className }) => {
  return <p className={cn("text-gray-600", className)}>{children}</p>;
};

export default Card;
