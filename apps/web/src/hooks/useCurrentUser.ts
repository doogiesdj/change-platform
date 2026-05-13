'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

function fetchMe() {
  return apiClient.get<CurrentUser>('/auth/me');
}

export function useCurrentUser() {
  const [hasToken, setHasToken] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setHasToken(!!localStorage.getItem('token'));
  }, []);

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    queryClient.clear();
    setHasToken(false);
    toast.success('로그아웃되었습니다.');
    router.push('/');
    router.refresh();
  };

  return {
    user: query.data ?? null,
    isLoading: hasToken && query.isLoading,
    isAuthenticated: !!query.data && !query.isError,
    logout,
  };
}
