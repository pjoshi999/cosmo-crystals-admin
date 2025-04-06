import { apiClient } from "../apiClient";

export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
};

export const fetchUsers = async () => {
  const { data } = await apiClient.get("/users/");

  return data;
};
