/**
 * 알림 상태 관리 훅
 * - 알림 목록 조회 및 읽음 처리
 * - SSE 기반 실시간 알림 반영
 * - 로컬 캐시를 이용한 오프라인 폴백 처리
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchNotifications, markNotificationRead } from '../api/notify'
import type { NotificationItem } from '../types/notification'
import { notificationSSE } from '../services/notificationSSE'

type Status = 'idle' | 'ok' | 'offline' | 'error'
const LS_KEY = 'notif.cache.v1'

// 캐시 유틸
function loadCache(): NotificationItem[] | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed?.items)
      ? (parsed.items as NotificationItem[])
      : null
  } catch {
    return null
  }
}
function saveCache(items: NotificationItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ items, ts: Date.now() }))
  } catch {}
}

// 정렬 유틸 (최신순)
function sortByCreatedDesc(list: NotificationItem[]) {
  return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

// 기본 문구 fallback 생성 함수
function withFallbackMessage(list: NotificationItem[]): NotificationItem[] {
  return list.map((n) => {
    // message가 비어있거나 null/undefined일 경우 기본값 지정
    if (n.message && n.message.trim() !== '') return n

    let fallback = ''
    switch (n.type) {
      case 'COMMENT':
        fallback = `${n.from ?? '사용자'}님이 회원님의 글에 댓글을 달았습니다.`
        break
      case 'SCRAP':
        fallback = `${n.from ?? '사용자'}님이 회원님의 글을 스크랩했습니다.`
        break
      case 'LIKE':
        fallback = `${n.from ?? '사용자'}님이 회원님의 글을 좋아합니다.`
        break
      default:
        fallback = `${
          n.from ?? '알 수 없는 사용자'
        }님으로부터 새 알림이 있습니다.`
    }
    return { ...n, message: fallback }
  })
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const unreadCount = items.filter((n) => !n.read).length
  const abortRef = useRef<AbortController | null>(null)

  const apply = useCallback((next: NotificationItem[]) => {
    const normalized = sortByCreatedDesc(withFallbackMessage(next))
    setItems(normalized)
    saveCache(normalized)
  }, [])

  const reload = useCallback(async () => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      setStatus('idle')
      const list = await fetchNotifications({ signal: ctrl.signal } as any)
      apply(list)
      setStatus('ok')
    } catch (e: any) {
      const isOffline =
        e?.response?.status === 503 ||
        e?.message?.toString?.().includes('Network') ||
        e?.code === 'ECONNABORTED'
      const cached = loadCache()
      if (cached) {
        setItems(sortByCreatedDesc(withFallbackMessage(cached)))
        setStatus('offline') // 캐시 폴백
      } else {
        setItems([])
        setStatus(isOffline ? 'offline' : 'error')
      }
    }
  }, [apply])

  // 최초: 캐시 먼저 보여주고 네트워크 시도
  useEffect(() => {
    const cached = loadCache()
    if (cached) {
      setItems(sortByCreatedDesc(withFallbackMessage(cached)))
      setStatus('offline')
    }
    reload()
    return () => abortRef.current?.abort()
  }, [reload])

  // SSE 새 알림 반영
  useEffect(() => {
    notificationSSE.setHandlers({
      onMessage: (data: any) => {
        if (!data?.id) return
        const newItem = withFallbackMessage([data as NotificationItem])[0]
        setItems((prev) => {
          const exists = prev.some((n) => n.id === newItem.id)
          const next = exists ? prev : [newItem, ...prev]
          saveCache(next)
          return next
        })
      },
    })
    return () => {}
  }, [])

  // 낙관적 읽음 처리
  const readOne = useCallback(async (id: number) => {
    setItems((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      saveCache(next)
      return next
    })
    try {
      await markNotificationRead(id)
    } catch {
      // 실패 시 롤백
      setItems((prev) => {
        const next = prev.map((n) => (n.id === id ? { ...n, read: false } : n))
        saveCache(next)
        return next
      })
    }
  }, [])

  return { items, unreadCount, reload, readOne, setItems, status }
}
