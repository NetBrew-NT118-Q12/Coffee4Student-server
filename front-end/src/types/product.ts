export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  stock: number;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page?: number;
  limit?: number;
}
