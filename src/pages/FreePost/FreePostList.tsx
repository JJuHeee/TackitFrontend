import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FreePostList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { toast } from 'react-toastify'
import Footer from '../../components/layouts/Footer'
import TagChips from '../../components/TagChips'
import Pagination from '../../components/Pagination'

type Post = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  type: 'Free' | 'Qna' | 'Tip'
  createdAt: string
}

type ListResp = {
  page: number // 0-base
  content: Post[]
  size: number
  totalElements: number
  totalPages: number
}

const fallbackResponse: ListResp = {
  page: 0,
  content: [
    {
      id: 2,
      writer: '기본값',
      title: '요즘 날씨 너무 좋지 않나요?',
      content: ' 코스 있으시면 댓글로 알려주세요!...',
      tags: ['일상', '산책', '추천'],
      createdAt: '2025-05-26T00:49:09.773772',
      type: 'Free',
    },
    {
      id: 1,
      writer: 'test',
      title: '프론트엔드 스터디 같이 하실 분!',
      content:
        '안녕하세요.\n오늘은 날씨가 정말 좋네요!\n\n내일은 비가 온다고 합니다.',
      tags: ['스터디', '프론트엔드', 'React', '모집'],
      createdAt: '2025-05-26T00:47:58.054746',
      type: 'Free',
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

function FreePostList() {
  const navigate = useNavigate()

  // 태그 0 또는 null = 전체
  const [tagId, setTagId] = useState<number | null>(0)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)

  // ✅ Pagination은 1-base로 사용
  const [currentPage, setCurrentPage] = useState<number>(1)

  const size = 5

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isAll = tagId === 0 || tagId === null
        const url = isAll ? `/api/free-posts` : `/api/free_tags/${tagId}/posts`

        const res = await api.get<ListResp>(url, {
          params: {
            page: currentPage - 1, // 서버에는 0-base로 전달
            size,
            sort: 'createdAt,desc',
          },
        })

        const data = res.data
        setPosts(Array.isArray(data?.content) ? data.content : [])
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch (err) {
        // 실패 시 폴백 사용
        setPosts(fallbackResponse.content)
        setTotalPages(Math.max(1, fallbackResponse.totalPages))
      }
    }
    fetchPosts()
  }, [currentPage, tagId])

  return (
    <>
      <HomeBar />

      <div className="freepost-container">
        {/* 배너: 컨테이너 안에서 100% 폭 */}
        <div className="freepost-banner">
          <img src="/banners/free-banner.svg" alt="자유게시판 배너" />
        </div>

        {/* 태그칩 + 글쓰기 버튼 (한 줄 정렬) */}
        <div className="freepost-topbar">
          <div className="freepost-tags">
            <TagChips
              endpoint="/api/free_tags"
              mode="single"
              value={tagId}
              onChange={(v) => {
                setTagId(v as number | null)
                setCurrentPage(1)
              }}
              includeAllItem
              gapPx={10}
              fallbackTags={[
                { id: 1, name: '업무팁' },
                { id: 2, name: '인수인계' },
                { id: 3, name: '꼭 지켜주세요' },
                { id: 4, name: '조직문화' },
              ]}
            />
          </div>

          <button
            className="write-button"
            onClick={() => navigate('/free/write')}
          >
            + 글쓰기
          </button>
        </div>

        {/* 리스트 */}
        <div className="freepost-list">
          {posts.length === 0 ? (
            <div className="no-result">게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id ?? `${post.title}-${post.createdAt}`}
                className="post-card"
                onClick={() => {
                  if (post.id !== undefined && post.id !== null) {
                    navigate(`/free/${post.id}`)
                  } else {
                    toast.error('잘못된 게시글 ID입니다.')
                  }
                }}
              >
                <div className="post-meta">
                  <span className="nickname">
                    {post.writer || '(알 수 없음)'}
                  </span>
                  <span className="date">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleString('ko-KR')
                      : '-'}
                  </span>
                  <span className="tags">
                    {Array.isArray(post.tags)
                      ? post.tags.map((tag: string) => `#${tag}`).join(' ')
                      : ''}
                  </span>
                </div>

                <div className="post-title">{post.title}</div>

                <div className="post-content-preview">
                  {(() => {
                    const lines = (post.content ?? '').split('\n')
                    const limitedLines = lines.slice(0, 2)
                    const joined = limitedLines.join('\n').slice(0, 100)
                    return joined
                      .split('\n')
                      .map((line: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))
                  })()}
                  {((post.content ?? '').split('\n').length > 2 ||
                    (post.content ?? '').length > 100) &&
                    '...'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ 페이지네이션 (1-base) */}
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage} // 1-base
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            // siblingCount={1}
          />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default FreePostList
