import { fetchUsers, userKeys } from "@/api/endpoints/users";
import { useQuery } from "@tanstack/react-query";

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => fetchUsers(),
  });
};
