import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { tokenStorage } from '../../../lib/axios'
import {
  authApi,
  getApiError,
  persistAuth,
} from '../api/authApi'
import type {
  AuthResponse,
  LoginCredentials,
} from '../types/auth.types'
import type { User } from '../../user/types/user.types'

interface StoredSession {
  accessToken: string
  refreshToken: string
  user: User
}

interface RefreshedTokens {
  accessToken: string
  refreshToken: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  initialized: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  status: 'idle',
  initialized: false,
  error: null,
}

const toSession = (response: AuthResponse): StoredSession => ({
  accessToken: response.accessToken,
  refreshToken: response.refreshToken,
  user: response.user,
})

export const loginUser = createAsyncThunk<
  StoredSession,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials)
    persistAuth(response)
    return toSession(response)
  } catch (error) {
    return rejectWithValue(getApiError(error))
  }
})

export const initializeAuth = createAsyncThunk<
  StoredSession | null,
  void,
  { rejectValue: string }
>('auth/initialize', async (_, { rejectWithValue }) => {
  const accessToken = tokenStorage.getAccessToken()
  const refreshToken = tokenStorage.getRefreshToken()

  if (!accessToken && !refreshToken) {
    return null
  }

  try {
    if (accessToken) {
      const user = await authApi.me()
      return {
        accessToken: tokenStorage.getAccessToken() ?? accessToken,
        refreshToken: tokenStorage.getRefreshToken() ?? refreshToken ?? '',
        user,
      }
    }
  } catch {
    // Access token may have expired; use the refresh token below.
  }

  if (!refreshToken) {
    tokenStorage.clear()
    return rejectWithValue('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง')
  }

  try {
    const response = await authApi.refresh(refreshToken)
    persistAuth(response)
    return toSession(response)
  } catch (error) {
    tokenStorage.clear()
    return rejectWithValue(getApiError(error))
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  const refreshToken = tokenStorage.getRefreshToken()

  try {
    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
  } finally {
    tokenStorage.clear()
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    sessionRefreshed: (state, action: { payload: RefreshedTokens }) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    sessionExpired: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.status = 'idle'
      state.initialized = true
      state.error = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.initialized = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'เข้าสู่ระบบไม่สำเร็จ'
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.initialized = true

        if (action.payload) {
          state.user = action.payload.user
          state.accessToken = action.payload.accessToken
          state.refreshToken = action.payload.refreshToken
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initialized = true
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.error = action.payload ?? null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export const { clearAuthError, sessionExpired, sessionRefreshed } =
  authSlice.actions
export default authSlice.reducer
