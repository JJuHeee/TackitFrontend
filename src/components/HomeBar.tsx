import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import NotificationBell from './notify/NotificationBell'
import MyInfo from '../pages/MyPage/MyInfo'

const HomeBar: React.FC = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }): string =>
    [
      'mx-3 px-0 py-2 text-sm md:text-base font-medium transition-colors',
      isActive
        ? 'text-[var(--label-normal)]'
        : 'text-[var(--label-assistive)] hover:text-[var(--label-normal)]',
    ].join(' ')

  return (
    <MyInfo>
      {(myInfo, loading) => (
        <header className="relative flex items-center justify-center bg-white h-14">
          <div className="w-[1100px] flex items-center justify-between mx-auto">
            {/* 좌측: 로고 + 메뉴 */}
            <div className="flex items-center">
              <img
                src="/logo.svg"
                alt="Tackit"
                className="w-[120px] h-10 cursor-pointer mr-10"
                onClick={() => navigate('/main')}
              />
              <nav className="items-center hidden md:flex">
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
                  다같이 얘기해요
                </NavLink>
              </nav>
            </div>

            {/* ✅ 우측: 알림 + 마이페이지 */}
            <div className="items-center hidden md:flex">
              <NotificationBell />
              <button
                aria-label="마이페이지로 이동"
                onClick={() => navigate('/mypage')}
                className="ml-4 focus:outline-none"
              >
                <img
                  src={
                    myInfo?.profileImageUrl
                      ? myInfo.profileImageUrl
                      : '/icons/mypage-icon.svg'
                  }
                  alt="마이페이지"
                  className="object-cover w-8 h-8 transition-opacity rounded-full hover:opacity-80"
                />
              </button>
            </div>

            {/* 모바일: 알림 + 프로필 + 햄버거 */}
            <div className="flex items-center gap-3 md:hidden">
              <NotificationBell />
              <button
                aria-label="마이페이지로 이동"
                onClick={() => navigate('/mypage')}
                className="w-8 h-8 rounded-full overflow-hidden bg-[#d9d9d9] hover:ring-2 hover:ring-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {/* 로딩 중이거나 프로필이 없으면 기본 아이콘 */}
                {myInfo?.profileImageUrl ? (
                  <img
                    src={myInfo.profileImageUrl}
                    alt="마이페이지"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <img
                    src="/icons/mypage-icon.svg"
                    alt="마이페이지"
                    className="object-cover w-full h-full opacity-80"
                  />
                )}
              </button>
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
      )}
    </MyInfo>
  )
}

export default HomeBar
