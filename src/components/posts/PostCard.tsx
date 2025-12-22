/**
 * 게시글 카드 컴포넌트(게시판 리스트에서 사용됨)
 * - 제목 + 본문 미리보기 + (옵션) 썸네일
 * - 하단에 작성자/날짜/태그 메타 정보 표시
 * - 클릭 시 상세 페이지로 이동
 */

import { toast } from 'react-toastify'
import PostMeta from './PostMeta'
import PostPreview from './PostPreview'

type PostCardProps = {
  id?: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags: string[]
  imageUrl?: string | null
  profileImageUrl?: string | null
  className?: string
  borderColor?: string
  onClick?: () => void

  previewLines?: 1 | 2 // 본문 줄 수
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
  imageUrl = null,
  profileImageUrl = null,
  previewLines = 2, // 기본은 본문 2줄
}: PostCardProps) {
  const handleClick = () => {
    if (id == null) return toast.error('잘못된 게시글 ID입니다.')
    onClick?.()
  }

  return (
    <article
      onClick={handleClick}
      className={`post-card transition ${className ?? ''}`}
      style={{
        borderBottom: `1px solid ${borderColor}`,
        cursor: 'pointer',
        padding: '24px 0 ',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* ====== 제목+미리보기(왼쪽) | 썸네일(오른쪽) 한 줄 ====== */}
      <div
        style={{
          display: 'flex',
          gap: imageUrl ? 16 : 0,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        {/* 왼쪽: 제목 + 2줄 미리보기 */}
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <h3
            className="text-title-1 text-label-normal"
            style={{
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title ?? '(제목 없음)'}
          </h3>
          <PostPreview
            content={content}
            className="text-body-1 text-label-neutral"
            lines={previewLines}
          />
        </div>

        {/* 오른쪽: 썸네일 */}
        {imageUrl && (
          <div
            style={{
              width: 120,
              height: 80,
              flex: '0 0 120px',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'transparent',
            }}
          >
            <img
              src={imageUrl}
              alt={title ?? '썸네일'}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      <PostMeta
        writer={writer}
        createdAt={createdAt}
        tags={tags}
        variant="compact"
        profileImageUrl={profileImageUrl ?? undefined}
      />
    </article>
  )
}
