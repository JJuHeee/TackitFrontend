import React from 'react'
import TagBadgeList from '../ui/TagBadgeList'
import PostAuthorMeta from './PostAuthorMeta'

type PostMetaProps = {
  writer?: string
  createdAt?: string
  tags?: string[]
  className?: string
  hideWriter?: boolean // ✅ 추가
}

export default function PostMeta({
  writer,
  createdAt,
  tags,
  className,
  hideWriter = false, // ✅ 기본값 false
}: PostMetaProps) {
  const hasTags = tags && tags.length > 0

  // 태그 없을 때: PostAuthorMeta 단독 사용
  if (!hasTags) {
    return (
      <PostAuthorMeta
        writer={hideWriter ? '' : writer} // ✅ 숨길 때 빈 문자열 전달
        createdAt={createdAt}
        className="justify-end"
      />
    )
  }

  // 태그 있을 때: TagBadgeList + PostAuthorMeta
  return (
    <div
      className={`post-meta flex items-center justify-between text-caption text-label-neutral ${
        className ?? ''
      }`}
    >
      <TagBadgeList tags={tags} className="flex flex-wrap" gapPx={6} />
      <PostAuthorMeta
        writer={hideWriter ? '' : writer} // ✅ 숨길 때 빈 문자열 전달
        createdAt={createdAt}
      />
    </div>
  )
}
