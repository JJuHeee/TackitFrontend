import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

type IconType = string | React.ReactElement

interface AuthLayoutProps {
  children: React.ReactNode
  iconOffset?: number | string
  icons?: IconType[]
}

export default function AuthLayout({
  children,
  icons = [],
  iconOffset = 190,
}: AuthLayoutProps) {
  const strip = icons[0]
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [useFixedStrip, setUseFixedStrip] = useState(true)

  // iconOffset 계산
  const toCssOffset = (v: number | string) =>
    typeof v === 'number'
      ? `calc(env(safe-area-inset-bottom, 0px) + ${v}px)`
      : `calc(env(safe-area-inset-bottom, 0px) + ${v})`

  // 콘텐츠 높이와 윈도우 높이 비교해 모드 전환
  const recomputeMode = () => {
    const el = contentRef.current
    if (!el) return
    const contentH = el.scrollHeight
    const viewportH = window.innerHeight
    // 여유 4px 버퍼
    const shouldUseFixed = contentH <= viewportH - 4
    setUseFixedStrip(shouldUseFixed)
  }

  useLayoutEffect(() => {
    recomputeMode()
  }, [])

  useEffect(() => {
    const ro = new ResizeObserver(() => recomputeMode())
    if (contentRef.current) ro.observe(contentRef.current)
    const onResize = () => recomputeMode()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={
        // 배경은 컨테이너 자체에 적용 → 긴 페이지에서도 배경이 함께 늘어남
        'relative min-h-dvh overflow-x-hidden bg-gradient-to-b from-white to-background-blue'
      }
      style={{ ['--app-bg' as any]: 'transparent' }}
    >
      {/* 컨텐츠: 화면 중앙 정렬(짧은 페이지에서도 세로 중앙) */}
      <div ref={contentRef} className="relative z-10 flex flex-col min-h-dvh">
        <div className="relative z-10 flex items-center justify-center flex-1">
          {/* 자식 폭은 카드(440px)보다 약간 여유 */}
          <div className="w-full max-w-[480px] px-4">{children}</div>
        </div>

        {/* 흐름 모드(flow): 긴 페이지일 때만 표시 (문서 하단에 위치) */}
        {strip && !useFixedStrip && (
          <div
            className="relative z-0 w-full pt-4 pb-0 pointer-events-none"
            // flow 모드에서는 오프셋만큼 아래 ‘띄우는’ 대신, 살짝의 상단 여백으로 시각적 숨쉬기만 줌
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
            {/* 바닥과의 거리 확보 */}
            <div style={{ height: toCssOffset(iconOffset) }} />
          </div>
        )}
      </div>

      {/* 고정 모드(fixed): 짧은 페이지일 때만 표시 (뷰포트 하단에 위치, 스크롤 유발 X) */}
      {strip && useFixedStrip && (
        <div
          className="fixed inset-x-0 z-0 pointer-events-none"
          style={{ bottom: toCssOffset(iconOffset) }}
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
  )
}
