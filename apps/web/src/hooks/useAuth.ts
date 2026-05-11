import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login, register, type LoginPayload, type RegisterPayload } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.accessToken);
      router.push('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.accessToken);
      router.push('/');
    },
  });

  return {
    login: (payload: LoginPayload) => loginMutation.mutate(payload),
    register: (payload: RegisterPayload) => registerMutation.mutate(payload),
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error ?? registerMutation.error,
  };
}
