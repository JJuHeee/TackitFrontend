import React from 'react'
import TagBadgeList from '../ui/TagBadgeList'
import PostAuthorMeta from './PostAuthorMeta'

type PostMetaProps = {
  writer?: string
  createdAt?: string
  tags?: string[]
  className?: string
  hideWriter?: boolean
}

export default function PostMeta({
  writer,
  createdAt,
  tags,
  className,
  hideWriter = false,
}: PostMetaProps) {
  const hasTags = tags && tags.length > 0

  return (
    <div
      className={`post-meta flex items-center justify-between text-caption text-label-neutral ${
        className ?? ''
      }`}
    >
      {/* 태그 영역 (없으면 비워둠) */}
      {hasTags ? (
        <TagBadgeList tags={tags} className="flex flex-wrap" gapPx={6} />
      ) : (
        <div /> // flex 정렬 유지용 빈 div
      )}

      {/* 작성자/날짜 영역 */}
      <PostAuthorMeta writer={hideWriter ? '' : writer} createdAt={createdAt} />
    </div>
  )
}
