import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../api/services/dashboardService";
import { handleApiError } from "../utils/apiHelpers";
import type { TopProduct } from "../types/dashboard";

interface UseTopProductsOptions {
  days?: number;
  limit?: number;
}

interface UseTopProductsReturn {
  products: TopProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTopProducts(
  options: UseTopProductsOptions = {}
): UseTopProductsReturn {
  const { days = 30, limit = 5 } = options;
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getTopProducts({ days, limit });
      setProducts(data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error("Top products error:", err);
    } finally {
      setLoading(false);
    }
  }, [days, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
