export interface RegisteredUser {
  id: number;
  username: string;
  email: string;
  role: string;
  password?: string;
  confirmPassword?: string;
}

export interface UserApiResult {
  success: boolean;
  token: string;
  user?: RegisteredUser | null;
  message: string;
}
