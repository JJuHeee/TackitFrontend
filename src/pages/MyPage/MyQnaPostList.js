import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './PostPageList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'

function MyQnaPostList() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortOrder, setSortOrder] = useState('desc')

  const postsPerPage = 5
  const pageGroupSize = 5

  const fetchPosts = useCallback(async () => {
    const fallbackResponse = {
      page: 0,
      content: [
        {
          postId: 1,
          title: '본문1 33제목',
          content:
            '안녕하세요.\n오늘은 날씨가 정말 좋네요!\n\n내일은 비가 온다고 합니다.',
          createdAt: '2025-05-26T01:31:23.129942',
          tags: ['태그3'],
          type: 'QnA',
        },
      ],
      size: 5,
      totalElements: 1,
      totalPages: 1,
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('No token found')

      const response = await api.get(
        `/api/mypage/qna-posts?page=${
          currentPage - 1
        }&size=${postsPerPage}&sort=createdAt,${sortOrder}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const { content, totalPages } = response.data
      setPosts(content)
      setTotalPages(totalPages)
    } catch (error) {
      const { content, totalPages } = fallbackResponse
      setPosts(content)
      setTotalPages(totalPages)
    }
  }, [currentPage, sortOrder])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize)
  const startPage = currentGroup * pageGroupSize + 1
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages)

  const goToPage = (pageNum) => setCurrentPage(pageNum)
  const goToPrevGroup = () => {
    const prev = startPage - 1
    if (prev > 0) setCurrentPage(prev)
  }
  const goToNextGroup = () => {
    const next = endPage + 1
    if (next <= totalPages) setCurrentPage(next)
  }

  const handleSortChange = (e) => {
    setSortOrder(e.target.value)
    setCurrentPage(1)
  }

  return (
    <>
      <HomeBar />

      <div className="freepost-banner">
        <h1>질문게시판 내가 쓴 글</h1>
        <p>마이페이지 &gt; 질문게시판 내가 쓴 글 보기</p>
      </div>

      <div className="freepost-container">
        <div className="sort-dropdown-container">
          <label htmlFor="sortOrder" className="sort-label">
            {' '}
          </label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </select>
        </div>

        <div className="freepost-list">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="post-card"
              onClick={() =>
                navigate(`/qna/${post.postId}`, { state: { from: 'my-posts' } })
              }
            >
              <div className="post-meta">
                <span className="date">
                  {new Date(post.createdAt).toLocaleString('ko-KR')}
                </span>
                <span className="tags">
                  {post.tags &&
                    post.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        #{tag}{' '}
                      </span>
                    ))}
                </span>
              </div>
              <div className="post-title">{post.title}</div>
              <div className="post-content-preview">
                {post.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
                {post.content.length >= 100 && '...'}
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button
            onClick={goToPrevGroup}
            disabled={startPage === 1}
            className="page-btn"
          >
            &laquo;
          </button>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((pageNum) => (
            <button
              key={pageNum}
              className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => goToPage(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={goToNextGroup}
            disabled={endPage === totalPages}
            className="page-btn"
          >
            &raquo;
          </button>
        </div>
      </div>
    </>
  )
}

export default MyQnaPostList
