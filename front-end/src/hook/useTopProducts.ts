import { useQuery } from "@tanstack/react-query";
import { topProductService } from "../api/services/topProductService"

export const useTopProducts = (limit: 5) => {
  return useQuery({
    queryKey: ["topProducts", limit],
    queryFn: () => topProductService.getTopProducts(limit),
    staleTime: 1000 * 60 * 3,
  });
};
