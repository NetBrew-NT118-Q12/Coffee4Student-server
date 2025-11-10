import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../api/services/orderService";
import type { UpdateOrderStatusDTO } from "../types/order";

// GET all orders with filters
export const useOrders = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getAll(params),
  });
};

// GET order by ID
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

// UPDATE order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderStatusDTO }) =>
      orderService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// DELETE order - THÊM FUNCTION NÀY
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
