// src/pages/qna/QnaPostList.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './QnaPostList.css' // 공통 스타일 사용 (필요시 QnaPostList.css 분리)
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { toast } from 'react-toastify'
import Footer from '../../components/layouts/Footer'
import TagChips from '../../components/TagChips'
import Pagination from '../../components/Pagination'

type Post = {
  postId: number
  writer: string
  title: string
  content: string
  tags: string[]
  type?: 'Free' | 'Qna' | 'Tip'
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
      postId: 2,
      writer: '기본값',
      title: 'React 상태관리 뭐로 할까요?',
      content: 'Zustand vs Redux Toolkit 고민 중입니다… 경험 공유 부탁드려요!',
      tags: ['리액트', '상태관리', '질문'],
      createdAt: '2025-05-26T00:49:09.773772',
      type: 'Qna',
    },
    {
      postId: 1,
      writer: 'test',
      title: 'Axios 인터셉터 에러 처리 패턴 질문',
      content:
        '팀 컨벤션 정하려는데 응답 스키마/리트라이 처리 어떻게 가져가세요?',
      tags: ['Axios', '에러처리'],
      createdAt: '2025-05-26T00:47:58.054746',
      type: 'Qna',
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

function QnaPostList() {
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
        const url = isAll
          ? `/api/qna-post/list`
          : `/api/qna-tags/${tagId}/posts`

        const res = await api.get<ListResp>(url, {
          params: {
            page: currentPage - 1, // 서버는 0-base
            size,
            sort: 'createdAt,desc',
          },
        })

        // 혹시 서버가 id로 내려줄 때를 대비해 postId 보정
        const data = res.data
        const content = (Array.isArray(data?.content) ? data.content : []).map(
          (p: any) => ({
            postId: p.postId ?? p.id, // ← 보정 포인트
            writer: p.writer,
            title: p.title,
            content: p.content,
            tags: Array.isArray(p.tags) ? p.tags : [],
            type: p.type,
            createdAt: p.createdAt,
          })
        )

        setPosts(content)
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch (err) {
        setPosts(fallbackResponse.content)
        setTotalPages(Math.max(1, fallbackResponse.totalPages))
      }
    }
    fetchPosts()
  }, [currentPage, tagId])

  return (
    <>
      <HomeBar />

      <div className="qnapost-container">
        <div className="qnapost-banner">
          <img src="/banners/qna-banner.svg" alt="질문게시판 배너" />
        </div>

        {/* 태그칩 + 글쓰기 버튼 (한 줄 정렬) */}
        <div className="qnapost-topbar">
          <div className="qnapost-tags">
            <TagChips
              // ✅ 태그 엔드포인트도 실제와 동일하게 하이픈 표기 & /list 사용
              endpoint="/api/qna-tags/list"
              mode="single"
              value={tagId}
              onChange={(v) => {
                setTagId(v as number | null)
                setCurrentPage(1)
              }}
              includeAllItem
              gapPx={10}
              // 서버가 {id, tagName} 형태라면 TagChips 내부 normalize에서
              // name || tagName 둘 다 지원하도록 되어있는지 확인!
              fallbackTags={[
                { id: 1, name: '리액트' },
                { id: 2, name: '백엔드' },
                { id: 3, name: '배포' },
                { id: 4, name: 'CS' },
              ]}
            />
          </div>

          <button
            className="write-button"
            onClick={() => navigate('/qna/write')}
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
                key={post.postId ?? `${post.title}-${post.createdAt}`}
                className="post-card"
                onClick={() => {
                  if (post.postId !== undefined && post.postId !== null) {
                    navigate(`/qna/${post.postId}`)
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
          />
        </div>
      </div>

      <Footer />
    </>
  )
}

export default QnaPostList
