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

export interface AuthResponse {
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      displayName: string;
      role: string;
    };
  };
}

export function login(payload: LoginPayload) {
  return apiClient.post<AuthResponse>('/auth/login', payload);
}

export function register(payload: RegisterPayload) {
  return apiClient.post<AuthResponse>('/auth/register', payload);
}
