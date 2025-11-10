export interface Product {
  product_id: number;
  category_id: number;
  name: string;
  description?: string;
  old_price?: number;
  price: number;
  is_active: boolean;
  image_url?: string;
  is_new?: boolean;
}

export interface CreateProductDTO {
  category_id: number;
  name: string;
  description?: string;
  old_price?: number;
  price: number;
  is_active?: boolean;
  image_url?: string;
  is_new?: boolean;
}

export interface UpdateProductDTO {
  category_id?: number;
  name?: string;
  description?: string;
  old_price?: number;
  price?: number;
  is_active?: boolean;
  image_url?: string;
  is_new?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}
