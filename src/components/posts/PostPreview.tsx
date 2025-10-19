import React, { useEffect, useRef, useState } from 'react'
import { stripHtml } from '../../utils/stripHtml'
import './PostPreview.css'

type Props = {
  content: string
  className?: string
  lines?: number
  showTitleOnClamp?: boolean
}

export default function PostPreview({
  content,
  className = '',
  lines = 2,
  showTitleOnClamp = false,
}: Props) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const plain = stripHtml(content).replace(/\s+/g, ' ').trim()

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    const measure = () => {
      // ① 클램프 해제 후 높이 측정
      el.classList.remove('clamped')

      // ② 다음 프레임에서 실제 렌더된 높이 측정
      requestAnimationFrame(() => {
        const cs = getComputedStyle(el)
        const lineHeight = parseFloat(cs.lineHeight) || 20
        const maxHeight = lineHeight * (lines || 1)

        // scrollHeight는 소수점/안티앨리어싱 때문에 약간의 오차가 있어 여유치를 둔다
        const over = el.scrollHeight > maxHeight + 1
        setIsOverflowing(over)

        // 측정 끝났으면 다시 클램프 적용은 렌더에서 class로 처리됨
      })
    }

    // 폰트가 모두 로드된 뒤 측정 (사파리/웹킷 안정성 ↑)
    const fontsReady = (document as any).fonts?.ready
    if (fontsReady && typeof fontsReady.then === 'function') {
      ;(document as any).fonts.ready.then(measure)
    } else {
      measure()
    }

    // 리사이즈 대응 (선택: ResizeObserver도 추가)
    const onResize = () => measure()
    window.addEventListener('resize', onResize)

    let ro: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(measure)
      ro.observe(el)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
    }
    // plain/lines가 바뀔 때마다 재측정
  }, [plain, lines])

  return (
    <div
      ref={textRef}
      // CSS 변수로 원하는 줄 수 전달
      style={{ ['--lines' as any]: String(lines) }}
      className={`post-card-content ${
        isOverflowing ? 'clamped' : ''
      } ${className}`}
      title={isOverflowing && showTitleOnClamp ? plain : undefined}
    >
      {plain}
    </div>
  )
}
