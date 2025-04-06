// api/endpoints/products.ts

import { Product, ProductFilters } from "@/types";
import { apiClient } from "../apiClient";

// Query keys for products
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Fetch products with filters
export const fetchProducts = async (filters: ProductFilters = {}) => {
  const { data } = await apiClient.get("/products", {
    params: {
      page: filters.page || 1,
      limit: filters.limit || 20,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      search: filters.search,
    },
  });

  return data;
};

// Fetch a single product by ID
export const fetchProductById = async (id: string) => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
};

// Create a new product
export const createProduct = async (product: Product): Promise<Product> => {
  const { data } = await apiClient.post<Product>("/products", product);
  return data;
};

// Update an existing product
export const updateProduct = async ({
  id,
  product,
}: {
  id: string;
  product: Partial<Product>;
}): Promise<Product> => {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, product);
  return data;
};

// Delete a product
export const deleteProduct = async (
  id: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.delete<{ message: string }>(
    `/products/${id}`
  );
  return data;
};
