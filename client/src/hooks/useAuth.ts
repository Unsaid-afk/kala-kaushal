import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const q = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (res.status === 401) return null; // unauthenticated
      if (!res.ok) throw new Error('Auth fetch failed');
      return res.json();
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 300_000,
  });

  return {
    user: q.data,
    isLoading: q.isFetching && q.data === undefined,
    isAuthenticated: !!q.data,
  };
}
