import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { AppShell } from '../components/layout/AppShell'
import { AuthLayout } from '../layouts/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  })),
)

const ProfilePage = lazy(() =>
  import('../features/user/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  })),
)

const UserAccessControlPage = lazy(() =>
  import('../features/users/pages/UserAccessControlPage').then((module) => ({
    default: module.UserAccessControlPage,
  })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/user" replace />} />
            <Route path="/user" element={<ProfilePage />} />
            <Route element={<RoleRoute permission="users:manage" />}>
              <Route path="/users" element={<UserAccessControlPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </Suspense>
  )
}
