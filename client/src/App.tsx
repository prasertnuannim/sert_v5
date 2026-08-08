import { useEffect } from 'react'
import { useAppDispatch } from './app/hooks'
import {
  initializeAuth,
  sessionExpired,
  sessionRefreshed,
} from './features/auth/store/authSlice'
import {
  AUTH_SESSION_EXPIRED_EVENT,
  AUTH_SESSION_REFRESHED_EVENT,
} from './lib/axios'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    const handleSessionRefreshed = (event: Event) => {
      const { detail } = event as CustomEvent<{
        accessToken: string
      }>
      dispatch(sessionRefreshed(detail))
    }

    const handleSessionExpired = () => {
      dispatch(sessionExpired())
    }

    window.addEventListener(
      AUTH_SESSION_REFRESHED_EVENT,
      handleSessionRefreshed,
    )
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(
        AUTH_SESSION_REFRESHED_EVENT,
        handleSessionRefreshed,
      )
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      )
    }
  }, [dispatch])

  return <AppRoutes />
}

export default App
