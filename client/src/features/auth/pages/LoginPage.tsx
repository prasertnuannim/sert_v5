import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const { initialized, user } = useAppSelector((state) => state.auth)

  if (initialized && user) {
    return <Navigate to="/user" replace />
  }

  return <LoginForm />
}
