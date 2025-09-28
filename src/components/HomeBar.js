import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

export default function HomeBar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    [
      'px-2 py-2 text-sm md:text-base font-medium transition-colors',
      isActive
        ? 'text-[var(--label-normal)]'
        : 'text-[var(--label-assistive)] hover:text-[var(--label-normal)]',
    ].join(' ')

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/login')
  }

  return (
    <header className="relative flex items-center justify-between bg-white h-14 pl-[170px] pr-[170px]">
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

      {/* 우측: 아이콘/마이페이지/로그아웃 */}
      <div className="items-center hidden gap-4 md:flex">
        {/* 알림 아이콘 (SVG 권장) */}
        <button
          aria-label="알림"
          className="p-2 rounded-lg hover:bg-gray-50 text-[var(--label-normal)]"
        >
          <img src="/assets/icons/bell.svg" alt="알림" className="w-5 h-5" />
        </button>

        <NavLink to="/mypage" className={linkClass}>
          마이 페이지
        </NavLink>

        <button
          onClick={handleLogout}
          className="px-2 py-2 text-sm md:text-base font-medium text-[var(--label-assistive)] hover:text-[var(--label-normal)]"
        >
          로그아웃
        </button>
      </div>

      {/* 모바일: 햄버거 */}
      <button
        className="md:hidden p-2 -mr-1 text-[var(--label-normal)]"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="메뉴 열기"
      >
        ☰
      </button>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="absolute left-0 top-14 w-full bg-white border-t border-[var(--border-subtle)] md:hidden z-50">
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
              선임자의 TIP
            </NavLink>
            <NavLink
              to="/free"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              자유 게시판
            </NavLink>
            <NavLink
              to="/qna"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              질문 게시판
            </NavLink>
            <NavLink
              to="/mypage"
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              마이 페이지
            </NavLink>
            <button
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
              className="px-5 py-2 text-base font-medium text-[var(--label-assistive)] hover:text-[var(--label-normal)]"
            >
              로그아웃
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
