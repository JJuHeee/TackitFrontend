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
      className={`post-card p-4 transition ${className ?? ''}`} // ✅ hover 제거됨
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
      }}
    >
      <h3 className="mb-1 text-title-1 text-label-normal">
        {title ?? '(제목 없음)'}
      </h3>

      <p className="mb-2 whitespace-pre-line text-body-1 text-label-neutral">
        {joined}
        {needEllipsis && '...'}
      </p>

      <PostMeta writer={writer} createdAt={createdAt} tags={tags} />
    </article>
  )
}
