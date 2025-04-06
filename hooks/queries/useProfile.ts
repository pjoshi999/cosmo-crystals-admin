import { fetchProfile, profileKeys } from "@/api/endpoints/profile";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: () => fetchProfile(),
  });
};
