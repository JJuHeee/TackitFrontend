/**
 * Post preview용 텍스트 컴포넌트
 * - HTML 태그를 제거한 순수 텍스트를 기준으로 표시
 * - 실제 렌더링 기준으로 지정한 줄 수를 초과한 경우에만
 *   line-clamp를 적용하여 불필요한 말줄임을 방지
 */

import { useEffect, useMemo, useRef, useState } from 'react'
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

  const plain = useMemo(() => {
    const p = stripHtml(content).replace(/\r\n/g, '\n')
    return p.replace(/\n+/g, ' ').trim()
  }, [content])

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    let rafId = 0
    let ro: ResizeObserver | null = null

    const measure = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        // 1) 클램프 OFF 상태에서 전체 높이(scrollHeight) 측정
        el.classList.remove('clamped')
        const full = el.scrollHeight

        // 2) 클램프 ON 상태에서 보이는 높이(clientHeight) 측정
        el.classList.add('clamped')
        const clamped = el.clientHeight

        const over = full > clamped + 1
        setIsOverflowing((prev) => (prev === over ? prev : over))
      })
    }

    // 폰트 로딩/렌더 타이밍 대응
    const fontsReady = (document as any).fonts?.ready
    if (fontsReady?.then) (document as any).fonts.ready.then(measure)
    else measure()

    // window resize 뿐 아니라 “컨테이너 폭 변화”도 잡기 위해 ResizeObserver 추천
    ro = new ResizeObserver(() => measure())
    ro.observe(el)

    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [plain, lines])

  return (
    <div
      ref={textRef}
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
