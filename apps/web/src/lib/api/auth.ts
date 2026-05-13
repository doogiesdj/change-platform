import { apiClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthData {
  accessToken: string;
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export function login(payload: LoginPayload) {
  return apiClient.post<AuthData>('/auth/login', payload);
}

export function register(payload: RegisterPayload) {
  return apiClient.post<AuthData>('/auth/register', payload);
}

export function forgotPassword(email: string) {
  return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, newPassword: string) {
  return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiClient.patch<{ message: string }>('/users/me/password', { currentPassword, newPassword });
}

export function deleteAccount() {
  return apiClient.delete<{ message: string }>('/users/me');
}
