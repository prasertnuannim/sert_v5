import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'
import { LoadingScreen } from '../components/common/LoadingScreen'

export function ProtectedRoute() {
  const { initialized, user, accessToken } = useAppSelector(
    (state) => state.auth,
  )

  if (!initialized) {
    return <LoadingScreen />
  }

  return user && accessToken ? <Outlet /> : <Navigate to="/login" replace />
}
