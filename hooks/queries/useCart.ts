import { cartKeys, fetchCartItems } from "@/api/endpoints/cart";
import { useQuery } from "@tanstack/react-query";

export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.lists(),
    queryFn: () => fetchCartItems(),
  });
};
