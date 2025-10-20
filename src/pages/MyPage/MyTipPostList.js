import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './PostPageList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'

function MyTipPostList() {
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
          title: '2025/05/29',
          content: '팁 ) 목요일 날씨 모름',
          type: 'Tip',
          createdAt: '2025-05-29T00:06:18.536322',
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
        `/api/mypage/tip-posts?page=${
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
        <h1>선임자의 TIP 내가 쓴 글</h1>
        <p>마이페이지 &gt; 선임자의 TIP 내가 쓴 글 보기</p>
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
                navigate(`/tip/${post.postId}`, { state: { from: 'my-posts' } })
              } // ✅ id → postId
            >
              <div className="post-meta">
                <span className="date">
                  {new Date(post.createdAt).toLocaleString('ko-KR')}
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

export default MyTipPostList
