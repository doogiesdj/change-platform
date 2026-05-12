import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login, register, type LoginPayload, type RegisterPayload } from '@/lib/api/auth';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  function saveSession(res: { accessToken: string; id: string; email: string; displayName: string; role: string }) {
    localStorage.setItem('token', res.accessToken);
    document.cookie = `token=${res.accessToken}; path=/; SameSite=Lax`;
    queryClient.setQueryData(['auth', 'me'], {
      id: res.id,
      email: res.email,
      displayName: res.displayName,
      role: res.role,
    });
  }

  return {
    login: (payload: LoginPayload, redirectTo = '/') =>
      loginMutation.mutate(payload, {
        onSuccess: (res) => {
          saveSession(res);
          toast.success('로그인되었습니다.');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(redirectTo as any);
        },
      }),
    register: (payload: RegisterPayload, redirectTo = '/') =>
      registerMutation.mutate(payload, {
        onSuccess: (res) => {
          saveSession(res);
          toast.success('회원가입이 완료되었습니다. 환영합니다!');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(redirectTo as any);
        },
      }),
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error ?? registerMutation.error,
  };
}
