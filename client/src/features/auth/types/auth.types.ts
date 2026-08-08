import type { User } from '../../user/types/user.types'
import type {
  AuthResponseDto,
  LoginRequestDto,
  ProblemDetails,
  RegisterRequestDto,
} from '@/api/schema'

export type LoginCredentials = LoginRequestDto

export type RegisterPayload = RegisterRequestDto

type GeneratedAuthResponse = AuthResponseDto

export interface AuthResponse
  extends Omit<GeneratedAuthResponse, 'tokenType' | 'user'> {
  tokenType: 'Bearer'
  user: User
}

export type ApiProblem = ProblemDetails & {
  errors?: Record<string, string[]>
}
