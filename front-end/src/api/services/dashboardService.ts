import { axiosInstance } from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { DashboardStats, MonthlySales, OrderStatusData, TopProduct } from '../../types/dashboard';

export const dashboardService = {
  // GET dashboard stats
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<DashboardStats>(
      API_ENDPOINTS.DASHBOARD_STATS
    );
    return response.data;
  },

  // GET monthly sales
  getMonthlySales: async (year?: number): Promise<MonthlySales[]> => {
    const response = await axiosInstance.get<MonthlySales[]>(
      `${API_ENDPOINTS.DASHBOARD_STATS}/monthly-sales`,
      { params: { year } }
    );
    return response.data;
  },

  // GET order status distribution
  getOrderStatus: async (): Promise<OrderStatusData[]> => {
    const response = await axiosInstance.get<OrderStatusData[]>(
      `${API_ENDPOINTS.DASHBOARD_STATS}/order-status`
    );
    return response.data;
  },

  // GET top selling products
  getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
    const response = await axiosInstance.get<TopProduct[]>(
      `${API_ENDPOINTS.DASHBOARD_STATS}/top-products`,
      { params: { limit } }
    );
    return response.data;
  },
};