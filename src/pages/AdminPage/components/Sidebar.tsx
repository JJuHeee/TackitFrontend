import React, { useState, useMemo, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import Modal from '../../../components/modals/Modal'

import { ReactComponent as DashboardIcon } from '../../../assets/icons/icon-dashboard.svg'
import { ReactComponent as UserIcon } from '../../../assets/icons/UserManagement.svg'
import { ReactComponent as ReportIcon } from '../../../assets/icons/ReportManagement.svg'
import { ReactComponent as LogoutIcon } from '../../../assets/icons/Logout.svg'

type Item = {
  to: string
  label: string
  Icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
}

const NAV_ITEMS: Item[] = [
  { to: '/admin', label: '대시보드', Icon: DashboardIcon },
  { to: '/admin/users', label: '사용자 관리', Icon: UserIcon },
  { to: '/admin/reports', label: '신고 관리', Icon: ReportIcon },
]

export default function Sidebar() {
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleConfirmLogout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setLogoutOpen(false)
    window.location.href = '/login'
  }, [])

  const asideClass = useMemo(
    () =>
      [
        // 높이 관련 수정 ✅
        'w-[282px] bg-white flex flex-col flex-1 h-full self-stretch',
        'border-[var(--line-normal)]',
        'overflow-x-hidden',
        '[&::-webkit-scrollbar]:w-2',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:bg-[var(--line-normal)]',
      ].join(' '),
    []
  )

  return (
    <aside className={asideClass} aria-label="Admin sidebar">
      {/* 로고 영역 */}
      <div className="mt-[14px] ml-[28px] flex items-center gap-[8px]">
        <img
          src="/logo.svg"
          alt="Tackit"
          width={112}
          height={28}
          className="select-none"
          draggable={false}
        />
      </div>

      {/* 구분선 */}
      <div
        className="mt-[14px] mb-[32px] h-px bg-[var(--line-normal)]"
        role="separator"
        aria-hidden="true"
      />

      {/* 네비게이션 메뉴 */}
      <nav
        className="mx-[20px] mb-[32px] mt-0 flex flex-col gap-[8px]"
        aria-label="Admin sections"
      >
        {NAV_ITEMS.map((it) => (
          <NavItem key={it.to} to={it.to} Icon={it.Icon} label={it.label} />
        ))}
      </nav>

      <div className="mt-auto" />

      {/* 로그아웃 버튼 */}
      <div className="mt-[80px] mx-[20px] mb-[20px]">
        <button
          type="button"
          className={[
            'w-full group flex items-center px-[16px] py-[12px] rounded-[8px]',
            'text-[var(--label-assistive)] text-body-1',
            'hover:bg-[var(--background-neutral)] hover:text-[var(--label-normal)]',
            'active:bg-[var(--background-neutral)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-white',
            'transition-colors',
          ].join(' ')}
          onClick={() => setLogoutOpen(true)}
          aria-label="로그아웃"
        >
          <LogoutIcon
            className={[
              'w-[20px] h-[20px] shrink-0 mr-[8px]',
              'text-[var(--label-assistive)] group-hover:text-[var(--label-normal)]',
            ].join(' ')}
            aria-hidden="true"
          />
          <span className="truncate">로그아웃</span>
        </button>
      </div>

      {/* 로그아웃 모달 */}
      <Modal
        open={logoutOpen}
        title="로그아웃 하시겠습니까?"
        confirmText="네"
        cancelText="취소"
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </aside>
  )
}

function NavItem({
  to,
  label,
  Icon,
}: {
  to: string
  label: string
  Icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >
}) {
  const isExactForDashboard = to === '/admin'

  return (
    <NavLink
      to={to}
      end={isExactForDashboard}
      className={({ isActive }) =>
        [
          'group flex items-center gap-[8px] px-[16px] py-[12px] rounded-[8px]',
          'transition-colors',
          isActive
            ? 'bg-[var(--background-neutral)] text-[var(--label-normal)] text-body-1sb'
            : 'text-[var(--label-assistive)] text-body-1 hover:bg-[var(--background-neutral)] hover:text-[var(--label-normal)]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'focus-visible:ring-[var(--color-primary-300)] focus-visible:ring-offset-white',
        ].join(' ')
      }
      aria-label={label}
      title={label}
    >
      {({ isActive }) => {
        const iconClass = [
          'w-[20px] h-[20px] shrink-0',
          isActive
            ? 'text-[var(--label-normal)]'
            : 'text-[var(--label-assistive)] group-hover:text-[var(--label-normal)]',
          'transition-colors',
        ].join(' ')
        return (
          <>
            <Icon className={iconClass} aria-hidden="true" />
            <span
              className="truncate"
              aria-current={isActive ? 'page' : undefined}
              data-active={isActive ? 'true' : 'false'}
            >
              {label}
            </span>
          </>
        )
      }}
    </NavLink>
  )
}
