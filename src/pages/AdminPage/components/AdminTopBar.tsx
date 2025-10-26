import * as React from 'react'
import { Menu } from 'lucide-react'

type Props = {
  onMenu?: () => void
}

export default function AdminTopBar({ onMenu }: Props) {
  return (
    <header
      className="
        h-[57px] flex items-center
        bg-[var(--background-neutral)]
        border-b border-[var(--line-normal)]
        pr-[24px] z-40
      "
      role="banner"
    >
      {/* 모바일 메뉴 버튼 */}
      <div className="pl-3 tablet:hidden">
        <button
          aria-label="사이드바 열기"
          onClick={onMenu}
          className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium hover:bg-[var(--background-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* 오른쪽 아이콘 영역 */}
      <div className="flex items-center ml-auto">
        {/* 알림 아이콘 */}
        <button
          aria-label="알림"
          className="flex items-center justify-center w-[23px] h-[26px]"
        >
          <img src="/icons/bell.svg" alt="알림" className="w-[23px] h-[26px]" />
        </button>

        {/* 프로필 아이콘 */}
        <button
          aria-label="프로필"
          className="flex items-center justify-center w-[32px] h-[32px] ml-[24px]"
        >
          <img
            src="/icons/admin-icon.svg"
            alt="프로필"
            className="w-[32px] h-[32px] rounded-full bg-[var(--color-primary-100)]"
          />
        </button>
      </div>
    </header>
  )
}
