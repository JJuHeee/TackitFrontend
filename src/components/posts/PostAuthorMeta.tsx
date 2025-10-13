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
      className={`post-author-meta flex items-center gap-2 text-label-neutral ${
        className ?? ''
      }`}
    >
      {/* ✅ 프로필 원 (회색) */}
      <div className="w-6 h-6 rounded-full bg-[#d9d9d9]" />

      {/* ✅ 닉네임 + 구분선 + 날짜 */}
      <div className="flex items-center gap-2">
        <span className="text-body1-semibold text-label-normal">
          {writer || '닉네임'}
        </span>
        {/* ✅ 구분선: line-normal 색상 */}
        <span className="text-[var(--line-normal)]" style={{ fontWeight: 400 }}>
          |
        </span>
        <span className="text-body2-regular text-label-neutral">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}
