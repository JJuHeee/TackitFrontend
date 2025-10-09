// components/posts/PostMeta.tsx
import React from 'react'
import TagBadgeList from '../ui/TagBadgeList'

type PostMetaProps = {
  writer?: string
  createdAt?: string
  tags?: string[]
  className?: string
}

export default function PostMeta({
  writer,
  createdAt,
  tags,
  className,
}: PostMetaProps) {
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
      className={`post-meta flex items-center justify-between text-caption text-label-neutral ${
        className ?? ''
      }`}
    >
      {/* ✅ 왼쪽: 태그 목록 */}
      <TagBadgeList tags={tags} className="flex flex-wrap" gapPx={6} />

      {/* ✅ 오른쪽: 작성자 + 구분선 + 날짜 */}
      <div className="flex items-center gap-2">
        <span className="nickname">{writer || '(알 수 없음)'}</span>
        <span className="text-[var(--line-normal)]">|</span>
        <span className="date">{formatDate(createdAt)}</span>
      </div>
    </div>
  )
}
