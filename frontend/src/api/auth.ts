import apiClient from './client';

export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  nickname: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  signUp: (body: SignUpRequest) =>
    apiClient.post<ApiResponse<null>>('/api/auth/signup', body),

  login: (body: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/api/auth/login', body),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/api/auth/logout'),
};
