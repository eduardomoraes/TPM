import { apiRequest } from "./queryClient";

export interface AdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  department: string | null;
  phone?: string | null;
  isActive: boolean | null;
  lastLogin: Date | null;
  createdAt: Date | null;
  maskedEmail: string;
}

export interface CreateUserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
}

// Admin API functions
export const adminApi = {
  // Get all users (admin only)
  getUsers: async (): Promise<AdminUser[]> => {
    const res = await apiRequest('GET', '/api/admin/users');
    return await res.json();
  },

  // Get user by ID (admin only)
  getUserById: async (id: string): Promise<AdminUser> => {
    const res = await apiRequest('GET', `/api/admin/users/${id}`);
    return await res.json();
  },

  // Create new user (admin only)
  createUser: async (userData: CreateUserData): Promise<AdminUser> => {
    const res = await apiRequest('POST', '/api/admin/users', userData);
    return await res.json();
  },

  // Update user (admin only)
  updateUser: async (id: string, userData: UpdateUserData): Promise<AdminUser> => {
    const res = await apiRequest('PATCH', `/api/admin/users/${id}`, userData);
    return await res.json();
  },

  // Delete user (admin only)
  deleteUser: async (id: string): Promise<void> => {
    await apiRequest('DELETE', `/api/admin/users/${id}`);
  },
};