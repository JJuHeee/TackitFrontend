import axios from 'axios'
import { notificationSSE } from '../services/notificationSSE'

// 1) BASE_URL 안전 기본값
const BASE_URL = process.env.REACT_APP_API_URL || '/api'

// 2) 공용 axios 인스턴스
const api = axios.create({
  baseURL: BASE_URL,
})

let isRefreshing = false
let refreshQueue = []

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token)
  })
  refreshQueue = []
}

const reissueAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken || refreshToken === 'null') {
      throw Object.assign(new Error('No refresh token'), { status: 401 })
    }

    const response = await axios.post(`${BASE_URL}/auth/reissue`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data || {}
    if (!accessToken || !newRefreshToken) {
      throw Object.assign(new Error('Invalid reissue payload'), { status: 500 })
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)

    // ★ 여기서 SSE에 새 토큰 알려주기
    try {
      notificationSSE.restartWithToken(accessToken)
    } catch (e) {
      console.warn('notificationSSE restart failed', e)
    }

    return accessToken
  } catch (error) {
    localStorage.clear()
    // SSE 닫기 (안전)
    try {
      notificationSSE.stop()
    } catch (_) {}
    window.location.href = '/login'
    throw error
  }
}

const AUTH_FREE = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/check-email-auth',
  '/auth/check-nickname',
  '/auth/rejoin',
  '/auth/reissue',
]

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    const url = typeof config.url === 'string' ? config.url : ''

    // 절대 URL이면(다른 도메인 포함) 토큰 안 붙이기
    const isAbsolute = /^https?:\/\//i.test(url)
    if (isAbsolute) return config

    // /auth/ 화이트리스트 정확 매칭(부분일치 대신)
    const pathname = url.startsWith('/') ? url : `/${url}`
    const isAuthFree = AUTH_FREE.includes(pathname)

    if (token && !isAuthFree) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config

    if (
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // 재발급 자체가 401이면 그냥 실패
      if (
        typeof originalRequest.url === 'string' &&
        originalRequest.url.includes('/auth/reissue')
      ) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      // 이미 리프레시 중이면 큐에 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (newToken) => {
              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      // 리프레시 시작
      isRefreshing = true
      try {
        const newAccessToken = await reissueAccessToken() // 실패 시 내부에서 세션정리/리다이렉트
        processQueue(null, newAccessToken)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        throw e
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
