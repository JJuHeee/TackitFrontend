import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TipPostList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import useFetchUserInfo from '../../hooks/useFetchUserInfo'
import Footer from '../../components/layouts/Footer'

const fallbackResponse = {
  page: 0,
  content: [
    {
      id: 2,
      writer: '기본값',
      title: '요즘 날씨 너무 좋지 않나요?',
      content:
        ' 코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!',
      tags: ['일상', '산책', '추천'],
      createdAt: '2025-05-26T00:49:09.773772',
    },
    {
      id: 1,
      writer: 'test',
      title: '프론트엔드 스터디 같이 하실 분!',
      content:
        '안녕하세요.\n오늘은 날씨가 정말 좋네요!\n\n내일은 비가 온다고 합니다.',
      tags: ['스터디', '프론트엔드', 'React', '모집'],
      createdAt: '2025-05-26T00:47:58.054746',
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

function TipPostList() {
  const navigate = useNavigate()
  const [tagList, setTagList] = useState([])
  const [selectedTagId, setSelectedTagId] = useState(null)
  const [posts, setPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const { userInfo } = useFetchUserInfo()

  const postsPerPage = 5
  const pageGroupSize = 5

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/api/tip-tags/list')
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = selectedTagId
          ? `/api/tip-tags/${selectedTagId}/posts?page=${currentPage}&size=5&sort=createdAt,desc`
          : `/api/tip-posts?page=${currentPage}&size=5&sort=createdAt,desc`

        const res = await api.get(url)
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
      <div className="tippost-banner">
        <h1>선임자의 TIP</h1>
        <p>Home &gt; 선임자의 TIP</p>
      </div>

      <div className="tippost-container">
        <div className="tippost-subtext-wrapper">
          <div className="tippost-subtext">
            <img
              src="/warning.svg"
              alt="경고 아이콘"
              className="warning-icon"
            />
            "선임자의 TIP"은 선배 사원만 글을 작성할 수 있으며, 신입 사원은
            열람만 가능합니다.
          </div>
        </div>

        <div className="tippost-tags">
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

          <button
            className="write-button"
            onClick={() => navigate('/tip/write')}
          >
            글쓰기
          </button>
        </div>

        <div className="tippost-list">
          {posts.length === 0 ? (
            <div className="no-result">게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/tip/${post.id}`)}
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

export default TipPostList
