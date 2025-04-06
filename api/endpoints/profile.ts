import { apiClient } from "../apiClient";

export const profileKeys = {
  all: ["profile"] as const,
  lists: () => [...profileKeys.all, "list"] as const,
};

export const fetchProfile = async () => {
  const { data } = await apiClient.get("/profile/");

  return data;
};
