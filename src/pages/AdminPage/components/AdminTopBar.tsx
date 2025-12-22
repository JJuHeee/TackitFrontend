/**
 * 관리자 상단 바 컴포넌트
 * - 관리자 레이아웃 상단에 고정되는 헤더 UI
 * - 알림 및 프로필 아이콘 표시
 */

export default function AdminTopBar() {
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
