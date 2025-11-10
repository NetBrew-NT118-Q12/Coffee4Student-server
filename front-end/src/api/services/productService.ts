import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductsResponse,
} from "../../types/product";

export const productService = {
  // GET all products hoặc filter theo categoryId
  getAll: async (params?: {
    categoryId?: string | number;
    page?: number;
    limit?: number;
  }): Promise<Product[]> => {
    let endpoint: string;

    // Nếu có categoryId, dùng endpoint: /products/category/:category_id
    if (params?.categoryId) {
      endpoint = `/products/category/${params.categoryId}`;
    } else {
      endpoint = API_ENDPOINTS.PRODUCTS;
    }

    console.log("Calling API:", endpoint); // Debug log

    const response = await axiosInstance.get<Product[]>(endpoint);
    return response.data;
  },

  // GET product by ID
  getById: async (id: string | number): Promise<Product> => {
    const response = await axiosInstance.get<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id.toString())
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
  update: async (
    id: string | number,
    data: UpdateProductDTO
  ): Promise<Product> => {
    const response = await axiosInstance.put<Product>(
      API_ENDPOINTS.PRODUCT_BY_ID(id.toString()),
      data
    );
    return response.data;
  },

  // DELETE product
  delete: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCT_BY_ID(id.toString()));
  },
};
