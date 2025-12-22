/**
 * 관리자 공통 레이아웃
 * - Sidebar + AdminTopBar + 메인 콘텐츠 영역으로 구성
 */

import * as React from 'react'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--background-neutral)] text-[var(--label-normal)]">
      {/* 본 레이아웃: 사이드바 + 메인 영역 */}
      <div className="flex items-stretch min-h-dvh">
        {/* 사이드바 */}
        <div className="w-[282px] flex-shrink-0 self-stretch">
          <Sidebar />
        </div>

        {/* 메인 영역 */}
        <div className="flex flex-col flex-1">
          <AdminTopBar />
          <main className="mx-auto w-full max-w-[1200px] px-5 pt-6 pb-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
