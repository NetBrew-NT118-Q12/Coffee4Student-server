import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { User, UsersResponse } from '../../types/user';

export const userService = {
  // GET all users
  getAll: async (params?: { page?: number; limit?: number }): Promise<UsersResponse> => {
    const response = await axiosInstance.get<UsersResponse>(
      API_ENDPOINTS.USERS,
      { params }
    );
    return response.data;
  },

  // GET user by ID
  getById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(
      API_ENDPOINTS.USER_BY_ID(id)
    );
    return response.data;
  },
};