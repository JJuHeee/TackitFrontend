import React from 'react'
import { toast } from 'react-toastify'
import PostMeta from './PostMeta'

type PostCardProps = {
  id?: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags: string[]
  onClick?: () => void
  className?: string
  borderColor?: string
  imageUrl?: string | null
}

export default function PostCard({
  id,
  title,
  content,
  writer,
  createdAt,
  tags,
  onClick,
  className,
  borderColor = 'var(--line-normal)',
  imageUrl = null,
}: PostCardProps) {
  const handleClick = () => {
    if (id == null) return toast.error('잘못된 게시글 ID입니다.')
    onClick?.()
  }

  const lines = (content ?? '').split('\n')
  const joined = lines.slice(0, 2).join('\n').slice(0, 100)
  const needEllipsis = lines.length > 2 || (content ?? '').length > 100

  return (
    <article
      onClick={handleClick}
      className={`post-card transition ${className ?? ''}`}
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* ====== 제목+미리보기(왼쪽) | 썸네일(오른쪽) 한 줄 ====== */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start', // ✅ 고정 크기: 늘리지 않음
          justifyContent: 'space-between',
        }}
      >
        {/* 왼쪽: 제목 + 2줄 미리보기 */}
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h3 className="text-title-1 text-label-normal" style={{ margin: 0 }}>
            {title ?? '(제목 없음)'}
          </h3>
          <p
            className="text-body-1 text-label-neutral"
            style={{
              margin: 0,
              whiteSpace: 'pre-line',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {joined}
            {needEllipsis && '...'}
          </p>
        </div>

        {/* 오른쪽: 썸네일 (항상 120×80 고정) */}
        <div
          style={{
            width: 120,
            height: 80, // ✅ 고정 높이
            flex: '0 0 120px',
            borderRadius: 8,
            overflow: 'hidden',
            background: imageUrl ? 'transparent' : '#f1f3f5',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title ?? '썸네일'}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%', // ✅ 래퍼(80px)에 맞춰 채움
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%' }} aria-hidden="true" />
          )}
        </div>
      </div>

      {/* 아래: 태그 + 닉네임 · 날짜 */}
      <PostMeta writer={writer} createdAt={createdAt} tags={tags} />
    </article>
  )
}
