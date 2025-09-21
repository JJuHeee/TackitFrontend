import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './TipPostDetail.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import { toast } from 'react-toastify'

function TipPostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [post, setPost] = useState(null)
  const [isScrapped, setIsScrapped] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const { userInfo } = useFetchUserInfo()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/tip-posts/${id}`)
        setPost(res.data)
      } catch (err) {
        setPost({
          writer: 'senior',
          title: '회의록 정리 팁 – 핵심만 빠르게!',
          content:
            '회의 중에 모든 걸 기록하기보다, 결정사항과 담당자 중심으로 메모하세요. 나중에 공유할 때 훨씬 명확해집니다.',
          createdAt: '2025-06-19T00:02:53.52603',
        })
      }
    }
    fetchPost()
  }, [id])

  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?')
    if (!confirmed) return

    try {
      await api.delete(`/api/tip-posts/${id}`)
      toast.success('게시글이 삭제되었습니다.')
      if (from === 'my-posts') {
        navigate('/tip')
      } else {
        navigate('/tip')
      }
    } catch (err) {
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
        targetId: id,
        targetType: 'POST',
        reason: reportReason,
      })
      const res = await api.post(`/api/tip-posts/${id}/report`)
      const message =
        typeof res.data === 'string' ? res.data : res.data?.message

      if (message === '게시글을 신고하였습니다.') {
        toast.success('게시글이 신고되었습니다.')
        setShowReportModal(false)
        setReportReason('')
      } else if (message === '이미 신고한 게시글입니다.') {
        toast.info('이미 신고한 게시글입니다.')
      } else {
        toast.info(message)
      }
    } catch (err) {
      console.error('게시글 신고 실패:', err)
      toast.error('신고 처리에 실패했습니다.')
    }
  }

  const handleScrapToggle = async () => {
    try {
      const res = await api.post(`/api/tip-posts/${id}/scrap`)
      const message = res.data

      if (typeof message === 'string') {
        if (message.includes('스크랩하였습니다')) {
          setIsScrapped(true)
          toast.success('찜 되었습니다.')
        } else if (message.includes('취소하였습니다')) {
          setIsScrapped(false)
          toast.info('찜이 취소되었습니다.')
        } else {
          toast.info(message)
        }
      } else {
        toast.error('예상하지 못한 응답입니다.')
      }
    } catch (err) {
      toast.error('찜 처리에 실패했습니다.')
    }
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
                {userInfo && post.writer === userInfo.nickname ? (
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
                <span className="nickname">{post.writer}</span>
                <span>{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              <div className="detail-content">
                {post.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>
              <button className="bookmark-button" onClick={handleScrapToggle}>
                찜
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
