import { apiClient } from "../apiClient";

export const cartKeys = {
  all: ["cart"] as const,
  lists: () => [...cartKeys.all, "list"] as const,
};

export const fetchCartItems = async () => {
  const { data } = await apiClient.get("/cart/");

  return data;
};
