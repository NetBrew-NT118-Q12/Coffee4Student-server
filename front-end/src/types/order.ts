export interface Order {
  order_id: number;
  user_id: number;
  store_id: number;
  total_price: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    user_id: number;
    username: string;
    email?: string;
    full_name?: string;
    avatar?: string;
  };
  store?: {
    store_id: number;
    name: string;
    address?: string;
  };
  order_items?: OrderItem[];
}

export interface OrderItem {
  orderitem_id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  variant_selection?: Record<string, any> | string;
  note?: string | null;
  // Relations
  product?: {
    product_id: number;
    name: string;
    image_url?: string;
    category_id: number;
  };
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page?: number;
  limit?: number;
}

export interface CreateOrderDTO {
  user_id: number;
  store_id: number;
  total_price: number;
  status?: "Pending" | "Processing" | "Completed" | "Cancelled"; // ← Backend có field này
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    variant_selection?: Record<string, any>;
    note?: string;
  }[];
}

export interface UpdateOrderStatusDTO {
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
}

export const parseVariantSelection = (
  variant: string | Record<string, any> | undefined
): Record<string, any> | null => {
  if (!variant) return null;
  if (typeof variant === "string") {
    try {
      return JSON.parse(variant);
    } catch {
      return null;
    }
  }
  return variant;
};
