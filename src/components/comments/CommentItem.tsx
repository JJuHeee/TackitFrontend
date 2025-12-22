/**
 * 댓글 아이템 컴포넌트
 * - 댓글 메타/내용 표시 및 작성자/비작성자 액션(수정,삭제,신고) 제공
 * - 선택된 댓글은 인라인 편집 모드로 전환해 수정 UI 렌더링
 */

import React, { useEffect, useState } from 'react'
import PostAuthorMeta, { type Role } from '../posts/PostAuthorMeta'
import { sanitizeHtml } from '../../utils/sanitize'
import CommentEditor from './CommentEditor'

export type CommentModel = {
  id: number
  writer: string
  content: string
  createdAt: string
  profileImageUrl?: string | null
  role?: Role
  joinedYear?: number
}

type CommentItemProps = {
  comment: CommentModel
  currentUserNickname?: string
  editCommentId: number | null
  onEdit: (c: { id: number; content: string }) => void
  onDelete: (commentId: number) => void
  onReport: (commentId: number) => void
  onBeginEdit?: (id: number) => void
  onCancelEdit?: () => void
}

function CommentItemBase({
  comment: c,
  currentUserNickname,
  editCommentId,
  onEdit,
  onDelete,
  onReport,
  onBeginEdit,
  onCancelEdit,
}: CommentItemProps) {
  const isAuthor = currentUserNickname === c.writer
  const isEditingThis = editCommentId === c.id

  // 인라인 수정용 로컬 상태 (HTML)
  const [editContent, setEditContent] = useState<string>(c.content ?? '')

  // 수정 대상을 바꿀 때 원문 동기화
  useEffect(() => {
    if (isEditingThis) setEditContent(c.content ?? '')
  }, [isEditingThis, c.content])

  const unchanged = (editContent ?? '') === (c.content ?? '')
  const handleSave = () => {
    const trimmed = (editContent ?? '').trim()
    if (!trimmed || unchanged) return
    onEdit({ id: c.id, content: trimmed })
  }
  const handleCancel = () => {
    setEditContent(c.content ?? '')
    onCancelEdit?.()
  }

  return (
    <div
      className={`comment-item ${
        isEditingThis ? 'bg-background-blue/10 rounded-lg p-3' : ''
      }`}
    >
      {/* 상단 메타 + 액션 */}
      <div className="flex items-center justify-between">
        <PostAuthorMeta
          writer={c.writer || '(알 수 없음)'}
          createdAt={c.createdAt}
          className="justify-start"
          role={c.role}
          joinedYear={c.joinedYear}
          profileImageUrl={c.profileImageUrl}
        />

        <div className="flex items-center text-body-2 text-label-neutral">
          {isAuthor && !isEditingThis ? (
            <>
              <button
                type="button"
                className="cursor-pointer hover:text-label-primary"
                onClick={() => onBeginEdit?.(c.id)}
              >
                수정
              </button>
              <span className="mx-2 text-line-normal">|</span>
              <button
                type="button"
                className="cursor-pointer hover:text-system-red"
                onClick={() => onDelete(c.id)}
              >
                삭제
              </button>
            </>
          ) : !isAuthor ? (
            <button
              type="button"
              className="cursor-pointer hover:text-label-primary"
              onClick={() => onReport(c.id)}
            >
              신고
            </button>
          ) : null}
        </div>
      </div>

      {isEditingThis ? (
        <div className="mt-3">
          <CommentEditor
            value={editContent}
            onChange={setEditContent}
            onSubmit={handleSave}
            onCancel={handleCancel}
            isEditing={true}
            collapsedPlaceholder="댓글을 입력해 주세요."
          />
        </div>
      ) : (
        <div
          className="mt-3 text-body-1 reading-regular text-label-normal comment-content"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(String(c.content ?? '')),
          }}
        />
      )}

      {!isEditingThis && <div className="mt-[10px] flex justify-start"></div>}
    </div>
  )
}

const CommentItem = React.memo(CommentItemBase)
export default CommentItem
