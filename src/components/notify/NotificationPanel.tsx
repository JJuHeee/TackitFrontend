import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { NotificationItem } from '../../types/notification'
import { toAppRoute } from '../../utils/routeMap'

type Props = {
  items: NotificationItem[]
  onReadOne: (id: number) => Promise<void> | void
  onClose: () => void
  offline?: boolean
  error?: boolean
}

const KOR_DATE_OPT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

function formatDateKorean(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    if (sameDay)
      return d.toLocaleString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    return d.toLocaleDateString('ko-KR', KOR_DATE_OPT)
  } catch {
    return iso
  }
}

export default function NotificationPanel({
  items,
  onReadOne,
  onClose,
}: Props) {
  const navigate = useNavigate()
  const hasItems = items && items.length > 0

  return (
    <div
      className="absolute right-0 mt-2 w-[420px] max-h-[75vh] overflow-y-auto rounded-2xl 
               bg-white shadow-[0_0_16px_rgba(0,0,0,0.08)]"
      role="dialog"
      aria-label="알림 목록"
    >
      {/* ✅ fallback 처리 */}
      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--label-assistive)]">
          <img
            src="/icons/icon-empty-bell.svg"
            alt="empty"
            className="w-12 h-12 mb-3 opacity-70"
          />
          <p className="text-sm">새로운 알림이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--line-normal)]">
          {items.map((n) => (
            <li key={n.id}>
              <button
                className={`w-full text-left p-4 flex gap-2 transition rounded-xl
${n.read ? 'opacity-80' : 'bg-[var(--background-neutral)]/40 font-medium'}
hover:bg-[var(--background-neutral)]`}
                onClick={async () => {
                  await onReadOne(n.id)
                  navigate(toAppRoute(n.relatedUrl))
                  onClose()
                }}
              >
                {!n.read && (
                  <span className="mt-2 w-2 h-2 rounded-full bg-[var(--primary-500)] shrink-0" />
                )}
                <div className="flex-1">
                  <div
                    className={`text-[15px] leading-6 text-[var(--label-normal)] 
                              font-[var(--body1-normal-regular)] ${
                                n.read ? '' : 'font-semibold'
                              }`}
                  >
                    {n.message}
                  </div>
                  <div className="text-xs text-[var(--label-assistive)] mt-1">
                    {formatDateKorean(n.createdAt)}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
