import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export const authService = {
    /* Login with email/phone*/
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.user.token) {
        localStorage.setItem("token", response.data.user.token);
      }
    }
    return response.data;
  },

  /* Login with phone number */
  loginWithPhone: async (phone: string, password: string) => {
    const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
      phone,
      password,
    });
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.user.token) {
        localStorage.setItem("token", response.data.user.token);
      }
    }
    return response.data;
  },

  /* Sign Up */
  signup: async (
    email: string,
    phone: string,
    full_name: string,
    password: string
  ) => {
    const response = await axiosInstance.post(API_ENDPOINTS.SIGNUP, {
      email,
      phone,
      full_name,
      password,
    });
    return response.data;
  },

  /* Logout */
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },

  /* Get token from localStorage */
  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  /* Get user infor from localStorage */
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /* Check if user login */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("user");
  },
};
