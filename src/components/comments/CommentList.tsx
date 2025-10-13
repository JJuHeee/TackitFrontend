import React from 'react'
import CommentItem, { CommentModel } from './CommentItem'

type CommentListProps = {
  comments: CommentModel[]
  currentUserNickname?: string
  editCommentId: number | null
  onEdit: (c: { id: number; content: string }) => void
  onDelete: (commentId: number) => void
  onReport: (commentId: number) => void
}

export default function CommentList({
  comments,
  currentUserNickname,
  editCommentId,
  onEdit,
  onDelete,
  onReport,
}: CommentListProps) {
  return (
    <div className="comment-list">
      <h3 className="comment-title text-title2-bold text-label-normal">
        댓글{' '}
        <span className="text-title2-medium text-label-primary">
          {comments.length}
        </span>
      </h3>

      <div className="divide-y divide-line-normal">
        {comments.map((c) => (
          <div key={c.id} className="py-6">
            {' '}
            {/* ✅ 상하간격은 여기서만 */}
            <CommentItem
              comment={c}
              currentUserNickname={currentUserNickname}
              editCommentId={editCommentId}
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
