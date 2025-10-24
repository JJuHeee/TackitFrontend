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

  return (
    <div className="relative" ref={ref}>
      {/* 🔔 알림 벨 버튼 */}
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
          <span
            className="absolute top-[2px] right-[2px] w-[5.33px] h-[5.33px] 
                       rounded-full bg-[var(--color-label-primary)]"
          />
        )}

        {isOffline && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-[8px] h-[8px] rounded-full bg-[var(--warning)]"
            aria-hidden
          />
        )}
      </button>

      {/* 🔽 알림 패널 */}
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
