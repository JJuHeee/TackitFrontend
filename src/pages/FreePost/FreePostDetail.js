import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './FreePostDetail.css';
import HomeBar from '../../components/HomeBar';
import api from '../../api/api';
import useFetchUserInfo from '../../hooks/useFetchUserInfo';
import { toast } from 'react-toastify';

function FreePostDetail() {
  const textareaRef = useRef(null);
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const postIdNumber = parseInt(id); 
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [isScrapped, setIsScrapped] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const { userInfo } = useFetchUserInfo();

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      toast.error('유효하지 않은 게시글 ID입니다.');
      navigate('/free');
      return;
    }
  
    const fetchPost = async () => {
      try {
        const res = await api.get(`free-posts/${id}`);
        setPost(res.data);
      } catch (err) {
        toast.error('게시글을 불러오는 데 실패했습니다.');
      }
    };
  
    fetchPost();
  }, [id, navigate]); 


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`free-comments/${id}`);
        setComments(res.data);
      } catch (err) {
        setComments([
          { id: 1, writer: '기본값', content: '댓글 내용입니다.', createdAt: '2025-05-12T20:06:42.621605' },
          { id: 2, writer: 'test', content: '댓글 내용입니다. 2', createdAt: '2025-05-12T20:08:11.738681' },
        ]);
      }
    };
    fetchComments();
  }, [id]);

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`free-comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('댓글이 삭제되었습니다.');
    } catch (err) {
      toast.error('댓글 삭제에 실패했습니다.');
    }
  };

  const handleReportComment = async (commentId) => {
    const confirmed = window.confirm('정말 이 댓글을 신고하시겠습니까?');
    if (!confirmed) return;
  
    try {
      await api.post(`free-comments/${commentId}/report`);
      toast.success('댓글을 신고하였습니다.');
    } catch (err) {
      console.error('댓글 신고 실패:', err);
      toast.error('이미 삭제된 댓글입니다.');
    }
  };

  const handleEditComment = (comment) => {
    setComment(comment.content);
    setEditCommentId(comment.id);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleCommentSubmit = async () => {
    const trimmed = comment.trim();

    if (!trimmed) {
      alert('댓글을 입력해주세요.');
      return;
    }
  
    if (trimmed.length > 251) {
      alert('댓글은 최대 250자까지 작성할 수 있어요.');
      return;
    }
  
    try {
      if (editCommentId) {
        const res = await api.patch(`free-comments/${editCommentId}`, { content: trimmed });
        setComments(prev => prev.map(c => (c.id === editCommentId ? res.data : c)));
        toast.success('댓글이 수정되었습니다.');
      } else {
        const res = await api.post('free-comments', {
          freePostId: postIdNumber,
          content: trimmed,
        });
        setComments(prev => [res.data, ...prev]);
        toast.success('댓글이 등록되었습니다.');
      }
  
      setComment('');
      setEditCommentId(null);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
  
    } catch (err) {
      toast.error('댓글 처리에 실패했습니다.');
    }
  };
  

  const handleDeletePost = async () => {
    const confirmed = window.confirm('이 글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await api.delete(`/free-posts/${id}`);
      toast.success('게시글이 삭제되었습니다.');
      if (from === 'my-posts') {
        navigate('/free');
      } else {
        navigate('/free');
      }
    } catch (err) {
      toast.error('게시글 삭제에 실패했습니다.');
    }
  };

  const handleReportPost = async () => {
    if (!reportReason) {
      alert('신고 사유를 선택해주세요.');
      return;
    }
    try {
      const res = await api.post(`/free-posts/${id}/report`);
      const message = res.data;

      if (message === '게시글을 신고하였습니다.') {
        toast.success('게시글이 신고되었습니다.');
        setShowReportModal(false);
        setReportReason('');
      } else if (message === '이미 신고한 게시글입니다.') {
        toast.info('이미 신고한 게시글입니다.');
      } else {
        toast.info(message); // 예상치 못한 메시지 대응
      }
    } catch (err) {
      toast.error('신고 처리에 실패했습니다.');
    }
  };

  const handleScrapToggle = async () => {
    try {
      const res = await api.post(`/free-posts/${id}/scrap`);
  
      const message = res.data; 
  
      if (message === "게시글을 스크랩하였습니다.") {
        setIsScrapped(true);
        toast.success("찜 되었습니다.");
      } else if (message === "게시글 스크랩을 취소하였습니다.") {
        setIsScrapped(false);
        toast.info("찜이 취소되었습니다.");
      } else {
        toast.info(message);
      }
    } catch (err) {
      const status = err.response?.status;
      const retryFlag = err.config?._retry;
    
      if (status === 401 && retryFlag) {
        toast.error("세션이 만료되어 찜 요청에 실패했습니다.");
      } else {
        toast.error("찜 처리에 실패했습니다.");
      }
    }
    
  };
  

  return (
    <>
      <HomeBar />
      <div className="freepost-detail-container">
        <h1 className="board-title" onClick={() => navigate('/free')}>자유 게시판</h1>

        <div className="freepost-box">
          {post && (
            <>
              <div className="freepost-actions post-actions">
                {userInfo && post.writer === userInfo.nickname ? (
                  <>
                    <button onClick={() => navigate(`/free/edit/${id}`)}>수정하기</button>
                    <button onClick={handleDeletePost}>삭제하기</button>
                  </>
                ) : userInfo && (
                  <button onClick={() => setShowReportModal(true)}>신고하기</button>
                )}
              </div>

              <h1 className="detail-title">{post.title}</h1>

              <div className="detail-meta">
              <span className="nickname">{post.writer}</span>
                <span>{new Date(post.createdAt).toLocaleString('ko-KR')}</span>
                <span className="tags">
                  {Array.isArray(post.tags)
                    ? post.tags.map((tag, i) => `#${tag}`).join(' ')
                    : ''}
                </span>
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

        <div className="comment-list">
          <h3 className="comment-title">댓글 {comments.length}개</h3>
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{c.writer}</strong> · <span>{new Date(c.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <div className="freepost-actions">
                  {c.writer === userInfo.nickname && editCommentId !== c.id ? (
                    <>
                      <span className="comment-action" onClick={() => handleEditComment(c)}>수정하기</span>
                      <span className="comment-action" onClick={() => handleDeleteComment(c.id)}>삭제하기</span>
                    </>
                  ) : null}
                  {c.writer !== userInfo.nickname ? (
                    <span className="comment-action" onClick={() => handleReportComment(c.id)}>신고하기</span>
                  ) : null}
                </div>
              </div>
              <p className="comment-text" style={{ whiteSpace: 'pre-line' }}>{c.content}</p>
            </div>
          ))}
        </div>

        <div className="comment-wrapper">
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={editCommentId ? '댓글을 수정하세요.' : '자유롭게 답변을 작성해주세요.'}
              className="floating-textarea"
            />
            <div className="button-float-layer">
              <button className="floating-button" onClick={handleCommentSubmit}>
                {editCommentId ? '수정 완료' : '답글 등록'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>신고 사유를 선택해주세요</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">신고 사유를 선택해주세요.</option>
              <option value="광고/홍보">광고 및 홍보성 게시물</option>
              <option value="도배/중복">중복 또는 도배성 게시물</option>
              <option value="허위정보">허위 정보 또는 사실 왜곡</option>
              <option value="게시판 부적절">게시판 주제와 관련 없는 내용</option>
              <option value="기타">기타</option>
            </select>

            <div className="modal-buttons">
              <button onClick={handleReportPost}>확인</button>
              <button onClick={() => setShowReportModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default FreePostDetail;
