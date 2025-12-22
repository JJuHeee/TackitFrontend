import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import '../../components/posts/PostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import {
  toastSuccess,
  toastWarn,
  toastError,
  toastInfo,
} from '../../utils/toast'
import PostHeader from '../../components/posts/PostHeader'
import ReportModal from '../../components/modals/ReportModal'
import type { ReportPayload } from '../../components/modals/ReportModal'
import { sanitizeHtml } from '../../utils/sanitize'
import { hydrateCoverToken } from '../../utils/coverToken'

type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl: string | null
  type: 'Tip' | 'QnA' | 'Free'
  scrap?: boolean
  profileImageUrl?: string | null
}

function TipPostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { userInfo } = useFetchUserInfo()

  const [post, setPost] = useState<Post | null>(null)
  const [isScrapped, setIsScrapped] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const res = await api.get<any>(`/api/tip-posts/${id}`)
        const item = res.data
        if (!item) {
          toastWarn('게시글을 찾지 못했습니다.')
          setPost(null)
          return
        }

        const normalized: Post = {
          id: item.id,
          writer: item.writer ?? '(알 수 없음)',
          title: item.title ?? '',
          content: item.content ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.createdAt,
          imageUrl: item.imageUrl ?? null,
          type: item.type ?? 'Tip',
          scrap: !!item.scrap,
          profileImageUrl: item.profileImageUrl ?? null,
        }

        setPost(normalized)
        setIsScrapped(!!normalized.scrap)
      } catch {
        // 더미 시스템성 안내
        const dummy: Post = {
          id: Number(id) || 0,
          writer: 'tackit',
          title: '삭제된 게시글입니다',
          content: `
<h1>삭제된 게시글입니다</h1>
<p>해당 게시글은 작성자 또는 관리자에 의해 <strong>삭제</strong>되었습니다.</p>
<p>더 이상 내용을 확인할 수 없습니다.</p>

<h2>가능한 원인</h2>
<ul>
  <li>작성자가 직접 삭제한 경우</li>
  <li>커뮤니티 운영 정책 위반으로 관리자에 의해 삭제된 경우</li>
</ul>

<h3>다른 글을 확인해보세요</h3>
<p>
게시판 목록으로 이동해 다른 글을 확인할 수 있습니다.<br/>
이용에 불편을 드려 죄송합니다.
</p>
  `,
          tags: [],
          createdAt: new Date().toISOString(),
          imageUrl: null,
          type: 'Tip',
          scrap: false,
          profileImageUrl: null,
        }

        setPost(dummy)
        setIsScrapped(false)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPost()
  }, [id])

  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return
    try {
      await api.delete(`/api/tip-posts/${id}`)
      navigate('/tip')
    } catch {}
  }

  const handleReportPost = async (p?: ReportPayload) => {
    try {
      const reasonToUse = p?.reason || reportReason
      if (!reasonToUse) {
        alert('신고 사유를 선택해주세요.')
        return
      }
      await api.post(`/api/reports/create`, {
        targetId: Number(id),
        targetType: 'TIP_POST',
        reason: reasonToUse,
      })
      const res = await api.post<{ message?: string } | string>(
        `/api/tip-posts/${id}/report`
      )
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message

      if (message === '게시글을 신고하였습니다.') {
        toastSuccess('신고 처리가 완료되었습니다.')
        setShowReportModal(false)
        setReportReason('')
      } else if (message === '이미 신고한 게시글입니다.') {
        toastInfo('이미 신고한 게시글입니다.')
      } else {
        toastInfo(message || '신고가 접수되었습니다.')
      }
    } catch (err) {
      console.error('게시글 신고 실패:', err)
      toastError('신고 처리에 실패했습니다.')
    }
  }

  //찜 토글
  const handleScrapToggle = async () => {
    const next = !isScrapped

    setIsScrapped(next)
    setPost((prev) => (prev ? { ...prev, scrap: next } : prev))

    try {
      await api.post(`/api/tip-posts/${id}/scrap`)

      if (next) {
        toastSuccess('게시물이 스크랩되었습니다.')
      }
    } catch {
      setIsScrapped(!next)
      setPost((prev) => (prev ? { ...prev, scrap: !next } : prev))
      toastError('찜 처리에 실패했습니다.')
    }
  }

  const isAuthor = !!(
    userInfo?.nickname &&
    post &&
    post.writer === userInfo.nickname
  )

  if (loading) {
    return (
      <>
        <HomeBar />
        <div className="post-detail-container">
          <h1 className="board-title">선임자의 TIP</h1>
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
          onClick={() => navigate('/tip')}
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
            onEdit={() => navigate(`/tip/edit/${post.id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="post-box">
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
        </div>
      </div>

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          targetId={Number(id)}
          targetType="POST"
          onClose={() => setShowReportModal(false)}
          onSubmit={(p) => handleReportPost(p)}
        />
      )}
    </>
  )
}

export default TipPostDetail
