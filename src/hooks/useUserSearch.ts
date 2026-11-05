import { useRemoteSearch } from "@/hooks/useRemoteSearch";
import { USER_SEARCH_MIN_LENGTH, type UserSearchItem } from "@/types/user-search";

/** Cari data dashboard siswa lewat /api/user/search. */
export function useUserSearch(query: string, enabled: boolean) {
  return useRemoteSearch<UserSearchItem>({
    endpoint: "/api/user/search",
    query,
    enabled,
    minLength: USER_SEARCH_MIN_LENGTH,
  });
}
