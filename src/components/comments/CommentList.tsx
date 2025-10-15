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

      <div className="divide-y divide-line-normal">
        {ordered.map((c) => (
          <div key={c.id} className="py-6">
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
