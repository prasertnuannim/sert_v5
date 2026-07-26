import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const ACCESS_TOKEN_KEY = 'phran.accessToken'
const REFRESH_TOKEN_KEY = 'phran.refreshToken'
const LEGACY_ACCESS_TOKEN_KEY = 'sert.accessToken'
const LEGACY_REFRESH_TOKEN_KEY = 'sert.refreshToken'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5178/api'

export const AUTH_SESSION_REFRESHED_EVENT = 'auth:session-refreshed'
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired'

interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const tokenStorage = {
  getAccessToken: () =>
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY),
  getRefreshToken: () =>
    localStorage.getItem(REFRESH_TOKEN_KEY) ??
    localStorage.getItem(LEGACY_REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
    localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY)
  },
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

let refreshPromise: Promise<RefreshResponse> | null = null

const refreshSession = (refreshToken: string) => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>('/auth/refresh', { refreshToken })
      .then(({ data }) => {
        tokenStorage.setTokens(data.accessToken, data.refreshToken)
        window.dispatchEvent(
          new CustomEvent(AUTH_SESSION_REFRESHED_EVENT, { detail: data }),
        )
        return data
      })
      .catch((error: unknown) => {
        tokenStorage.clear()
        window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined
    const isRefreshRequest = request?.url?.includes('/auth/refresh')

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isRefreshRequest
    ) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefreshToken()

    if (!refreshToken) {
      tokenStorage.clear()
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const session = await refreshSession(refreshToken)
      request.headers = AxiosHeaders.from(request.headers)
      request.headers.set('Authorization', `Bearer ${session.accessToken}`)
      return api(request)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
