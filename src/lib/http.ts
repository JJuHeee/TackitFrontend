import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL || '/api'

const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 15000,
})

const AUTH_FREE = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/check-email-auth',
  '/auth/check-nickname',
  '/auth/rejoin',
  '/auth/reissue',
]

// 인터셉터 안 타는 전용 axios
const nakedAxios = axios.create()

async function reissueAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken || refreshToken === 'null') {
    localStorage.clear()
    window.location.href = '/login'
    throw Object.assign(new Error('No refresh token'), { status: 401 })
  }

  const { data } = await nakedAxios.post(`${BASE_URL}/auth/reissue`, null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  })

  if (!data?.accessToken || !data?.refreshToken) {
    localStorage.clear()
    window.location.href = '/login'
    throw Object.assign(new Error('Invalid reissue payload'), { status: 500 })
  }

  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)

  return data.accessToken
}

// 요청 인터셉터: accessToken 자동 부착
http.interceptors.request.use((config) => {
  const urlStr = typeof config.url === 'string' ? config.url : ''
  const isAuthFree = AUTH_FREE.some((u) => urlStr.includes(u))
  if (!isAuthFree) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers = config.headers ?? {}
      ;(config.headers as any).Authorization = `Bearer ${accessToken}`
    }
  }
  return config
})

// 응답 인터셉터: 401/403 → 재발급 처리
let isRefreshing = false
let waiters: Array<(t: string) => void> = []
const notifyAll = (t: string) => {
  waiters.splice(0).forEach((w) => w(t))
}

http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const { response, config } = err || {}
    if (!response) throw err

    const normalized = {
      status: response.status,
      message:
        response.data?.message ??
        err.message ??
        '알 수 없는 오류가 발생했습니다.',
    }

    const status = response.status
    const original = config as AxiosRequestConfig & { _retry?: boolean }

    if (
      typeof original?.url === 'string' &&
      original.url.includes('/auth/reissue')
    ) {
      throw normalized
    }

    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          waiters.push((newToken: string) => {
            original.headers = original.headers ?? {}
            ;(original.headers as any).Authorization = `Bearer ${newToken}`
            resolve(http(original))
          })
        })
      }

      isRefreshing = true
      try {
        const newAccessToken = await reissueAccessToken()
        notifyAll(newAccessToken)
        original.headers = original.headers ?? {}
        ;(original.headers as any).Authorization = `Bearer ${newAccessToken}`
        return http(original)
      } finally {
        isRefreshing = false
      }
    }

    throw normalized
  }
)

export default http

export async function getJson<T>(url: string, params?: any): Promise<T> {
  const { data } = await http.get<T>(url, { params })
  return data
}
export async function postJson<T>(url: string, body?: any): Promise<T> {
  const { data } = await http.post<T>(url, body)
  return data
}
export async function putJson<T>(url: string, body?: any): Promise<T> {
  const { data } = await http.put<T>(url, body)
  return data
}
export async function patchJson<T>(url: string, body?: any): Promise<T> {
  const { data } = await http.patch<T>(url, body)
  return data
}
export async function deleteJson<T = void>(url: string): Promise<T> {
  const { data } = await http.delete<T>(url)
  return data
}
