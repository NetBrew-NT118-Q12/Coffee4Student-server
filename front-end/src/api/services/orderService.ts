import { axiosInstance } from "../axios";
import { API_ENDPOINTS } from "../endpoints";
import type {
  Order,
  OrdersResponse,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
} from "../../types/order";

export const orderService = {
  // GET all orders
  getAll: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    store_id?: number; // Thêm filter theo store
  }): Promise<OrdersResponse> => {
    const response = await axiosInstance.get<OrdersResponse>(
      API_ENDPOINTS.ORDERS,
      { params }
    );
    return response.data;
  },

  // GET order by ID
  getById: async (id: string | number): Promise<Order> => {
    const response = await axiosInstance.get<Order>(
      API_ENDPOINTS.ORDER_BY_ID(id.toString())
    );
    return response.data;
  },

  // POST create order
  create: async (data: CreateOrderDTO): Promise<{ order_id: number }> => {
    // Transform data để match backend format
    const payload = {
      user_id: data.user_id,
      store_id: data.store_id,
      total_price: data.total_price,
      status: data.status || "Pending",
      items: data.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        variant_selection: item.variant_selection || {},
        note: item.note || null,
      })),
    };

    const response = await axiosInstance.post<{ order_id: number }>(
      API_ENDPOINTS.ORDERS,
      payload
    );
    return response.data;
  },

  // PUT update order status
  updateStatus: async (
    id: string | number,
    data: UpdateOrderStatusDTO
  ): Promise<Order> => {
    const response = await axiosInstance.put<Order>(
      API_ENDPOINTS.ORDER_BY_ID(id.toString()),
      data
    );
    return response.data;
  },

  // DELETE order
  delete: async (id: string | number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.ORDER_BY_ID(id.toString()));
  },
};
