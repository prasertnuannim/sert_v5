import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5178/api'

export const AUTH_SESSION_REFRESHED_EVENT = 'auth:session-refreshed'
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired'

interface RefreshResponse {
  accessToken: string
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let accessToken: string | null = null

if (typeof window !== 'undefined') {
  for (const key of [
    'phran.accessToken',
    'phran.refreshToken',
    'sert.accessToken',
    'sert.refreshToken',
  ]) {
    window.localStorage.removeItem(key)
  }
}

export const accessTokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
  withCredentials: true,
})

let refreshPromise: Promise<RefreshResponse> | null = null

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<RefreshResponse>('/auth/refresh')
      .then(({ data }) => {
        accessTokenStore.set(data.accessToken)
        window.dispatchEvent(
          new CustomEvent(AUTH_SESSION_REFRESHED_EVENT, { detail: data }),
        )
        return data
      })
      .catch((error: unknown) => {
        accessTokenStore.clear()
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
  const accessToken = accessTokenStore.get()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined
    const isSessionRequest = /\/auth\/(login|register|refresh|logout)/.test(
      request?.url ?? '',
    )
    const hasAccessToken = request?.headers?.has('Authorization')

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isSessionRequest ||
      !hasAccessToken
    ) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const session = await refreshSession()
      request.headers = AxiosHeaders.from(request.headers)
      request.headers.set('Authorization', `Bearer ${session.accessToken}`)
      return api(request)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
