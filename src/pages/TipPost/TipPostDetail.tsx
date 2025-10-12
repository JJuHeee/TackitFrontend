import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './TipPostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { toast } from 'react-toastify'

type TipListItem = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  type: 'Tip' | 'QnA' | 'Free'
  createdAt: string
  imageUrl?: string | null
}

type TipListResponse = {
  page: number
  content: TipListItem[]
  size: number
  totalElements: number
  totalPages: number
}

type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl: string | null
  type: 'Tip' | 'QnA' | 'Free'
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
        // ✅ 페이지네이션 응답으로 오기 때문에 TipListResponse로 받음
        const res = await api.get<TipListResponse>(`/api/tip-posts/${id}`)
        const item = res.data?.content?.[0]
        if (!item) {
          toast.error('게시글을 찾지 못했습니다.')
          setPost(null)
          return
        }
        // ✅ 상세에서 쓰기 좋게 정규화
        const normalized: Post = {
          id: item.id,
          writer: item.writer ?? '(알 수 없음)',
          title: item.title,
          content: item.content ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.createdAt,
          imageUrl: item.imageUrl ?? null,
          type: item.type ?? 'Tip',
        }
        setPost(normalized)
      } catch {
        // 더미
        setPost({
          id: Number(id) || 0,
          writer: 'senior',
          title: '회의록 정리 팁 – 핵심만 빠르게!',
          content:
            '회의 중에 모든 걸 기록하기보다, 결정사항과 담당자 중심으로 메모하세요. 나중에 공유할 때 훨씬 명확해집니다.',
          tags: ['업무팁'],
          createdAt: '2025-06-19T00:02:53.52603',
          imageUrl: null,
          type: 'Tip',
        })
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

  const handleReportPost = async () => {
    if (!reportReason) {
      alert('신고 사유를 선택해주세요.')
      return
    }
    try {
      await api.post(`/reports/create`, {
        targetId: Number(id),
        targetType: 'POST',
        reason: reportReason,
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

  const handleScrapToggle = async () => {
    try {
      const res = await api.post<
        string | { scrapped?: boolean; message?: string }
      >(`/api/tip-posts/${id}/scrap`)
      if (typeof res.data === 'object' && res.data && 'scrapped' in res.data) {
        const scrapped = !!res.data.scrapped
        setIsScrapped(scrapped)
        toast[scrapped ? 'success' : 'info'](
          scrapped ? '찜 되었습니다.' : '찜이 취소되었습니다.'
        )
        return
      }
      const message = String(res.data)
      if (message.includes('스크랩하였습니다')) {
        setIsScrapped(true)
        toast.success('찜 되었습니다.')
      } else if (message.includes('취소하였습니다')) {
        setIsScrapped(false)
        toast.info('찜이 취소되었습니다.')
      } else {
        toast.info(message)
      }
    } catch {
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
        <h1 className="board-title" onClick={() => navigate('/tip')}>
          선임자의 TIP
        </h1>

        <div className="tippost-box">
          {post && (
            <>
              <div className="tippost-actions post-actions">
                {isAuthor ? (
                  <>
                    <button onClick={() => navigate(`/tip/edit/${id}`)}>
                      수정하기
                    </button>
                    <button onClick={handleDeletePost}>삭제하기</button>
                  </>
                ) : (
                  userInfo && (
                    <button onClick={() => setShowReportModal(true)}>
                      신고하기
                    </button>
                  )
                )}
              </div>

              <h1 className="detail-title">{post.title}</h1>

              <div className="detail-meta">
                <span className="nickname">
                  {post.writer || '(알 수 없음)'}
                </span>
                <span>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleString('ko-KR')
                    : '-'}
                </span>
                <span className="tags">
                  {Array.isArray(post.tags) && post.tags.length > 0
                    ? post.tags.map((t) => `#${t}`).join(' ')
                    : ''}
                </span>
              </div>

              {post.imageUrl ? (
                <div className="detail-image">
                  <img
                    src={post.imageUrl}
                    alt="게시글 이미지"
                    style={{
                      maxWidth: '100%',
                      borderRadius: 8,
                      margin: '16px 0',
                    }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display =
                        'none'
                    }}
                  />
                </div>
              ) : null}

              <div className="detail-content">
                {String(post.content ?? '')
                  .split('\n')
                  .map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
              </div>

              <button
                className="bookmark-button"
                aria-pressed={isScrapped}
                onClick={handleScrapToggle}
              >
                {isScrapped ? '찜 취소' : '찜'}
              </button>
            </>
          )}
        </div>
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>신고 사유를 선택해주세요.</h3>
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

export default TipPostDetail
