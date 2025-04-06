import {
  CategoryFilters,
  categoryKeys,
  fetchCategories,
} from "@/api/endpoints/category";
import { useQuery } from "@tanstack/react-query";

export const useCategory = (filters: CategoryFilters = {}) => {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => fetchCategories(filters),
  });
};
