import React from 'react'
import PostAuthorMeta from '../posts/PostAuthorMeta'
import { stripHtml } from '../../utils/stripHtml'

export type CommentModel = {
  id: number
  writer: string
  content: string
  createdAt: string
}

type CommentItemProps = {
  comment: CommentModel
  currentUserNickname?: string
  editCommentId: number | null
  onEdit: (c: { id: number; content: string }) => void
  onDelete: (commentId: number) => void
  onReport: (commentId: number) => void
}

function CommentItemBase({
  comment: c,
  currentUserNickname,
  editCommentId,
  onEdit,
  onDelete,
  onReport,
}: CommentItemProps) {
  const isAuthor = currentUserNickname === c.writer
  const isEditingThis = editCommentId === c.id

  return (
    <div className="comment-item" key={c.id}>
      {/* 메타 + 액션 (between 배치) */}
      <div className="flex items-center justify-between">
        <PostAuthorMeta
          writer={c.writer || '(알 수 없음)'}
          createdAt={c.createdAt}
          className="justify-start"
        />

        {/* 수정 / 삭제 / 신고 */}
        <div className="flex items-center text-body-2 text-label-neutral">
          {isAuthor && !isEditingThis ? (
            <>
              <span className="cursor-pointer" onClick={() => onEdit(c)}>
                수정
              </span>
              <span className="mx-2 text-line-normal">|</span>
              <span className="cursor-pointer" onClick={() => onDelete(c.id)}>
                삭제
              </span>
            </>
          ) : !isAuthor ? (
            <span className="cursor-pointer" onClick={() => onReport(c.id)}>
              신고
            </span>
          ) : null}
        </div>
      </div>

      {/* 댓글 본문 */}
      <p className="mt-3 whitespace-pre-line text-body-1 reading-regular text-label-normal">
        {stripHtml(c.content)}
      </p>

      {/* 답글 달기 */}
      <div className="mt-[10px] flex justify-start">
        <button
          type="button"
          className="text-label-neutral text-body-1 normal-regular"
        >
          답글 달기
        </button>
      </div>

      {/* 구분선 */}
      <div className="mt-6 border-b border-line-normal" />
    </div>
  )
}

/** 불필요한 리렌더 방지 */
const CommentItem = React.memo(CommentItemBase)
export default CommentItem
