import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../components/posts/PostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { sanitizeHtml } from '../../utils/sanitize'
import CommentList from '../../components/comments/CommentList'
import CommentEditor from '../../components/comments/CommentEditor'
import type { CommentModel } from '../../components/comments/CommentItem'
import ReportModal from '../../components/modals/ReportModal'
import type { ReportPayload } from '../../components/modals/ReportModal'
import { hydrateCoverToken } from '../../utils/coverToken'

import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'

import PostHeader from '../../components/posts/PostHeader'

function FreePostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const postIdNumber = Number(id)
  const [post, setPost] = useState<{
    id: number
    writer: string
    title: string
    content: string
    tags: string[]
    createdAt: string
    imageUrl?: string | null
    scrap?: boolean
    profileImageUrl?: string | null
  } | null>(null)

  const [loading, setLoading] = useState(true)

  const [comments, setComments] = useState<CommentModel[]>([])

  const [comment, setComment] = useState('') // 신규 작성용 입력값
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [isScrapped, setIsScrapped] = useState(false)

  const [showPostReportModal, setShowPostReportModal] = useState(false)
  const [showCommentReportModal, setShowCommentReportModal] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(
    null
  )

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

        profileImageUrl: c.profileImageUrl ?? null,
        role: c.role,
        joinedYear: c.joinedYear ? Number(c.joinedYear) : undefined,
      }))
      .filter((c: CommentModel) => Number.isFinite(c.id))
  }

  // 게시글 로딩
  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      toastError('유효하지 않은 게시글 ID입니다.')
      navigate('/free')
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/free-posts/${id}`)
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
          scrap: !!picked.scrap,
          profileImageUrl: picked.profileImageUrl ?? null,
        }

        setPost(normalized)
        setIsScrapped(!!normalized.scrap)
      } catch (err) {
        setPost({
          id: postIdNumber || 0,
          writer: 'tackit',
          title: '삭제된 게시글입니다',
          content: `
<h1>삭제된 게시글입니다</h1>
<p>해당 게시글은 작성자 또는 관리자에 의해 <strong>삭제</strong>되었습니다.</p>
<p>게시글을 더 이상 확인할 수 없습니다.</p>

<h2>가능한 원인</h2>
<ul>
  <li>작성자가 자발적으로 삭제한 경우</li>
  <li>커뮤니티 운영 정책 위반으로 관리자가 삭제한 경우</li>
</ul>

<h3>다른 글을 확인해보세요</h3>
<p>
게시판 목록으로 이동하여 다른 글을 확인할 수 있습니다.<br/>
불편을 드려 죄송합니다.
</p>
  `,
          tags: ['태그1', '태그3', '태그2'],
          createdAt: '2025-05-13T19:34:53.52603',
          imageUrl: null,
          scrap: false,
          profileImageUrl: null,
        } as typeof post extends null ? never : NonNullable<typeof post>)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate, postIdNumber])

  // 댓글 로딩 (오래된 → 최신 오름차순으로 정렬 보증)
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/free-comments/${id}`)
        setComments(normalizeComments(res.data))
      } catch {
        // 에러 시 더미 폴백 없이 빈 배열만 유지
        setComments([])
      }
    }

    if (id) fetchComments()
  }, [id])

  const handleBeginEditComment = (targetId: number) => {
    setEditCommentId(targetId)
  }

  const handleCancelEditComment = () => {
    setEditCommentId(null)
  }

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
      const res = await api.patch(`/api/free-comments/${id}`, {
        content: trimmed,
      })
      const updated = res.data

      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                writer: updated.writer ?? c.writer,
                content: updated.content ?? c.content,
                createdAt: updated.createdAt ?? c.createdAt,
              }
            : c
        )
      )

      toastSuccess('댓글이 수정되었습니다.')
      setEditCommentId(null)
    } catch {
      toastError('댓글 수정에 실패했습니다.')
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/api/free-comments/${commentId}`)
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

  // 댓글 등록
  const handleCommentSubmit = async () => {
    const trimmed = comment.trim()
    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    if (trimmed.length > 250)
      return toastWarn('댓글은 최대 250자까지 작성할 수 있어요.')

    try {
      const res = await api.post('/api/free-comments', {
        freePostId: postIdNumber,
        content: trimmed,
      })
      const [normalized] = normalizeComments(res.data)
      setComments((prev) => (normalized ? [...prev, normalized] : prev))
      setComment('')
    } catch {
      toastError('댓글 등록에 실패했습니다.')
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      await api.delete(`/api/free-posts/${id}`)
      toastSuccess('게시글이 삭제되었습니다.')
      navigate('/free')
    } catch {
      toastError('게시글 삭제에 실패했습니다.')
    }
  }

  // 게시글 신고 제출
  const handleSubmitPostReport = async (p: ReportPayload) => {
    if (p.targetType !== 'POST') return
    try {
      await api.post(`/api/reports/create`, {
        targetId: p.targetId,
        targetType: 'FREE_POST', // 'POST'
        reason: p.reason,
      })
      const res = await api.post(`/api/free-posts/${id}/report`)
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message
      if (message === '게시글을 신고하였습니다.')
        toastSuccess('신고처리가 완료되었습니다.')
      else if (message === '이미 신고한 게시글입니다.')
        toastInfo('이미 신고한 게시글입니다.')
      else toastInfo(message || '신고가 접수되었습니다.')
      setShowPostReportModal(false)
    } catch {
      toastError('신고 처리에 실패했습니다.')
    }
  }

  // 댓글 신고 제출
  const handleSubmitCommentReport = async (p: ReportPayload) => {
    if (p.targetType !== 'COMMENT') return
    try {
      await api.post(`/api/reports/create`, {
        targetId: p.targetId,
        targetType: 'FREE_COMMENT',
        reason: p.reason,
      })
      await api.post(`/api/free-comments/${p.targetId}/report`)
      toastSuccess('신고처리가 완료되었습니다.')
      setShowCommentReportModal(false)
      setReportingCommentId(null)
    } catch {
      toastError('댓글 신고 처리에 실패했습니다.')
    }
  }
  // 찜하기
  const handleScrapToggle = async () => {
    const next = !isScrapped

    setIsScrapped(next)
    setPost((prevPost) => (prevPost ? { ...prevPost, scrap: next } : prevPost))

    try {
      await api.post(`/api/free-posts/${id}/scrap`)

      if (next) toastSuccess('게시물이 스크랩되었습니다.')
    } catch (err: any) {
      setIsScrapped(!next)
      setPost((prevPost) =>
        prevPost ? { ...prevPost, scrap: !next } : prevPost
      )

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
        <div className="post-detail-container">
          <h1 className="board-title">자유 게시판</h1>
          <div className="post-box">불러오는 중...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <HomeBar />
      <div className="post-detail-container">
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
            profileImageUrl={post.profileImageUrl}
            isBookmarked={isScrapped}
            onToggleBookmark={handleScrapToggle}
            isAuthor={isAuthor}
            onEdit={() => navigate(`/free/edit/${post.id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowPostReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="post-box">
            {post && (
              <>
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
              </>
            )}
          </div>

          <div className="flow-root pb-0 mt-0">
            {/* 댓글 목록 */}
            {post && (
              <CommentList
                comments={comments}
                currentUserNickname={userInfo?.nickname}
                editCommentId={editCommentId}
                onBeginEdit={handleBeginEditComment}
                onCancelEdit={handleCancelEditComment}
                onEdit={handleSaveEditComment}
                onDelete={handleDeleteComment}
                onReport={handleReportCommentOpen}
              />
            )}

            {!editCommentId && (
              <CommentEditor
                value={comment}
                onChange={setComment}
                onSubmit={handleCommentSubmit}
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
          targetId={reportingCommentId!}
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
}

export default FreePostDetail
