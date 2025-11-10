import { useQuery } from '@tanstack/react-query';
import { userService } from '../api/services/userService';

// GET all users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });
};

// GET user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
};