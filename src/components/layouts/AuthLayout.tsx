import React from 'react'

type IconType = string | React.ReactElement

interface AuthLayoutProps {
  children: React.ReactNode
  /** 하단에서 떨어진 거리(px 또는 CSS 단위 문자열). 기본 190 */
  iconOffset?: number | string
  /** 하단에 깔 아이콘 스트립(1장). 문자열(URL) 또는 React 엘리먼트 */
  icons?: IconType[] // 기존 API 유지: 배열로 받아오되 첫 번째만 사용
}

export default function AuthLayout({
  children,
  icons = [],
  iconOffset = 190,
}: AuthLayoutProps) {
  // bottom 오프셋 대신 margin-bottom로 변환 (flow에서 간격 확보)
  const offsetMarginStyle =
    typeof iconOffset === 'number'
      ? {
          marginBottom: `calc(env(safe-area-inset-bottom, 0px) + ${iconOffset}px)`,
        }
      : {
          marginBottom: `calc(env(safe-area-inset-bottom, 0px) + ${iconOffset})`,
        }

  const strip = icons[0]

  return (
    <div
      className="relative overflow-x-hidden min-h-dvh"
      style={{ ['--app-bg' as any]: 'transparent' }}
    >
      {/* ✅ 전역 흰색(body) 위에 올라오도록 z-0 (음수 아님) + 클릭 막지 않도록 pointer-events-none */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-white to-background-blue" />
      {/* 컨텐츠 영역 */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* 폼 영역 */}
        <div className="relative z-10 flex items-center justify-center flex-1">
          <div className="w-full max-w-[420px] px-4">{children}</div>
        </div>

        {/* 하단 아이콘 스트립: flow에 배치(고정 아님) */}
        {strip && (
          <div
            className="relative z-0 w-full mt-auto pointer-events-none"
            style={offsetMarginStyle}
          >
            {typeof strip === 'string' ? (
              <img
                src={strip}
                alt=""
                aria-hidden="true"
                className="block object-cover w-full h-24 select-none opacity-80 md:h-32"
              />
            ) : (
              <div className="w-full h-24 md:h-32">{strip}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
