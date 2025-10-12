// Authentication-related TypeScript type definitions

// This is a runtime constant object that provides named access to role values.
// Runtime comparisons: if (user.role === UserRole.Admin)
// Setting values: newUser.role = UserRole.Manager
// Readable code: Instead of magic numbers like role === 2
export const UserRole = {
  User: 0,
  Manager: 1,
  Admin: 2,
} as const;

// This is a compile-time type that represents the union type 0 | 1 | 2.
// TypeScript type checking: role: UserRole in interfaces
// Function parameters: function checkPermission(role: UserRole)
// Ensuring type safety: Prevents assigning invalid values like role = 5
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthResult {
  success: boolean;
  token: string;
  user: User | null;
  message: string;
}

// Additional auth-related types for frontend state management
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  userId: number;
  userName: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
}
