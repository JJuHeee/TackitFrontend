import React from 'react'
import { toast } from 'react-toastify'
import PostPreview from './PostPreview'
import PostAuthorMeta from '../posts/PostAuthorMeta'

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
        <PostAuthorMeta writer={safeWriter} createdAt={createdAt} />
      </div>

      {/* 4) 본문 미리보기: 메타 바로 아래 + 살짝 들여쓰기 */}
      <div className="ml-5">
        <PostPreview
          content={content}
          // ⬇️ 네 토큰 네이밍에 맞게 사용: body1-reading-regular + label-normal
          // tailwind 설정이 'body-1rd'라면 아래 줄을 'text-body-1rd'로 바꿔 써줘!
          className="text-body1-reading-regular text-label-normal"
          lines={previewLines}
        />
      </div>
    </article>
  )
}
