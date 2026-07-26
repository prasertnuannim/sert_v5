import { useEffect } from 'react'
import { useAppDispatch } from './app/hooks'
import { useAppSelector } from './app/hooks'
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
import {
  clearCurrentUser,
  setCurrentUser,
} from './features/user/store/userSlice'
import { resetUsers } from './features/users/store/usersSlice'

function App() {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    void dispatch(initializeAuth())
  }, [dispatch])

  useEffect(() => {
    const handleSessionRefreshed = (event: Event) => {
      const { detail } = event as CustomEvent<{
        accessToken: string
        refreshToken: string
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

  useEffect(() => {
    if (currentUser) {
      dispatch(setCurrentUser(currentUser))
    } else {
      dispatch(clearCurrentUser())
      dispatch(resetUsers())
    }
  }, [currentUser, dispatch])

  return <AppRoutes />
}

export default App
