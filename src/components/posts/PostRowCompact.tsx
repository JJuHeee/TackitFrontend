// components/activities/PostRowCompact.tsx
import React from 'react'
import { toast } from 'react-toastify'
import PostMeta from './PostMeta'
import PostPreview from './PostPreview'

export type PostRowProps = {
  id?: number
  title: string
  content: string
  writer?: string
  createdAt?: string
  tags?: string[]
  imageUrl?: string | null
  className?: string
  borderColor?: string
  onClick?: () => void

  // ✅ 확장 플래그들
  showReplyIcon?: boolean
  hideWriter?: boolean
  showTags?: boolean
  showDate?: boolean
  previewLines?: number
  thumbnail?: 'auto' | 'none'
  density?: 'comfortable' | 'compact'
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

export default function PostRowCompact({
  id,
  title,
  content,
  writer = '',
  createdAt = '',
  tags = [],
  imageUrl = null,
  className = '',
  borderColor = 'var(--line-normal)',
  onClick,

  // ✅ 기본값은 “메인 피드” 친화적
  showReplyIcon = false,
  hideWriter = false,
  showTags = true,
  showDate = true,
  previewLines = 2,
  thumbnail = 'auto',
  density = 'comfortable',
}: PostRowProps) {
  const handleClick = () => {
    if (id == null) return toast.error('잘못된 게시글 ID입니다.')
    onClick?.()
  }

  const containerPadding = density === 'compact' ? 12 : 16
  const gap = density === 'compact' ? 8 : 10
  const showThumb = thumbnail === 'auto' && !!imageUrl

  return (
    <article
      onClick={handleClick}
      className={`transition ${className}`}
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        gap,
      }}
    >
      {/* 상단: (아이콘) + 제목/미리보기 + 썸네일 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {showReplyIcon && (
          <div style={{ color: 'var(--label-neutral)', marginTop: 4 }}>
            <ReplyIcon />
          </div>
        )}

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
          <PostPreview
            content={content}
            className="text-body-1 text-label-neutral"
            lines={previewLines}
          />
        </div>

        {showThumb && (
          <div
            style={{
              width: 120,
              height: 80,
              flex: '0 0 120px',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img
              src={imageUrl!}
              alt={title ?? '썸네일'}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) =>
                ((e.currentTarget as HTMLImageElement).style.display = 'none')
              }
            />
          </div>
        )}
      </div>

      {/* 하단 메타: 태그/닉네임/날짜 노출 제어 */}
      {(showTags || !hideWriter || showDate) && (
        <PostMeta
          writer={hideWriter ? '' : writer}
          createdAt={showDate ? createdAt : ''}
          tags={showTags ? tags : []}
        />
      )}
    </article>
  )
}
