import { apiClient } from "../apiClient";

export type CategoryFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: CategoryFilters) =>
    [...categoryKeys.lists(), { filters }] as const,
};

export const fetchCategories = async (filters: CategoryFilters = {}) => {
  const { data } = await apiClient.get("/category/", {
    params: {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search,
    },
  });

  return data;
};
