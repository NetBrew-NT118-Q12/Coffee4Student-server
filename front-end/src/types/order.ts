export interface Order {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrdersResponse {
  data: Order[];
  total: number;
  page?: number;
  limit?: number;
}