/**
 * 알림 패널 컴포넌트
 * - 알림 목록 표시
 * - 읽음 처리 후 관련 페이지로 이동
 */

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
      className="absolute right-0 mt-2 z-50 w-[440px] max-h-[75vh] overflow-y-auto rounded-2xl 
               bg-white shadow-[0_0_16px_rgba(0,0,0,0.08)]"
      role="dialog"
      aria-label="알림 목록"
    >
      {/* fallback 처리 */}
      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--label-assistive)]">
          <img
            src="/icons/empty.svg"
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
                className={`relative w-[440px] h-[116px] text-left
px-6 py-5 transition 
${n.read ? 'opacity-80' : 'bg-[var(--background-neutral)]/40'}
hover:bg-[var(--background-neutral)]`}
                onClick={async () => {
                  await onReadOne(n.id)
                  navigate(toAppRoute(n.relatedUrl))
                  onClose()
                }}
              >
                {!n.read && (
                  <span className="absolute left-6 top-7 w-2 h-2 rounded-full bg-[var(--primary-500)]" />
                )}

                <div className="flex flex-col">
                  {/* 활동 */}
                  <div className="text-[var(--label-primary)] text-body-2 font-semibold mb-2">
                    활동
                  </div>

                  {/* 알림 멘트: 읽음/안읽음 글씨 굵기 분기 */}
                  <div
                    className={`text-[var(--label-normal)] text-body-1 mb-2 ${
                      n.read ? 'font-normal' : 'font-semibold'
                    }`}
                  >
                    {n.message}
                  </div>

                  {/* 날짜 */}
                  <div className="text-[var(--label-neutral)] text-caption">
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
