import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './QnaPostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { sanitizeHtml } from '../../utils/sanitize'
import { hydrateCoverToken } from '../../utils/coverToken'
import CommentList from '../../components/comments/CommentList'
import CommentEditor from '../../components/comments/CommentEditor'
import type { CommentModel } from '../../components/comments/CommentItem'
import ReportModal from '../../components/modals/ReportModal'
import type { ReportPayload } from '../../components/modals/ReportModal'
import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'
import PostHeader from '../../components/posts/PostHeader'
import MyInfo from '../MyPage/MyInfo'

/** 상세 화면에서 사용할 정규화된 Post 타입 (Free와 동일 포맷) */
type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl: string | null
}

/** 서버 응답이 단일/배열/페이지네이션 등 다양한 형태일 때 첫 아이템 안전 추출 */
function pickFirst<T = any>(raw: any): T | null {
  if (!raw) return null
  if (Array.isArray(raw?.content)) return (raw.content[0] ?? null) as T | null
  if (Array.isArray(raw)) return (raw[0] ?? null) as T | null
  return (raw as T) ?? null
}

function normalizeComments(raw: any): CommentModel[] {
  const data = Array.isArray(raw?.content)
    ? raw.content
    : Array.isArray(raw)
    ? raw
    : raw
    ? [raw]
    : []

  return data
    .map((c: any) => ({
      id: Number(c.id),
      writer: String(c.writer ?? c.author ?? '(알 수 없음)'),
      content: String(c.content ?? ''),
      createdAt: String(
        c.createdAt ?? c.created_at ?? new Date().toISOString()
      ),
    }))
    .filter((c: CommentModel) => Number.isFinite(c.id))
}

function QnaPostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const postIdNumber = Number(postId)

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState<CommentModel[]>([])
  const [comment, setComment] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [isScrapped, setIsScrapped] = useState(false)

  const [showPostReportModal, setShowPostReportModal] = useState(false)
  const [showCommentReportModal, setShowCommentReportModal] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(
    null
  )

  // 게시글 로딩 (QnA 응답 → Free 포맷으로 정규화: postId → id 등)
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/qna-post/${postId}`)
        const item = pickFirst<any>(res?.data)
        if (!item) {
          toastError('게시글을 찾지 못했습니다.')
          setPost(null)
          return
        }
        const normalized: Post = {
          id: Number(item.postId ?? postIdNumber ?? 0),
          writer: String(item.writer ?? '(알 수 없음)'),
          title: String(item.title ?? ''),
          content: String(item.content ?? ''),
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: String(item.createdAt ?? new Date().toISOString()),
          imageUrl: item.imageUrl ?? null,
        }
        setPost(normalized)
      } catch {
        // 실패 시 더미
        setPost({
          id: postIdNumber || 0,
          writer: '기본',
          title: '본문1 제목',
          content: '내용4',
          tags: ['태그1', '태그3', '태그2'],
          createdAt: '2025-05-13T19:34:53.52603',
          imageUrl: null,
        })
      } finally {
        setLoading(false)
      }
    }
    if (postId) fetchPost()
  }, [postId, postIdNumber])

  // 댓글 로딩
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/qna-comment/${postId}`)
        setComments(normalizeComments(res.data))
      } catch {
        setComments([
          {
            id: 1,
            writer: '기본값',
            content: '댓글 내용입니다.',
            createdAt: '2025-05-12T20:06:42.621605',
          },
          {
            id: 2,
            writer: 'test',
            content: '댓글 내용입니다. 2',
            createdAt: '2025-05-12T20:08:11.738681',
          },
        ])
      }
    }
    if (postId) fetchComments()
  }, [postId])

  // 댓글 인라인 수정 컨트롤
  const handleBeginEditComment = (targetId: number) =>
    setEditCommentId(targetId)
  const handleCancelEditComment = () => setEditCommentId(null)

  const handleSaveEditComment = async ({
    id,
    content,
  }: {
    id: number
    content: string
  }) => {
    const trimmed = String(content ?? '').trim()
    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    if (trimmed.length > 250)
      return toastWarn('댓글은 최대 250자까지 작성할 수 있어요.')

    try {
      const res = await api.patch(`/api/qna-comment/${id}`, {
        content: trimmed,
      })
      setComments((prev) => prev.map((c) => (c.id === id ? res.data : c)))
      toastSuccess('댓글이 수정되었습니다.')
      setEditCommentId(null)
    } catch {
      toastError('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/api/qna-comment/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toastSuccess('댓글이 삭제되었습니다.')
    } catch {
      toastError('댓글 삭제에 실패했습니다.')
    }
  }

  // 댓글 신고: 모달 열기
  const handleReportCommentOpen = (commentId: number) => {
    setReportingCommentId(commentId)
    setShowCommentReportModal(true)
  }

  // 댓글 신고 제출
  const handleSubmitCommentReport = async (p: ReportPayload) => {
    if (p.targetType !== 'COMMENT') return
    try {
      await api.post('/reports/create', {
        targetId: p.targetId,
        targetType: p.targetType, // 'COMMENT'
        reason: p.reason,
      })
      await api.post(`/api/qna-comment/${p.targetId}/report`)
      toastSuccess('신고처리가 완료되었습니다.')
      setShowCommentReportModal(false)
      setReportingCommentId(null)
    } catch {
      toastError('댓글 신고 처리에 실패했습니다.')
    }
  }

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim()
    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    if (trimmed.length > 250)
      return toastWarn('댓글은 최대 250자까지 작성할 수 있어요.')

    try {
      const res = await api.post('/api/qna-comment/create', {
        qnaPostId: postIdNumber,
        content: trimmed,
      })
      setComments((prev) => [...prev, res.data])
      setComment('')
      toastSuccess('댓글이 등록되었습니다.')
    } catch {
      toastError('댓글 등록에 실패했습니다.')
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return
    try {
      await api.delete(`/api/qna-post/${postId}`)
      toastSuccess('게시글이 삭제되었습니다.')
      navigate('/qna')
    } catch {
      toastError('게시글 삭제에 실패했습니다.')
    }
  }

  // 게시글 신고 제출
  const handleSubmitPostReport = async (p: ReportPayload) => {
    if (p.targetType !== 'POST') return
    try {
      await api.post('/reports/create', {
        targetId: p.targetId,
        targetType: p.targetType, // 'POST'
        reason: p.reason,
      })
      const res = await api.post(`/api/qna-post/${postId}/report`)
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message

      if (message === '게시글을 신고하였습니다.') {
        toastSuccess('신고처리가 완료되었습니다.')
      } else if (message === '이미 신고한 게시글입니다.') {
        toastInfo('이미 신고한 게시글입니다.')
      } else {
        toastInfo(message || '신고가 접수되었습니다.')
      }
      setShowPostReportModal(false)
    } catch {
      toastError('신고 처리에 실패했습니다.')
    }
  }

  // 찜 토글
  const handleScrapToggle = async () => {
    try {
      const res = await api.post(`/api/qna-post/${postId}/scrap`)
      const data = res.data ?? {}
      if (typeof data?.scrapped === 'boolean') {
        setIsScrapped(data.scrapped)
        toastSuccess(data.scrapped ? '찜 되었습니다.' : '찜이 취소되었습니다.')
        return
      }
      const message =
        typeof data === 'string' ? data : (data?.message as string | undefined)
      if (message === '게시글을 스크랩하였습니다.') {
        setIsScrapped(true)
        toastSuccess('게시물이 스크랩되었습니다.')
      } else if (message === '게시글 스크랩을 취소하였습니다.') {
        setIsScrapped(false)
      } else {
        toastInfo(message || '처리되었습니다.')
      }
    } catch {
      toastError('찜 처리에 실패했습니다.')
    }
  }

  return (
    <MyInfo>
      {(myInfo, myInfoLoading) => {
        const isNewbie = String(myInfo?.role ?? '').toUpperCase() === 'NEWBIE'
        const isAuthor = !!(
          myInfo?.nickname &&
          post &&
          post.writer === myInfo.nickname
        )

        if (loading || myInfoLoading) {
          return (
            <>
              <HomeBar />
              <div className="qnapost-detail-container">
                <h1 className="board-title">질문 게시판</h1>
                <div className="qnapost-box">불러오는 중...</div>
              </div>
            </>
          )
        }

        return (
          <>
            <HomeBar />
            <div className="qnapost-detail-container">
              <img
                src="/assets/icons/arrow-left.svg"
                alt="뒤로가기"
                onClick={() => navigate('/qna')}
                className="w-6 h-6 transition cursor-pointer hover:opacity-70"
              />

              {post && (
                <PostHeader
                  title={post.title}
                  writer={post.writer}
                  createdAt={post.createdAt}
                  isBookmarked={isScrapped}
                  onToggleBookmark={handleScrapToggle}
                  isAuthor={isAuthor}
                  onEdit={() => navigate(`/qna/edit/${post.id}`)}
                  onDelete={handleDeletePost}
                  onReport={() => setShowPostReportModal(true)}
                />
              )}

              <div className="mt-12">
                <div className="qnapost-box">
                  {post && (
                    <div className="prose detail-content max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(
                            hydrateCoverToken(
                              String(post.content ?? ''),
                              post.imageUrl
                            )
                          ),
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flow-root pb-0 mt-0">
                  {post && (
                    <CommentList
                      comments={comments}
                      currentUserNickname={myInfo?.nickname}
                      editCommentId={editCommentId}
                      onBeginEdit={handleBeginEditComment}
                      onCancelEdit={handleCancelEditComment}
                      onEdit={handleSaveEditComment}
                      onDelete={handleDeleteComment}
                      onReport={handleReportCommentOpen}
                    />
                  )}

                  {/* ✅ NEWBIE이면 입력창 숨김 */}
                  {!editCommentId && !isNewbie && (
                    <CommentEditor
                      value={comment}
                      onChange={setComment}
                      onSubmit={() => {
                        if (isNewbie) {
                          toastWarn('신입은 댓글 작성이 제한됩니다.')
                          return
                        }
                        handleCommentSubmit()
                      }}
                      isEditing={false}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 게시글 신고 모달 */}
            {showPostReportModal && (
              <ReportModal
                isOpen={showPostReportModal}
                targetId={postIdNumber}
                targetType="POST"
                onClose={() => setShowPostReportModal(false)}
                onSubmit={handleSubmitPostReport}
              />
            )}

            {/* 댓글 신고 모달 */}
            {showCommentReportModal && reportingCommentId && (
              <ReportModal
                isOpen={showCommentReportModal}
                targetId={reportingCommentId}
                targetType="COMMENT"
                onClose={() => {
                  setShowCommentReportModal(false)
                  setReportingCommentId(null)
                }}
                onSubmit={handleSubmitCommentReport}
              />
            )}
          </>
        )
      }}
    </MyInfo>
  )
}

export default QnaPostDetail
