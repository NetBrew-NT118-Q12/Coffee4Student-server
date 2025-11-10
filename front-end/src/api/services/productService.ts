import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { Product, CreateProductDTO, UpdateProductDTO, ProductsResponse } from '../../types/product';

export const productService = {
  // GET all products
  getAll: async (params?: { category?: string; page?: number; limit?: number }): Promise<ProductsResponse> => {
    const response = await axiosInstance.get<ProductsResponse>(
      API_ENDPOINTS.PRODUCTS,
      { params }
    );
    return response.data;
  },

  // GET product by ID
  getById: async (id: string): Promise<Product> => {
    const response = await axiosInstance.get<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id)
    );
    return response.data;
  },

  // POST create product
  create: async (data: CreateProductDTO): Promise<Product> => {
    const response = await axiosInstance.post<Product>(
      API_ENDPOINTS.PRODUCTS,
      data
    );
    return response.data;
  },

  // PUT update product
  update: async (id: string, data: UpdateProductDTO): Promise<Product> => {
    const response = await axiosInstance.put<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id),
      data
    );
    return response.data;
  },

  // DELETE product
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCT_BY_ID(id));
  },
};