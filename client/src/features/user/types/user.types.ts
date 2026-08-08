import type { RoleResponseDto, UserResponseDto } from '@/api/schema'

export type UserRole = 'viewer' | 'operator' | 'engineer' | 'admin'
export type UserStatus = 'active' | 'inactive'

type GeneratedRole = RoleResponseDto
type GeneratedUser = UserResponseDto

export interface AccessRole extends Omit<GeneratedRole, 'name' | 'level'> {
  name: UserRole
  level: number
}

export interface User extends Omit<GeneratedUser, 'role'> {
  role: UserRole
  status?: UserStatus
}
