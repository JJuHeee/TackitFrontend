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
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className={`post-author-meta flex items-center text-caption text-label-neutral ${
        className ?? ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="nickname">{writer || '(알 수 없음)'}</span>
        <span className="text-[var(--line-normal)]">|</span>
        <span className="date">{formatDate(createdAt)}</span>
      </div>
    </div>
  )
}
