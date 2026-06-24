export interface User {
  id: string
  name: string
  email: string
  theme: 'light' | 'dark'
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AccessTokenResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface UpdateThemeRequest {
  theme: 'light' | 'dark'
}

export interface MessageResponse {
  message: string
}
