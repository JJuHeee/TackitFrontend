// src/components/posts/PostMeta.tsx
import React from 'react'
import TagBadgeList from '../ui/TagBadgeList'
import PostAuthorMeta from './PostAuthorMeta'

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
  const hasTags = tags && tags.length > 0

  // 태그 없을 때는 PostAuthorMeta만 사용
  if (!hasTags) {
    return (
      <PostAuthorMeta
        writer={writer}
        createdAt={createdAt}
        className="justify-end"
      />
    )
  }

  // 태그 있을 때만 기존 구조 유지
  return (
    <div
      className={`post-meta flex items-center justify-between text-caption text-label-neutral ${
        className ?? ''
      }`}
    >
      <TagBadgeList tags={tags} className="flex flex-wrap" gapPx={6} />
      <PostAuthorMeta writer={writer} createdAt={createdAt} />
    </div>
  )
}
