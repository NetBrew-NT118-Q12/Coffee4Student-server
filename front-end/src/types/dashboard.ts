export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  image?: string;
}