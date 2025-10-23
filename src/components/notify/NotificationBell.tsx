// NotificationBell.tsx
import React, { useRef, useState, useEffect } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationPanel from './NotificationPanel'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

export default function NotificationBell() {
  // ✅ 실제 알림 훅에서 상태 가져오기
  const { items, unreadCount, readOne, reload, status } = useNotifications()

  // 알림 패널 열림 상태
  const [open, setOpen] = useState(false)

  // ref: 바깥 클릭 감지용
  const ref = useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, () => setOpen(false))

  // 패널이 열릴 때마다 새로고침 (최신 알림 불러오기)
  useEffect(() => {
    if (open) reload()
  }, [open, reload])

  // 오프라인 모드 여부
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

        {/* 🧭 읽지 않은 알림 수 표시 */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-white text-[10px] leading-[18px] text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* ⚠️ 오프라인 상태 표시 점 */}
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
          items={items} // ✅ 실제 알림 데이터 연결
          onReadOne={readOne} // ✅ 단일 알림 읽음 처리
          onClose={() => setOpen(false)} // ✅ 닫기 버튼 동작 연결
        />
      )}
    </div>
  )
}
