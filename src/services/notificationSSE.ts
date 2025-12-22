/**
 * 인증 토큰 기반 알림 SSE(Service-Sent Events) 연결을 관리하는 서비스 클래스
 * - 알림/하트비트 이벤트 수신
 * - 네트워크 오류 시 지수 백오프 재연결
 * - 토큰 갱신 시 재시작 지원
 */

import { EventSourcePolyfill } from 'event-source-polyfill'

type Handlers = {
  onMessage?: (data: any) => void
  onHeartbeat?: (data: any) => void
  onError?: (e: Event) => void
}

class NotificationSSE {
  private es: EventSourcePolyfill | null = null
  private url: string
  private retry = 1000
  private token: string | null = null
  private handlers: Handlers = {}

  constructor(url = '/api/notify/subscribe') {
    this.url = url
  }

  setHandlers(handlers: Handlers) {
    this.handlers = handlers
  }

  start(token: string) {
    if (!token) return
    this.token = token

    this.es = new EventSourcePolyfill(this.url, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: false,
      heartbeatTimeout: 60_000,
    })

    this.es.addEventListener('message', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data)
        this.handlers.onMessage?.(data)
      } catch {
        this.handlers.onMessage?.(e.data)
      }
    })

    this.es.addEventListener('heartbeat', (e: MessageEvent) => {
      this.handlers.onHeartbeat?.(e.data)
    })

    this.es.onerror = (e: Event) => {
      // <-- 타입 명시
      this.handlers.onError?.(e)
      this.stop(false)
      setTimeout(() => this.start(this.token!), this.retry)
      this.retry = Math.min(this.retry * 2, 30_000)
    }

    this.retry = 1000
  }

  restartWithToken(token: string) {
    this.stop(false)
    this.start(token)
  }

  stop(resetToken = true) {
    if (this.es) {
      this.es.close()
      this.es = null
    }
    if (resetToken) this.token = null
  }
}

export const notificationSSE = new NotificationSSE('/api/notify/subscribe')
