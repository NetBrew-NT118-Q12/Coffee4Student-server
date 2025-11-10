import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../api/services/orderService';
import type { Order } from '../types/order';

// GET all orders
export const useOrders = (status?: string) => {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => orderService.getAll({ status }),
  });
};

// GET order by ID
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
};

// UPDATE order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};