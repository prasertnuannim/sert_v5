export type UserRole = 'viewer' | 'operator' | 'engineer' | 'admin'
export type UserStatus = 'active' | 'inactive'

export interface AccessRole {
  name: UserRole
  displayName: string
  description: string
  level: number
}

export interface User {
  id: string
  email: string
  displayName: string
  createdAt: string
  role: UserRole
  status?: UserStatus
}
