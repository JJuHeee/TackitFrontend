// 기존 파일: NotificationBell.tsx
import React, { useRef, useState, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import type { NotificationItem } from '../../types/notification'

const DESIGN_MOCK: NotificationItem[] = [
  {
    id: 2,
    from: '눈송',
    message: '눈송님이 글에 댓글을 남겼습니다.',
    relatedUrl: '/qna/1', // 디자인만 볼 거면 앱 라우트로 두세요( /api/... 말고 )
    type: 'COMMENT',
    createdAt: '2025-10-13T18:54:56.095969',
    read: false,
  },
  {
    id: 1,
    from: '눈송',
    message: '눈송님이 글을 스크랩 하였습니다.',
    relatedUrl: '/free/1',
    type: 'SCRAP',
    createdAt: '2025-10-18T15:15:52.945424',
    read: false,
  },
]

export default function NotificationBell() {
  const { items, unreadCount, readOne, reload, status } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    if (open) reload()
  }, [open, reload])

  const isOffline = status === 'offline'

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative p-2 rounded-xl hover:bg-[var(--background-neutral)]"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="알림"
        title={isOffline ? '오프라인: 캐시된 알림을 표시 중' : '알림'}
      >
        <img src="/assets/icons/bell.svg" alt="알림" className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-white text-[10px] leading-[18px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isOffline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-[8px] h-[8px] rounded-full bg-[var(--warning)]"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <NotificationPanel
          items={DESIGN_MOCK} // ← 훅 결과 대신 mock을 확실히 넘겨서 디자인 먼저 확인
          onReadOne={() => {}}
          onClose={() => {}}
        />
      )}
    </div>
  )
}
