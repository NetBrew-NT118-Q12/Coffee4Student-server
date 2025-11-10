import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../api/services/dashboardService';

// GET dashboard stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
};

// GET monthly sales
export const useMonthlySales = (year?: number) => {
  return useQuery({
    queryKey: ['dashboard', 'monthly-sales', year],
    queryFn: () => dashboardService.getMonthlySales(year),
  });
};

// GET order status
export const useOrderStatus = () => {
  return useQuery({
    queryKey: ['dashboard', 'order-status'],
    queryFn: () => dashboardService.getOrderStatus(),
  });
};

// GET top products
export const useTopProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'top-products', limit],
    queryFn: () => dashboardService.getTopProducts(limit),
  });
};