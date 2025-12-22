/**
 * 댓글 목록 컴포넌트
 * - 댓글을 시간순으로 정렬해 리스트로 렌더링
 * - CommentItem에 수정/삭제/신고 액션 콜백 전달
 */

import CommentItem, { CommentModel } from './CommentItem'

type CommentListProps = {
  comments: CommentModel[]
  currentUserNickname?: string
  editCommentId: number | null
  /** 인라인 수정 시작/취소 콜백 (부모에서 내려옴) */
  onBeginEdit?: (id: number) => void
  onCancelEdit?: () => void
  /** 저장/삭제/신고 */
  onEdit: (c: { id: number; content: string }) => void
  onDelete: (commentId: number) => void
  onReport: (commentId: number) => void
}

export default function CommentList({
  comments,
  currentUserNickname,
  editCommentId,
  onBeginEdit,
  onCancelEdit,
  onEdit,
  onDelete,
  onReport,
}: CommentListProps) {
  const ordered = [...comments].sort((a, b) => {
    const ta = +new Date(a.createdAt || 0)
    const tb = +new Date(b.createdAt || 0)
    if (ta !== tb) return ta - tb
    return (a.id ?? 0) - (b.id ?? 0)
  })

  return (
    <div className="comment-list">
      <h3 className="comment-title text-title2-bold text-label-normal">
        댓글{' '}
        <span className="text-title2-medium text-label-primary">
          {comments.length}
        </span>
      </h3>

      <div
        className={`divide-y divide-line-normal ${
          comments.length === 0 ? 'mt-6' : ''
        }`}
      >
        {ordered.map((c) => (
          <div key={c.id} className="py-6">
            <CommentItem
              comment={c}
              currentUserNickname={currentUserNickname}
              editCommentId={editCommentId}
              onBeginEdit={onBeginEdit}
              onCancelEdit={onCancelEdit}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
