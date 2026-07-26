import { api } from '../../../lib/axios'
import type {
  AccessRole,
  User,
  UserRole,
} from '../../user/types/user.types'

export interface CreateAccountPayload {
  displayName: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateAccountPayload {
  displayName: string
  email: string
  role: UserRole
}

export const usersApi = {
  getUsers: async () => {
    const { data } = await api.get<User[]>('/users')
    return data
  },

  getRoles: async () => {
    const { data } = await api.get<AccessRole[]>('/roles')
    return data
  },

  createAccount: async (payload: CreateAccountPayload) => {
    const { data } = await api.post<User>('/users', payload)
    return data
  },

  updateAccount: async (
    userId: string,
    payload: UpdateAccountPayload,
  ) => {
    const { data } = await api.put<User>(`/users/${userId}`, payload)
    return data
  },

  updateRole: async (userId: string, role: UserRole) => {
    const { data } = await api.patch<User>(`/users/${userId}/role`, {
      role,
    })
    return data
  },

  deleteAccount: async (userId: string) => {
    await api.delete(`/users/${userId}`)
  },
}
