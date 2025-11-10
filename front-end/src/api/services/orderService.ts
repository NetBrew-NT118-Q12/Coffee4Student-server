import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { Order, OrdersResponse } from '../../types/order';

export const orderService = {
  // GET all orders
  getAll: async (params?: { status?: string; page?: number; limit?: number }): Promise<OrdersResponse> => {
    const response = await axiosInstance.get<OrdersResponse>(
      API_ENDPOINTS.ORDERS,
      { params }
    );
    return response.data;
  },

  // GET order by ID
  getById: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get<Order>(
      API_ENDPOINTS.ORDER_BY_ID(id)
    );
    return response.data;
  },

  // PUT update order status
  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await axiosInstance.put<Order>(
      API_ENDPOINTS.ORDER_BY_ID(id),
      { status }
    );
    return response.data;
  },
};