/**
 * 게시글 메타 정보 영역
 * - 태그 목록
 * - 작성자 / 작성일 정보
 */

import TagBadgeList from '../ui/TagBadgeList'
import PostAuthorMeta from './PostAuthorMeta'

type PostMetaProps = {
  writer?: string
  createdAt?: string
  tags?: string[]
  className?: string
  hideWriter?: boolean
  role?: 'NEWBIE' | 'SENIOR'
  joinedYear?: number
  profileImageUrl?: string | null
  variant?: 'default' | 'compact'
}

export default function PostMeta({
  writer,
  createdAt,
  tags,
  className,
  hideWriter = false,
  role,
  joinedYear,
  profileImageUrl,
  variant = 'default',
}: PostMetaProps) {
  const hasTags = tags && tags.length > 0

  return (
    <div
      className={`post-meta flex items-center justify-between ${
        className ?? ''
      }`}
    >
      {hasTags ? (
        <TagBadgeList tags={tags} className="flex flex-wrap" gapPx={6} />
      ) : (
        <div />
      )}

      <PostAuthorMeta
        writer={hideWriter ? '' : writer}
        createdAt={createdAt}
        role={role}
        joinedYear={joinedYear}
        profileImageUrl={profileImageUrl}
        variant={variant}
      />
    </div>
  )
}
