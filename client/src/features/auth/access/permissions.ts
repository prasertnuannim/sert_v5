import type { UserRole } from '../../user/types/user.types'

export type Permission =
  | 'devices:read'
  | 'devices:control'
  | 'automation:manage'
  | 'users:manage'

const rolePermissions: Record<UserRole, readonly Permission[]> = {
  viewer: ['devices:read'],
  operator: ['devices:read', 'devices:control'],
  engineer: [
    'devices:read',
    'devices:control',
    'automation:manage',
  ],
  admin: [
    'devices:read',
    'devices:control',
    'automation:manage',
    'users:manage',
  ],
}

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission,
) {
  return role ? rolePermissions[role].includes(permission) : false
}
