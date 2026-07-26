import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import {
  hasPermission,
  type Permission,
} from '../features/auth/access/permissions'

interface RoleRouteProps {
  permission: Permission
}

export function RoleRoute({ permission }: RoleRouteProps) {
  const user = useAppSelector((state) => state.auth.user)

  return hasPermission(user?.role, permission) ? (
    <Outlet />
  ) : (
    <Navigate to="/user" replace />
  )
}
