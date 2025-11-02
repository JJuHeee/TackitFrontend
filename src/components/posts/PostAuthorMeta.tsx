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
      <img
        src="/icons/mypage-icon.svg"
        alt="마이페이지"
        className="object-cover w-6 h-6 rounded-full"
      />

      {/* 닉네임 | 날짜 */}
      <div className="flex items-center gap-2">
        <span className="text-body-1sb text-label-normal">{writer || ''}</span>
        <span className="text-label-assistive">|</span>
        <span className="text-body-2 text-label-neutral">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}
