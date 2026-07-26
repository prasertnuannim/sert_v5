import type { AxiosError } from 'axios'
import { api, tokenStorage } from '../../../lib/axios'
import type {
  ApiProblem,
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
} from '../types/auth.types'
import type { User } from '../../user/types/user.types'

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  me: async () => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return data
  },

  logout: async (refreshToken: string) => {
    await api.post('/auth/logout', { refreshToken })
  },
}

export const persistAuth = (response: AuthResponse) => {
  tokenStorage.setTokens(response.accessToken, response.refreshToken)
}

export const getApiError = (error: unknown) => {
  const axiosError = error as AxiosError<ApiProblem>
  const problem = axiosError.response?.data

  if (problem?.detail) return problem.detail
  if (problem?.title) return problem.title

  const validationMessage = problem?.errors
    ? Object.values(problem.errors).flat()[0]
    : undefined

  return validationMessage ?? 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
}
