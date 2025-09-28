import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './QnaPostList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import Footer from '../../components/layouts/Footer'

const fallbackResponse = {
  page: 0,
  content: [
    {
      postId: 2,
      writer: '기본값',
      title: '본문1 33제목',
      content: '내용이이이이입니다5',
      tags: ['태그3'],
      createdAt: '2025-05-26T00:49:09.773772',
    },
    {
      postId: 1,
      writer: 'test',
      title: '본문1 34제목',
      content: '내용이이이이입니다5',
      tags: ['태그3'],
      createdAt: '2025-05-26T00:47:58.054746',
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

function QnaPostList() {
  const navigate = useNavigate()
  const [tagList, setTagList] = useState([])
  const [selectedTagId, setSelectedTagId] = useState(null)
  const [posts, setPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { userInfo } = useFetchUserInfo()

  const pageGroupSize = 5

  // 태그 불러오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/api/qna-tags/list')
        const tagData = Array.isArray(res.data?.content)
          ? res.data.content
          : Array.isArray(res.data)
          ? res.data
          : []

        setTagList(tagData)
      } catch (err) {
        setTagList([
          { id: 2, tagName: '태그2' },
          { id: 3, tagName: '태그3' },
        ])
      }
    }
    fetchTags()
  }, [])

  // 게시글 불러오기 (전체 또는 태그별)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let res
        if (selectedTagId) {
          res = await api.get(
            `/api/qna-tags/${selectedTagId}/posts?page=${currentPage}&size=5&sort=createdAt,desc`
          )
        } else {
          res = await api.get(
            `/api/qna-post/list?page=${currentPage}&size=5&sort=createdAt,desc`
          )
        }
        setPosts(res.data?.content || [])
        setTotalPages(res.data?.totalPages || 0)
      } catch (err) {
        setPosts(fallbackResponse?.content || [])
        setTotalPages(fallbackResponse?.totalPages || 1)
      }
    }
    fetchPosts()
  }, [currentPage, selectedTagId])

  const handleTagClick = (clickedId) => {
    setSelectedTagId((prev) => (prev === clickedId ? null : clickedId))
    setCurrentPage(0)
  }

  const filteredPosts = posts

  const currentGroup = Math.floor(currentPage / pageGroupSize)
  const startPage = currentGroup * pageGroupSize
  const endPage = Math.min(startPage + pageGroupSize, totalPages)

  const goToPage = (page) => setCurrentPage(page)

  return (
    <>
      <HomeBar />
      <div className="qnapost-banner">
        <h1>질문 게시판</h1>
        <p>Home &gt; 질문 게시판</p>
      </div>

      <div className="qnapost-container">
        <div className="qnapost-subtext-wrapper">
          <div className="qnapost-subtext">
            <img
              src="/warning.svg"
              alt="경고 아이콘"
              className="warning-icon"
            />
            “질문 게시판”은 신입은 질문글만 작성할 수 있으며, 선배는 답글만
            작성할 수 있습니다.
          </div>
        </div>

        <div className="qnapost-tags">
          {tagList.map((tag) => (
            <button
              key={tag.id}
              className={`tag-button ${
                selectedTagId === tag.id ? 'active-tag' : ''
              }`}
              onClick={() => handleTagClick(tag.id)}
            >
              #{tag.tagName}
            </button>
          ))}

          {userInfo?.yearsOfService < 2 && (
            <button
              className="write-button"
              onClick={() => navigate('/qna/write')}
            >
              글쓰기
            </button>
          )}
        </div>

        <div className="qnapost-list">
          {filteredPosts.length === 0 ? (
            <div className="no-result">게시글이 없습니다.</div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.postId}
                className="post-card"
                onClick={() => navigate(`/qna/${post.postId}`)}
              >
                <div className="post-meta">
                  <span className="nickname">
                    {post.writer || '(알 수 없음)'}
                  </span>
                  <span className="date">
                    {new Date(post.createdAt).toLocaleString('ko-KR')}
                  </span>
                  <span className="tags">
                    {Array.isArray(post.tags)
                      ? post.tags.map((tag, i) => `#${tag}`).join(' ')
                      : ''}
                  </span>
                </div>
                <div className="post-title">{post.title}</div>
                <div className="post-content-preview">
                  {(() => {
                    const lines = post.content.split('\n')
                    const limitedLines = lines.slice(0, 2)
                    const joined = limitedLines.join('\n').slice(0, 100)

                    return joined.split('\n').map((line, i, arr) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))
                  })()}
                  {(post.content.split('\n').length > 2 ||
                    post.content.length > 100) &&
                    '...'}
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => goToPage(startPage - 1)}
              disabled={startPage === 0}
              className="page-btn"
            >
              &laquo;
            </button>
            {Array.from(
              { length: endPage - startPage },
              (_, i) => startPage + i
            ).map((pageNum) => (
              <button
                key={pageNum}
                className={`page-btn ${
                  currentPage === pageNum ? 'active' : ''
                }`}
                onClick={() => goToPage(pageNum)}
              >
                {pageNum + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(endPage)}
              disabled={endPage >= totalPages}
              className="page-btn"
            >
              &raquo;
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default QnaPostList
