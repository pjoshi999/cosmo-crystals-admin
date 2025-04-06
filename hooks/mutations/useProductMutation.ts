// hooks/mutations/useProductMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  productKeys,
} from "../../api/endpoints/products";
import { Product } from "@/types";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Product) => createProduct(data),
    onSuccess: () => {
      // Invalidate products list to refetch after mutation
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct({ id, product: data }),
    onSuccess: (updatedProduct) => {
      // Invalidate the specific product detail
      queryClient.invalidateQueries({
        queryKey: updatedProduct.id
          ? productKeys.detail(updatedProduct.id)
          : undefined,
      });
      // Also invalidate the list to ensure it shows updated data
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_, deletedId) => {
      // Invalidate product lists after deletion
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      // Also remove the specific product from the cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) });
    },
  });
};
