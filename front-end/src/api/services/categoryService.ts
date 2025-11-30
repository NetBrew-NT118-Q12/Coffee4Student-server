import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface Category {
  category_id: number;
  name: string;
  description?: string;
}

export const categoryService = {
  // GET all categories
  getAll: async (): Promise<Category[]> => {
    const response = await axiosInstance.get<Category[]>(
      API_ENDPOINTS.CATEGORIES
    );
    return response.data;
  },

  // GET category by ID
  getById: async (id: string | number): Promise<Category> => {
    const response = await axiosInstance.get<Category>(
      `${API_ENDPOINTS.CATEGORIES}/${id}`
    );
    return response.data;
  },
};
