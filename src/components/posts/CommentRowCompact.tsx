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
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* 1) 제목 */}
      <h3 className="text-title1-bold text-label-normal" style={{ margin: 0 }}>
        {title ?? '(제목 없음)'}
      </h3>

      {/* 2) 12px 여백 */}
      <div style={{ height: 12 }} />

      {/* 3) 댓글 아이콘 + 작성자/날짜 */}
      <div className="flex items-center gap-2">
        {showReplyIcon && (
          <div className="text-label-assistive">
            <ReplyIcon />
          </div>
        )}

        {/* ✅ 항상 PostAuthorMeta를 통해 시간 처리 (PostRowCompact와 동일 패턴) */}
        <PostAuthorMeta
          writer={hideWriter ? '' : safeWriter}
          createdAt={showDate ? createdAt : ''}
        />
      </div>

      <div className="ml-5">
        <PostPreview
          content={content}
          className="text-body1-reading-regular text-label-normal"
          lines={previewLines}
        />
      </div>
    </article>
  )
}
