import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../api/services/productService";
import type { CreateProductDTO, UpdateProductDTO } from "../types/product";

// GET all products hoặc filter theo category_id
export const useProducts = (categoryId?: string | number) => {
  return useQuery({
    queryKey: ["products", categoryId],
    queryFn: () => productService.getAll({ categoryId }),
  });
};

// GET product by ID
export const useProduct = (id: string | number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
};

// CREATE product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDTO) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// UPDATE product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: UpdateProductDTO;
    }) => productService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
};

// DELETE product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
