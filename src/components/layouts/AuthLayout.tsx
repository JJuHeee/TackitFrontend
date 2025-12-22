/**
 * AuthLayout
 *
 * 로그인/회원가입 페이지 공통 레이아웃
 * 하단 장식(strip)이 콘텐츠를 가리지 않도록
 * 콘텐츠 길이에 따라 fixed / non-fixed를 전환함
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type IconType = string | React.ReactElement

interface AuthLayoutProps {
  children: React.ReactNode
  iconOffset?: number | string
  icons?: IconType[]
  showCornerLogo?: boolean
}

export default function AuthLayout({
  children,
  icons = [],
  iconOffset = 190,
  showCornerLogo = true,
}: AuthLayoutProps) {
  const strip = icons[0]
  const contentRef = useRef<HTMLDivElement>(null)
  // 하단 장식을 fixed로 깔지 여부 (콘텐츠 길이에 따라 결정)
  const [useFixedStrip, setUseFixedStrip] = useState(true)

  const toCssOffset = (v: number | string) =>
    typeof v === 'number'
      ? `calc(env(safe-area-inset-bottom, 0px) + ${v}px)`
      : `calc(env(safe-area-inset-bottom, 0px) + ${v})`

  // 콘텐츠 길이에 따라 strip을 fixed로 사용해도 되는지 판단
  const recomputeMode = () => {
    const el = contentRef.current
    if (!el) return
    const contentH = el.scrollHeight
    const viewportH = window.innerHeight
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
      className="relative overflow-x-hidden min-h-dvh bg-gradient-to-b from-white to-background-blue"
      style={{ ['--app-bg' as any]: 'transparent' }}
    >
      {showCornerLogo && (
        <Link
          to="/login"
          className="absolute z-20"
          style={{
            top: '19.1px',
            left: '174px',
          }}
        >
          <img
            src="/logo.svg"
            alt="Tackit"
            style={{
              width: '112.47px',
              height: '27.79px',
            }}
          />
        </Link>
      )}

      {/* 컨텐츠 */}
      <div ref={contentRef} className="relative z-10 flex flex-col min-h-dvh">
        <div className="relative z-10 flex items-center justify-center flex-1">
          <div className="w-full max-w-[480px] px-4">{children}</div>
        </div>

        {strip && !useFixedStrip && (
          <div className="relative z-0 w-full pt-4 pb-0 pointer-events-none">
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
            <div style={{ height: toCssOffset(iconOffset) }} />
          </div>
        )}
      </div>

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
