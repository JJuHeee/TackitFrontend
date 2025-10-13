import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './FreePostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import DOMPurify from 'dompurify'
import CommentList from '../../components/comments/CommentList'
import CommentEditor from '../../components/comments/CommentEditor'
import type { CommentModel } from '../../components/comments/CommentItem'

import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'

import PostHeader from '../../components/posts/PostHeader'

function FreePostDetail() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from

  const postIdNumber = Number(id)
  const [post, setPost] = useState<{
    id: number
    writer: string
    title: string
    content: string
    tags: string[]
    createdAt: string
    imageUrl?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState<CommentModel[]>([])

  const [comment, setComment] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [isScrapped, setIsScrapped] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const { userInfo } = useFetchUserInfo()

  const normalizeComments = (raw: any): CommentModel[] => {
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

  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      toastError('유효하지 않은 게시글 ID입니다.')
      navigate('/free')
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(`free-posts/${id}`)

        // ✅ QnA처럼 normalize: 응답이 배열/컨텐츠 래핑/단일객체 모두 대응
        // - 예) { content: [...] } 형태면 첫 항목 사용
        // - 예) 단일 객체면 그대로 사용
        const raw = res?.data
        const picked = Array.isArray(raw?.content)
          ? raw.content[0]
          : Array.isArray(raw)
          ? raw[0]
          : raw ?? null

        if (!picked) {
          toastError('게시글을 찾지 못했습니다.')
          setPost(null)
          return
        }

        const normalized = {
          id: picked.id ?? postIdNumber ?? 0,
          writer: picked.writer ?? '(알 수 없음)',
          title: picked.title ?? '',
          content: picked.content ?? '',
          tags: Array.isArray(picked.tags) ? picked.tags : [],
          createdAt: picked.createdAt ?? new Date().toISOString(),
          imageUrl: picked.imageUrl ?? null,
          // 필요 시 타입 필드가 있다면 아래 라인 주석 해제
          // type: (picked.type as 'Free' | 'QnA' | string) ?? 'Free',
        }

        setPost(normalized)
      } catch (err) {
        // ✅ 실패 시 더미(Free 게시판 스킴에 맞춰 최소 필드만)
        setPost({
          id: postIdNumber || 0,
          writer: '기본',
          title: '본문1 제목',
          content: '내용4',
          tags: ['태그1', '태그3', '태그2'],
          createdAt: '2025-05-13T19:34:53.52603',
          imageUrl: null,
        } as typeof post extends null ? never : NonNullable<typeof post>)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate, postIdNumber])

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`free-comments/${id}`)
        setComments(normalizeComments(res.data))
      } catch {
        // 더미
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
    if (id) fetchComments()
  }, [id])

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`free-comments/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toastSuccess('댓글이 삭제되었습니다.')
    } catch {
      toastError('댓글 삭제에 실패했습니다.')
    }
  }

  const handleReportComment = async (commentId: number) => {
    const confirmed = window.confirm('정말 이 댓글을 신고하시겠습니까?')
    if (!confirmed) return

    try {
      await api.post(`free-comments/${commentId}/report`)
      toastSuccess('댓글을 신고하였습니다.')
    } catch (err) {
      console.error('댓글 신고 실패:', err)
      toastError('이미 삭제된 댓글입니다.')
    }
  }

  const handleEditComment = (c: { id: number; content: string }) => {
    setComment(c.content)
    setEditCommentId(c.id)
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim()

    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    if (trimmed.length > 250)
      return toastWarn('댓글은 최대 250자까지 작성할 수 있어요.')

    try {
      if (editCommentId) {
        const res = await api.patch(`free-comments/${editCommentId}`, {
          content: trimmed,
        })
        setComments((prev) =>
          prev.map((c) => (c.id === editCommentId ? res.data : c))
        )
        toastSuccess('댓글이 수정되었습니다.')
      } else {
        const res = await api.post('free-comments', {
          freePostId: postIdNumber,
          content: trimmed,
        })
        setComments((prev) => [res.data, ...prev])
        toastSuccess('댓글이 등록되었습니다.')
      }

      setComment('')
      setEditCommentId(null)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch {
      toastError('댓글 처리에 실패했습니다.')
    }
  }

  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      await api.delete(`/free-posts/${id}`)
      toastSuccess('게시글이 삭제되었습니다.')
      navigate('/free')
    } catch {
      toastError('게시글 삭제에 실패했습니다.')
    }
  }

  const handleReportPost = async () => {
    if (!reportReason) return toastWarn('신고 사유를 선택해주세요.')

    try {
      await api.post(`/reports/create`, {
        targetId: postIdNumber,
        targetType: 'POST',
        reason: reportReason,
      })

      const res = await api.post(`/free-posts/${id}/report`)
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message

      if (message === '게시글을 신고하였습니다.') {
        toastSuccess('게시글이 신고되었습니다.')
        setShowReportModal(false)
        setReportReason('')
      } else if (message === '이미 신고한 게시글입니다.') {
        toastInfo('이미 신고한 게시글입니다.')
      } else {
        toastInfo(message || '신고가 접수되었습니다.')
      }
    } catch {
      toastError('신고 처리에 실패했습니다.')
    }
  }

  const handleScrapToggle = async () => {
    try {
      const res = await api.post(`/free-posts/${id}/scrap`)
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message

      if (message === '게시글을 스크랩하였습니다.') {
        setIsScrapped(true)
        toastSuccess('찜 되었습니다.')
      } else if (message === '게시글 스크랩을 취소하였습니다.') {
        setIsScrapped(false)
        toastInfo('찜이 취소되었습니다.')
      } else {
        toastInfo(message || '처리되었습니다.')
      }
    } catch (err: any) {
      const status = err?.response?.status
      const retryFlag = err?.config?._retry
      if (status === 401 && retryFlag) {
        toastError('세션이 만료되어 찜 요청에 실패했습니다.')
      } else {
        toastError('찜 처리에 실패했습니다.')
      }
    }
  }

  const isAuthor = !!(userInfo && post && post.writer === userInfo.nickname)

  if (loading) {
    return (
      <>
        <HomeBar />
        <div className="freepost-detail-container">
          <h1 className="free-board-title">자유 게시판</h1>
          <div className="freepost-box">불러오는 중...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <HomeBar />
      <div className="freepost-detail-container">
        <img
          src="/assets/icons/arrow-left.svg"
          alt="뒤로가기"
          onClick={() => navigate('/free')}
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
            onEdit={() => navigate(`/free/edit/${post.id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="freepost-box">
            {post && (
              <>
                {post.imageUrl && (
                  <div className="detail-image">
                    <img
                      src={post.imageUrl}
                      alt="첨부 이미지"
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* ✅ Quill 내용 그대로 렌더 */}
                <div className="prose detail-content max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(String(post.content ?? ''), {
                        USE_PROFILES: { html: true },
                      }),
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* ✅ 댓글 목록 */}
          {post && (
            <CommentList
              comments={comments}
              currentUserNickname={userInfo?.nickname}
              editCommentId={editCommentId}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
            />
          )}

          {/* ✅ 댓글 입력 */}
          <CommentEditor
            value={comment}
            onChange={setComment}
            onSubmit={handleCommentSubmit}
            isEditing={false}
          />
        </div>
      </div>

      {/* ✅ 신고 모달은 컨테이너 밖에 */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>신고 사유를 선택해주세요</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">신고 사유를 선택해주세요</option>
              <option value="ADVERTISEMENT">광고 및 홍보성 게시물</option>
              <option value="DUPLICATE">중복 또는 도배성 게시물</option>
              <option value="FALSE_INFO">허위 정보 또는 사실 왜곡</option>
              <option value="IRRELEVANT">게시판 주제와 관련 없는 내용</option>
              <option value="ETC">기타</option>
            </select>

            <div className="modal-buttons">
              <button onClick={handleReportPost}>확인</button>
              <button onClick={() => setShowReportModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FreePostDetail
