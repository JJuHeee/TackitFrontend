// components/posts/PostAuthorMeta.tsx
import React from 'react'

type PostAuthorMetaProps = {
  writer?: string
  createdAt?: string
  className?: string
}

export default function PostAuthorMeta({
  writer,
  createdAt,
  className,
}: PostAuthorMetaProps) {
  const formatDate = (s?: string) => {
    if (!s) return '-'
    const d = new Date(s)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div
      className={`post-author-meta flex items-center gap-2 ${className ?? ''}`}
    >
      {/* 프로필 원 */}
      <div className="w-6 h-6 rounded-full bg-[#d9d9d9]" />

      {/* 닉네임 | 날짜 */}
      <div className="flex items-center gap-2">
        <span className="text-body1-semibold text-label-normal">
          {writer || ''}
        </span>
        <span className="text-label-assistive">|</span>
        <span className="text-body2-regular text-label-neutral">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}
