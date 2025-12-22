/**
 * 알림 벨 컴포넌트
 * - 알림 종 아이콘 클릭 시 알림 패널 토글
 * - 외부 클릭 시 패널 닫힘 처리
 */

import React, { useRef, useState, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

export default function NotificationBell() {
  const { items, unreadCount, readOne, reload, status } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    if (open) reload()
  }, [open, reload])

  const isOffline = status === 'offline'
  const bellIcon =
    unreadCount > 0 ? '/icons/bell-notification.svg' : '/icons/bell.svg'

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
        <img src={bellIcon} alt="알림" className="w-5 h-5" />
      </button>

      {open && (
        <NotificationPanel
          items={items}
          onReadOne={readOne}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
