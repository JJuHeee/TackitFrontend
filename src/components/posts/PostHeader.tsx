import React from 'react'
import PostActions from './PostActions'
import PostAuthorMeta from './PostAuthorMeta'

type PostHeaderProps = {
  title: string
  writer?: string
  createdAt?: string

  // 추가
  profileImageUrl?: string | null

  // 액션 관련
  isBookmarked?: boolean
  onToggleBookmark?: () => void

  // 작성자 여부/메뉴 콜백
  isAuthor?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onReport?: () => void

  actionsDisabled?: boolean
  className?: string
}

export default function PostHeader({
  title,
  writer,
  createdAt,
  profileImageUrl, // ⭐ 추가
  isBookmarked = false,
  onToggleBookmark,
  isAuthor = false,
  onEdit,
  onDelete,
  onReport,
  actionsDisabled = false,
  className,
}: PostHeaderProps) {
  return (
    <div
      className={`flex flex-col pb-6 mb-6 border-b border-line-normal ${
        className ?? ''
      }`}
    >
      {/* 제목 + 액션 */}
      <div className="flex items-center justify-between mt-10">
        <h1 className="font-bold leading-tight break-words text-h1 text-label-normal">
          {title}
        </h1>

        <div className="self-start flex-shrink-0 ml-4">
          <PostActions
            isBookmarked={isBookmarked}
            onToggleBookmark={onToggleBookmark}
            isAuthor={isAuthor}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            disabled={actionsDisabled}
          />
        </div>
      </div>

      <div className="mt-3 text-left">
        <PostAuthorMeta
          writer={writer}
          createdAt={createdAt}
          profileImageUrl={profileImageUrl}
          variant="default"
        />
      </div>
    </div>
  )
}
