import React from 'react'
import { toast } from 'react-toastify'
import PostPreview from './PostPreview'
import PostAuthorMeta from './PostAuthorMeta'

export type CommentRowProps = {
  id?: number
  title: string
  content: string
  writer?: string
  createdAt?: string
  imageUrl?: string | null
  className?: string
  borderColor?: string
  onClick?: () => void
  showReplyIcon?: boolean
  previewLines?: number

  // PostRowCompact와 유사한 확장 플래그
  hideWriter?: boolean
  showDate?: boolean
}

const ReplyIcon = ({ className = '' }) => (
  <img
    src="/icons/icon-reply.svg"
    alt="reply icon"
    width={18}
    height={18}
    className={className}
    style={{ display: 'block' }}
  />
)

export default function CommentRowCompact({
  id,
  title,
  content,
  writer = '',
  createdAt = '',
  imageUrl = null,
  className = '',
  borderColor = 'var(--line-normal)',
  onClick,
  showReplyIcon = true,
  previewLines = 1,
  hideWriter = false,
  showDate = true,
}: CommentRowProps) {
  const handleClick = () => {
    if (id == null) return toast.error('잘못된 게시글 ID입니다.')
    onClick?.()
  }

  // 닉네임 없으면 빈 문자열로 -> PostAuthorMeta가 날짜만 렌더링하도록
  const safeWriter = writer?.trim() ? writer : ''

  return (
    <article
      onClick={handleClick}
      className={`transition ${className}`}
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* 1) 제목 */}
      <h3 className="m-0 text-title-2b text-label-normal">
        {title ?? '(제목 없음)'}
      </h3>
      {/* 3) 댓글 아이콘 + 작성자/날짜 */}
      <div className="flex items-start">
        {showReplyIcon && (
          <div className="text-label-assistive mr-[12px]">
            <ReplyIcon />
          </div>
        )}

        <div className="flex flex-col flex-1 gap-2">
          <PostAuthorMeta
            writer={hideWriter ? '' : safeWriter}
            createdAt={showDate ? createdAt : ''}
          />

          <PostPreview
            content={content}
            className="text-body1-reading-regular text-label-normal"
            lines={previewLines}
          />
        </div>
      </div>
    </article>
  )
}
