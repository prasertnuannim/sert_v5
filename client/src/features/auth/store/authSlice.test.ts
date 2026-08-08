import { describe, expect, it } from 'vitest'
import authReducer, { loginUser, logoutUser } from './authSlice'
import type { User } from '../../user/types/user.types'

const user: User = {
  id: 'f0dfbd7b-3851-4ec8-a66d-437505712d93',
  email: 'admin@example.com',
  displayName: 'Admin',
  createdAt: '2026-08-08T00:00:00Z',
  role: 'admin',
}

describe('auth reducer', () => {
  it('clears the local session when the logout request fails', () => {
    const loggedIn = authReducer(
      undefined,
      loginUser.fulfilled(
        { accessToken: 'access-token', user },
        'login-request',
        { email: user.email, password: 'Password123!' },
      ),
    )

    const loggedOut = authReducer(
      loggedIn,
      logoutUser.rejected(new Error('offline'), 'logout-request', undefined),
    )

    expect(loggedOut.user).toBeNull()
    expect(loggedOut.accessToken).toBeNull()
    expect(loggedOut.status).toBe('idle')
  })
})
