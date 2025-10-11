import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Get posts
  getPosts: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>("/posts");
    return response.data;
  },

  // Create user
  createUser: async (userData: Omit<User, "id">): Promise<User> => {
    const response = await api.post<User>("/users", userData);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
