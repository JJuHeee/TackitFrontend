/**
 * 게시글 액션(북마크/더보기 메뉴) 컴포넌트
 * - 작성자: 수정/삭제
 * - 비작성자: 신고
 */

import { useState, useRef, useEffect } from 'react'
import { Bookmark, MoreVertical } from 'lucide-react'

type PostActionsProps = {
  isBookmarked?: boolean
  onToggleBookmark?: () => void

  // 작성자 관련
  isAuthor?: boolean
  onEdit?: () => void
  onDelete?: () => void

  // 신고
  onReport?: () => void

  disabled?: boolean
  className?: string
}

export default function PostActions({
  isBookmarked = false,
  onToggleBookmark,

  isAuthor = false,
  onEdit,
  onDelete,

  onReport,

  disabled = false,
  className,
}: PostActionsProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const firstItemRef = useRef<HTMLButtonElement | null>(null)

  // 외부 클릭으로 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Esc로 닫기 + 포커스 복귀
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // 열릴 때 첫 항목 포커스
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => firstItemRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  // 드롭다운 항목 클릭 후 공통 처리
  const afterClick = (fn?: () => void) => () => {
    fn?.()
    setOpen(false)
    triggerRef.current?.focus()
  }

  // 메뉴가 비어있으면 ⋮ 버튼 숨길지 여부 (여기선 항상 노출)
  const hasAuthorMenu = isAuthor && (onEdit || onDelete)
  const hasReportMenu = !isAuthor && !!onReport

  return (
    <div
      ref={menuRef}
      className={`relative flex items-center gap-2 ${className ?? ''}`}
    >
      {/* 북마크 */}
      <button
        type="button"
        ref={triggerRef}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? '북마크 해제' : '북마크'}
        onClick={onToggleBookmark}
        disabled={disabled}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--background-blue)] disabled:opacity-50 transition"
      >
        <Bookmark
          size={22}
          strokeWidth={1.8}
          className={`transition ${
            isBookmarked
              ? 'text-label-primary fill-label-primary'
              : 'text-label-normal stroke-label-normal'
          }`}
        />
      </button>

      {/* ⋮ 트리거 */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="더보기"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--background-blue)] disabled:opacity-50 transition"
      >
        <MoreVertical size={20} className="text-label-normal" />
      </button>

      {/* 드롭다운 */}
      {open && (hasAuthorMenu || hasReportMenu) && (
        <div
          className="absolute right-0 top-[calc(100%+6px)] bg-white border border-line-normal rounded-xl shadow-lg py-2 z-10 w-32 animate-fadeIn"
          role="menu"
          aria-label="게시글 더보기"
        >
          {hasAuthorMenu ? (
            <>
              {onEdit && (
                <button
                  ref={firstItemRef}
                  role="menuitem"
                  onClick={afterClick(onEdit)}
                  className="w-full px-4 py-2 text-left outline-none text-body-2 hover:bg-background-blue focus:bg-background-blue"
                >
                  수정하기
                </button>
              )}
              {onDelete && (
                <button
                  role="menuitem"
                  onClick={afterClick(onDelete)}
                  className="w-full px-4 py-2 text-left outline-none text-body-2 hover:bg-background-blue focus:bg-background-blue"
                >
                  삭제하기
                </button>
              )}
            </>
          ) : hasReportMenu ? (
            <button
              ref={firstItemRef}
              role="menuitem"
              onClick={afterClick(onReport)}
              className="w-full px-4 py-2 text-left outline-none text-body-2 hover:bg-background-blue focus:bg-background-blue"
            >
              신고하기
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
