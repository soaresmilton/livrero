import { api } from '@/services/api'
import type {
  AccessTokenResponse,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  UpdateThemeRequest,
  User,
} from '../types/auth.types'

export const authService = {
  register: (data: RegisterRequest) =>
    api.post<User>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),

  refresh: () =>
    api.post<AccessTokenResponse>('/auth/refresh').then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateTheme: (data: UpdateThemeRequest) =>
    api.patch<User>('/auth/me/theme', data).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<MessageResponse>('/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<MessageResponse>('/auth/reset-password', data).then((r) => r.data),
}
