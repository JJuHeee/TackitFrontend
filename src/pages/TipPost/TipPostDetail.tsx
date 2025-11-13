import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './TipPostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { toast } from 'react-toastify'
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
  scrap?: boolean // ✅ 스크랩 여부 추가
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
          toast.error('게시글을 찾지 못했습니다.')
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
          scrap: !!item.scrap, // ✅ 백엔드 scrap 값 반영
        }

        setPost(normalized)
        setIsScrapped(!!normalized.scrap) // ✅ 처음 들어올 때 상태 세팅
      } catch {
        // 더미
        const dummy: Post = {
          id: Number(id) || 0,
          writer: 'senior',
          title: '회의록 정리 팁 – 핵심만 빠르게!',
          content:
            '회의 중에 모든 걸 기록하기보다, 결정사항과 담당자 중심으로 메모하세요. 나중에 공유할 때 훨씬 명확해집니다.',
          tags: ['업무팁'],
          createdAt: '2025-06-19T00:02:53.52603',
          imageUrl: null,
          type: 'Tip',
          scrap: false, // ✅ 더미는 기본 false
        }
        setPost(dummy)
        setIsScrapped(false) // ✅ 안전하게 false로 초기화
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
      toast.success('게시글이 삭제되었습니다.')
      navigate('/tip')
    } catch {
      toast.error('게시글 삭제에 실패했습니다.')
    }
  }

  const handleReportPost = async (p?: ReportPayload) => {
    try {
      const reasonToUse = p?.reason || reportReason
      if (!reasonToUse) {
        alert('신고 사유를 선택해주세요.')
        return
      }
      await api.post(`/reports/create`, {
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
        toast.success('게시글이 신고되었습니다.')
        setShowReportModal(false)
        setReportReason('')
      } else if (message === '이미 신고한 게시글입니다.') {
        toast.info('이미 신고한 게시글입니다.')
      } else {
        toast.info(message || '신고가 접수되었습니다.')
      }
    } catch (err) {
      console.error('게시글 신고 실패:', err)
      toast.error('신고 처리에 실패했습니다.')
    }
  }

  // ✅ 알림 없이, 눌렀을 때 바로 색만 바꾸는 낙관적 스크랩 토글
  const handleScrapToggle = async () => {
    // 1) UI 먼저 토글 (즉시 색 변경)
    setIsScrapped((prev) => !prev)
    setPost((prev) => (prev ? { ...prev, scrap: !prev.scrap } : prev))

    try {
      // 2) 서버에 실제 요청
      await api.post(`/api/tip-posts/${id}/scrap`)
    } catch {
      // 3) 실패 시 상태 롤백 + 에러만 알림
      setIsScrapped((prev) => !prev)
      setPost((prev) => (prev ? { ...prev, scrap: !prev.scrap } : prev))
      toast.error('찜 처리에 실패했습니다.')
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
        <div className="tippost-detail-container">
          <h1 className="board-title">선임자의 TIP</h1>
          <div className="tippost-box">불러오는 중...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <HomeBar />
      <div className="tippost-detail-container">
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
            isBookmarked={isScrapped} // ✅ 현재 스크랩 상태 반영
            onToggleBookmark={handleScrapToggle}
            isAuthor={isAuthor}
            onEdit={() => navigate(`/tip/edit/${post.id}`)}
            onDelete={handleDeletePost}
            onReport={() => setShowReportModal(true)}
          />
        )}

        <div className="mt-12">
          <div className="tippost-box">
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
