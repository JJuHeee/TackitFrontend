import React, { useEffect, useRef, useState } from 'react'
import { stripHtml } from '../../utils/stripHtml'

type PostPreviewProps = {
  content: string
  className?: string
}

export default function PostPreview({ content, className }: PostPreviewProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const plain = stripHtml(content).replace(/\s+/g, ' ').trim()

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    const measure = () => {
      // 클램프 해제 후 높이 측정
      el.classList.remove('clamped')

      // 다음 프레임에서 실제 렌더된 높이 측정
      requestAnimationFrame(() => {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
        const maxHeight = lineHeight * 2
        const isOver = el.scrollHeight > maxHeight + 1
        setIsOverflowing(isOver)
      })
    }

    // 폰트가 다 로드된 후에 측정 (안정적)
    if ('fonts' in document) {
      // @ts-ignore
      document.fonts.ready.then(measure)
    } else {
      measure()
    }

    // 리사이즈 대응
    const handleResize = () => measure()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [plain])

  return (
    <div
      ref={textRef}
      className={`post-card-content ${isOverflowing ? 'clamped' : ''} ${
        className ?? ''
      }`}
    >
      {plain}
    </div>
  )
}
