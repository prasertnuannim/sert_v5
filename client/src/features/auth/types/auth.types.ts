import type { User } from '../../user/types/user.types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends LoginCredentials {
  displayName: string
}

export interface AuthResponse {
  tokenType: 'Bearer'
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
  user: User
}

export interface ApiProblem {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}
