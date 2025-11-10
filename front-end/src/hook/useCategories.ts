import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../api/services/categoryService";

// GET all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });
};

// GET category by ID
export const useCategory = (id: string | number) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
};
