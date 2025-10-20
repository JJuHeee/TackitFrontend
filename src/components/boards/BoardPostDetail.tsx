import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HomeBar from '../HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { sanitizeHtml } from '../../utils/sanitize'
import { hydrateCoverToken } from '../../utils/coverToken'
import CommentList from '../comments/CommentList'
import CommentEditor from '../comments/CommentEditor'
import type { CommentModel } from '../comments/CommentItem'
import ReportModal from '../modals/ReportModal'
import type { ReportPayload } from '../modals/ReportModal'
import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'
import PostHeader from '../posts/PostHeader'

type PostDto = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
}

type ApiShape = {
  // 게시글
  postDetail: (postId: number | string) => string
  deletePost: (postId: number | string) => string
  reportPost: (postId: number | string) => string
  scrapToggle: (postId: number | string) => string

  // 댓글
  listComments: (postId: number | string) => string
  createComment: () => string // body: { <board>PostId, content }
  editComment: (commentId: number | string) => string
  deleteComment: (commentId: number | string) => string
  reportComment: (commentId: number | string) => string
  // createComment 시, 게시글 id 필드명(백엔드가 freePostId / qnaPostId / tipPostId 등 다를 때)
  createCommentPostIdKey: string
}

type RoutesShape = {
  backToList: string // 예) '/free'
  editBasePath: string // 예) '/free/edit'  (최종 이동은 `${editBasePath}/${post.id}`)
}

type Props = {
  boardName: string // 헤더/타이틀 용 문자열
  apis: ApiShape
  routes: RoutesShape
}

export default function BoardPostDetail({ boardName, apis, routes }: Props) {
  const { id } = useParams<{ id: string }>()
  const postIdNumber = Number(id)
  const navigate = useNavigate()
  const { userInfo } = useFetchUserInfo()

  const [post, setPost] = useState<PostDto | null>(null)
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

  // 댓글 normalize
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

  // 게시글 로딩
  useEffect(() => {
    if (!id || Number.isNaN(Number(id))) {
      toastError('유효하지 않은 게시글 ID입니다.')
      navigate(routes.backToList)
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get(apis.postDetail(id!))
        // 백엔드 모양새가 다양할 수 있어 안전하게 pick
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

        const normalized: PostDto = {
          id: Number(picked.id ?? postIdNumber ?? 0),
          writer: String(picked.writer ?? '(알 수 없음)'),
          title: String(picked.title ?? ''),
          content: String(picked.content ?? ''),
          tags: Array.isArray(picked.tags) ? picked.tags : [],
          createdAt: String(picked.createdAt ?? new Date().toISOString()),
          imageUrl: picked.imageUrl ?? null,
        }
        setPost(normalized)
      } catch {
        toastError('게시글 조회에 실패했습니다.')
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, apis, navigate, routes.backToList, postIdNumber])

  // 댓글 로딩
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return
      try {
        const res = await api.get(apis.listComments(id))
        setComments(normalizeComments(res.data))
      } catch {
        setComments([])
      }
    }
    fetchComments()
  }, [id, apis])

  // 댓글 편집 제어
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
      const res = await api.patch(apis.editComment(id), { content: trimmed })
      setComments((prev) => prev.map((c) => (c.id === id ? res.data : c)))
      toastSuccess('댓글이 수정되었습니다.')
      setEditCommentId(null)
    } catch {
      toastError('댓글 수정에 실패했습니다.')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(apis.deleteComment(commentId))
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toastSuccess('댓글이 삭제되었습니다.')
    } catch {
      toastError('댓글 삭제에 실패했습니다.')
    }
  }

  const handleReportCommentOpen = (commentId: number) => {
    setReportingCommentId(commentId)
    setShowCommentReportModal(true)
  }

  const handleCommentSubmit = async () => {
    if (!id) return
    const trimmed = comment.trim()
    if (!trimmed) return toastWarn('댓글을 입력해주세요.')
    if (trimmed.length > 250)
      return toastWarn('댓글은 최대 250자까지 작성할 수 있어요.')
    try {
      // 게시글 id 필드명이 보드별로 달라서 동적으로 구성
      const body: Record<string, any> = { content: trimmed }
      body[apis.createCommentPostIdKey] = Number(id)
      const res = await api.post(apis.createComment(), body)
      setComments((prev) => [...prev, res.data])
      setComment('')
      toastSuccess('댓글이 등록되었습니다.')
    } catch {
      toastError('댓글 등록에 실패했습니다.')
    }
  }

  // 게시글 삭제
  const handleDeletePost = async () => {
    if (!id) return
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return
    try {
      await api.delete(apis.deletePost(id))
      toastSuccess('게시글이 삭제되었습니다.')
      navigate(routes.backToList)
    } catch {
      toastError('게시글 삭제에 실패했습니다.')
    }
  }

  // 게시글 신고
  const handleSubmitPostReport = async (p: ReportPayload) => {
    if (!id || p.targetType !== 'POST') return
    try {
      await api.post('/reports/create', {
        targetId: p.targetId,
        targetType: p.targetType,
        reason: p.reason,
      })
      const res = await api.post(apis.reportPost(id))
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

  // 댓글 신고
  const handleSubmitCommentReport = async (p: ReportPayload) => {
    if (p.targetType !== 'COMMENT') return
    try {
      await api.post('/reports/create', {
        targetId: p.targetId,
        targetType: p.targetType,
        reason: p.reason,
      })
      await api.post(apis.reportComment(p.targetId))
      toastSuccess('신고처리가 완료되었습니다.')
      setShowCommentReportModal(false)
      setReportingCommentId(null)
    } catch {
      toastError('댓글 신고 처리에 실패했습니다.')
    }
  }

  // 스크랩
  const handleScrapToggle = async () => {
    if (!id) return
    try {
      const res = await api.post(apis.scrapToggle(id))
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
    } catch {
      toastError('찜 처리에 실패했습니다.')
    }
  }

  const isAuthor = !!(userInfo && post && post.writer === userInfo.nickname)

  if (loading) {
    return (
      <>
        <HomeBar />
        <div className="freepost-detail-container">
          <h1 className="free-board-title">{boardName}</h1>
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
          onClick={() => navigate(routes.backToList)}
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
            onEdit={() => navigate(`${routes.editBasePath}/${post.id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowPostReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="freepost-box">
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

      {showPostReportModal && (
        <ReportModal
          isOpen={showPostReportModal}
          targetId={postIdNumber}
          targetType="POST"
          onClose={() => setShowPostReportModal(false)}
          onSubmit={handleSubmitPostReport}
        />
      )}

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
