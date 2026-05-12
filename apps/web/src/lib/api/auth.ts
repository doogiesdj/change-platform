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
