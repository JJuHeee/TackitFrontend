import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './QnaPostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { toast } from 'react-toastify'

/** 서버에서 리스트로 내려오는 QnA 아이템 타입 */
type QnaListItem = {
  postId: number
  title: string
  content: string
  createdAt: string
  tags: string[]
  type?: 'QnA' | 'Free' | 'Tip'
  imageUrl?: string | null
  writer?: string | null
}

/** 페이지네이션 응답 타입 */
type QnaListResponse = {
  page: number
  content: QnaListItem[]
  size: number
  totalElements: number
  totalPages: number
}

/** 상세 화면에서 사용할 정규화된 Post 타입 */
type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl: string | null
  type: 'QnA' | 'Free' | 'Tip'
}

type CommentItem = {
  id: number
  writer: string
  content: string
  createdAt: string
}

function QnaPostDetail() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()

  const postIdNumber = Number(postId)
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [comment, setComment] = useState('')
  const [editCommentId, setEditCommentId] = useState<number | null>(null)
  const [isScrapped, setIsScrapped] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const { userInfo } = useFetchUserInfo()

  // 게시글 불러오기: 페이지네이션 응답 → 첫 아이템 매핑
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get<QnaListResponse>(`/api/qna-post/${postId}`)
        const item = Array.isArray(res.data?.content)
          ? res.data.content[0]
          : null
        if (!item) {
          toast.error('게시글을 찾지 못했습니다.')
          setPost(null)
          return
        }
        const normalized: Post = {
          id: item.postId,
          writer: item.writer ?? '(알 수 없음)',
          title: item.title,
          content: item.content ?? '',
          tags: Array.isArray(item.tags) ? item.tags : [],
          createdAt: item.createdAt,
          imageUrl: item.imageUrl ?? null,
          type: (item.type as Post['type']) ?? 'QnA',
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
          type: 'QnA',
        })
      }
    }
    if (postId) fetchPost()
  }, [postId, postIdNumber])

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get<CommentItem[]>(`/api/qna-comment/${postId}`)
        setComments(res.data)
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

  // 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/api/qna-comment/${commentId}`)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('댓글이 삭제되었습니다.')
    } catch {
      toast.error('댓글 삭제에 실패했습니다.')
    }
  }

  const handleReportComment = async (commentId: number) => {
    const confirmed = window.confirm('정말 이 댓글을 신고하시겠습니까?')
    if (!confirmed) return
    try {
      await api.post(`/api/qna-comment/${commentId}/report`)
      toast.success('댓글을 신고하였습니다.')
    } catch (err) {
      console.error('댓글 신고 실패:', err)
      toast.error('이미 삭제된 댓글입니다.')
    }
  }

  const handleEditComment = (c: CommentItem) => {
    setComment(c.content)
    setEditCommentId(c.id)
    textareaRef.current?.focus()
  }

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim()
    if (!trimmed) {
      alert('댓글을 입력해주세요.')
      return
    }
    if (trimmed.length > 250) {
      alert('댓글은 최대 250자까지 작성할 수 있어요.')
      return
    }

    try {
      if (editCommentId) {
        const res = await api.patch<CommentItem>(
          `/api/qna-comment/${editCommentId}`,
          {
            content: trimmed,
          }
        )
        setComments((prev) =>
          prev.map((c) => (c.id === editCommentId ? res.data : c))
        )
        toast.success('댓글이 수정되었습니다.')
      } else {
        const res = await api.post<CommentItem>('/api/qna-comment/create', {
          qnaPostId: postIdNumber,
          content: trimmed,
        })
        setComments((prev) => [res.data, ...prev])
        toast.success('댓글이 등록되었습니다.')
      }

      setComment('')
      setEditCommentId(null)
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    } catch {
      toast.error('댓글 처리에 실패했습니다.')
    }
  }

  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return
    try {
      await api.delete(`/api/qna-post/${postId}`)
      toast.success('게시글이 삭제되었습니다.')
      navigate('/qna')
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
        targetId: postIdNumber,
        targetType: 'POST',
        reason: reportReason,
      })
      const res = await api.post<{ message?: string } | string>(
        `/api/qna-post/${postId}/report`
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
      const res = await api.post<{ scrapped?: boolean }>(
        `/api/qna-post/${postId}/scrap`
      )
      const scrapped = !!res.data?.scrapped
      setIsScrapped(scrapped)
      toast[scrapped ? 'success' : 'info'](
        scrapped ? '찜 되었습니다.' : '찜이 취소되었습니다.'
      )
    } catch {
      toast.error('찜 처리에 실패했습니다.')
    }
  }

  const isAuthor = !!(
    userInfo?.nickname &&
    post &&
    post.writer === userInfo.nickname
  )

  return (
    <>
      <HomeBar />
      <div className="qnapost-detail-container">
        <h1 className="board-title" onClick={() => navigate('/qna')}>
          질문 게시판
        </h1>

        <div className="qnapost-box">
          {post && (
            <>
              <div className="qnapost-actions post-actions">
                {isAuthor ? (
                  <>
                    <button onClick={() => navigate(`/qna/edit/${postId}`)}>
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

              {/* 첨부 이미지 */}
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
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ) : null}

              <div className="detail-content">
                {String(post.content || '')
                  .split('\n')
                  .map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
              </div>

              <button className="bookmark-button" onClick={handleScrapToggle}>
                {isScrapped ? '찜 취소' : '찜'}
              </button>
            </>
          )}
        </div>

        <div className="comment-list">
          <h3 className="comment-title">댓글 {comments.length}개</h3>
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div
                className="comment-meta"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{c.writer || '(알 수 없음)'}</strong> ·{' '}
                  <span>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString('ko-KR')
                      : '-'}
                  </span>
                </div>
                <div className="qnapost-actions">
                  {userInfo?.nickname === c.writer && editCommentId !== c.id ? (
                    <>
                      <span
                        className="comment-action"
                        onClick={() => handleEditComment(c)}
                      >
                        수정하기
                      </span>
                      <span
                        className="comment-action"
                        onClick={() => handleDeleteComment(c.id)}
                      >
                        삭제하기
                      </span>
                    </>
                  ) : null}
                  {userInfo?.nickname !== c.writer ? (
                    <span
                      className="comment-action"
                      onClick={() => handleReportComment(c.id)}
                    >
                      신고하기
                    </span>
                  ) : null}
                </div>
              </div>
              <p className="comment-text" style={{ whiteSpace: 'pre-line' }}>
                {c.content}
              </p>
            </div>
          ))}
        </div>

        {/* 선배만 답변 가능 조건 유지 */}
        {userInfo?.yearsOfService !== undefined &&
          userInfo.yearsOfService >= 2 && (
            <div className="comment-wrapper">
              <div className="textarea-wrapper">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    editCommentId
                      ? '댓글을 수정하세요.'
                      : '질문에 대한 답변을 작성해주세요.'
                  }
                  className="floating-textarea"
                />
                <div className="button-float-layer">
                  <button
                    className="floating-button"
                    onClick={handleCommentSubmit}
                  >
                    {editCommentId ? '수정 완료' : '답글 등록'}
                  </button>
                </div>
              </div>
            </div>
          )}
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

export default QnaPostDetail
