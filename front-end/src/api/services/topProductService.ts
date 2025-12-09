import axiosInstance from "../axios";
import { API_ENDPOINTS } from "../endpoints";

interface TopProductsResponse {
  success: boolean,
  count: number,
  days: number,
  products: Array<{
    product_id: string | number;
    name: string;
    price: string | number;
    total_sold: string | number;
  }>;
}

export interface TopProduct {
  product_id: string;
  name: string;
  price: number;
  total_sold: number;
  revenue: number;
}

export const topProductService = {
  async getTopProducts(limit: 5): Promise<TopProduct[]> {
    const response = await axiosInstance.get<TopProductsResponse>(
      API_ENDPOINTS.POPULAR_PRODUCTS,
      {
        params: { limit },
      }
    );
    return response.data.products.map((item) => ({
      product_id: String(item.product_id),
      name: item.name ?? "Unnamed product",
      price: Number(item.price) || 0,
      total_sold: Number(item.total_sold) || 0,
      revenue: Number(item.price || 0) * Number(item.total_sold || 0),
    }));
  },
};
