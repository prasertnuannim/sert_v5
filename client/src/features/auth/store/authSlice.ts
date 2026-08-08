import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { accessTokenStore } from '../../../lib/axios'
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
  user: User
}

interface RefreshedTokens {
  accessToken: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  initialized: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: accessTokenStore.get(),
  status: 'idle',
  initialized: false,
  error: null,
}

const toSession = (response: AuthResponse): StoredSession => ({
  accessToken: response.accessToken,
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
  const accessToken = accessTokenStore.get()

  try {
    if (accessToken) {
      const user = await authApi.me()
      return {
        accessToken: accessTokenStore.get() ?? accessToken,
        user,
      }
    }
  } catch {
    // Access token may have expired; use the refresh token below.
  }

  try {
    const response = await authApi.refresh()
    persistAuth(response)
    return toSession(response)
  } catch (error) {
    accessTokenStore.clear()
    return accessToken ? rejectWithValue(getApiError(error)) : null
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } finally {
    accessTokenStore.clear()
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null
    },
    currentUserUpdated: (state, action: { payload: User }) => {
      if (state.user?.id === action.payload.id) {
        state.user = action.payload
      }
    },
    sessionRefreshed: (state, action: { payload: RefreshedTokens }) => {
      state.accessToken = action.payload.accessToken
    },
    sessionExpired: (state) => {
      state.user = null
      state.accessToken = null
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
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.initialized = true
        state.user = null
        state.accessToken = null
        state.error = action.payload ?? null
      })
      .addCase(logoutUser.fulfilled, clearSession)
      .addCase(logoutUser.rejected, clearSession)
  },
})

function clearSession(state: AuthState) {
  state.user = null
  state.accessToken = null
  state.status = 'idle'
  state.error = null
}

export const {
  clearAuthError,
  currentUserUpdated,
  sessionExpired,
  sessionRefreshed,
} = authSlice.actions
export default authSlice.reducer
