import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import NotificationBell from './notify/NotificationBell' // ✅ 알림 벨 UI 컴포넌트만 유지

const HomeBar: React.FC = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    [
      'px-2 py-2 text-sm md:text-base font-medium transition-colors',
      isActive
        ? 'text-[var(--label-normal)]'
        : 'text-[var(--label-assistive)] hover:text-[var(--label-normal)]',
    ].join(' ')

  return (
    <header className="relative flex items-center justify-center bg-white h-14">
      <div className="w-[1100px] flex items-center justify-between mx-auto">
        {/* 좌측: 로고 + 메뉴 */}
        <div className="flex items-center gap-6">
          <img
            src="/logo.png"
            alt="Tackit"
            className="h-8 cursor-pointer md:h-10"
            onClick={() => navigate('/main')}
          />
          <nav className="items-center hidden gap-6 md:flex">
            <NavLink to="/main" className={linkClass} end>
              홈
            </NavLink>
            <NavLink to="/tip" className={linkClass}>
              선배가 알려줘요
            </NavLink>
            <NavLink to="/qna" className={linkClass}>
              신입이 질문해요
            </NavLink>
            <NavLink to="/free" className={linkClass}>
              자유롭게 얘기해요
            </NavLink>
          </nav>
        </div>

        {/* ✅ 우측: 알림 + 마이페이지 */}
        <div className="items-center hidden md:flex">
          {/* 기존 벨 버튼 대신 알림 컴포넌트만 남김 */}
          <NotificationBell />
          <button
            aria-label="마이페이지로 이동"
            onClick={() => navigate('/mypage')}
            className="ml-6 w-8 h-8 rounded-full bg-[#d9d9d9] hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* 모바일: 알림 + 원 + 햄버거 */}
        <div className="flex items-center gap-3 md:hidden">
          <NotificationBell /> {/* 모바일에서도 동일하게 사용 */}
          <button
            aria-label="마이페이지로 이동"
            onClick={() => navigate('/mypage')}
            className="w-8 h-8 rounded-full bg-[#d9d9d9] hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            className="p-2 text-[var(--label-normal)]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="absolute left-0 top-14 w-full bg-white border-t border-[var(--border-subtle)] md:hidden z-50">
          <div className="w-[1100px] mx-auto">
            <nav className="flex flex-col items-start py-3">
              <NavLink
                to="/main"
                className={linkClass}
                onClick={() => setMenuOpen(false)}
                end
              >
                홈
              </NavLink>
              <NavLink
                to="/tip"
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                선배가 알려줘요
              </NavLink>
              <NavLink
                to="/qna"
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                신입이 질문해요
              </NavLink>
              <NavLink
                to="/free"
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                자유롭게 얘기해요
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default HomeBar
