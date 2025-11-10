export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
  page?: number;
  limit?: number;
}