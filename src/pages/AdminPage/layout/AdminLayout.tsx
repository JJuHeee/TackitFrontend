import * as React from 'react'
import Sidebar from '../components/Sidebar'
import AdminTopBar from '../components/AdminTopBar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-[var(--background-neutral)] text-[var(--label-normal)]">
      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 tablet:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[282px] bg-white shadow-2xl">
            {/* 모바일: 가시 뷰포트 높이 꽉 채우기 */}
            <div className="h-[100svh] overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* 본 레이아웃: 두 열 높이 동일하게 맞춤 */}
      <div className="flex items-stretch min-h-dvh">
        {/* 데스크톱 사이드바 */}
        <div className="hidden tablet:block w-[282px] flex-shrink-0 self-stretch">
          <Sidebar />
        </div>

        {/* 메인 영역 */}
        <div className="flex flex-col flex-1">
          <AdminTopBar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto w-full max-w-[1200px] px-5 pt-6 pb-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
