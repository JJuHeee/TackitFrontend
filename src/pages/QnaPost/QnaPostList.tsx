// src/pages/qna/QnaPostList.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './QnaPostList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { toast } from 'react-toastify'
import Footer from '../../components/layouts/Footer'
import TagChips from '../../components/TagChips'
import Pagination from '../../components/Pagination'
import PostCard from '../../components/posts/PostCard'

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
  const [currentPage, setCurrentPage] = useState<number>(1) // 1-base

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

        // 서버가 id로 내려줄 때 대비 postId 보정
        const data = res.data
        const content: Post[] = (
          Array.isArray(data?.content) ? data.content : []
        ).map((p: any) => ({
          postId: p.postId ?? p.id,
          writer: p.writer ?? '',
          title: p.title ?? '',
          content: p.content ?? '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          type: p.type ?? 'Qna',
          createdAt: p.createdAt ?? '',
        }))

        setPosts(content)
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch {
        setPosts(fallbackResponse.content)
        setTotalPages(Math.max(1, fallbackResponse.totalPages))
      }
    }
    fetchPosts()
  }, [currentPage, tagId])

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <HomeBar />
        <main className="flex-1">
          <div className="qnapost-container">
            <div className="qnapost-banner">
              <img src="/banners/qna-banner.svg" alt="질문게시판 배너" />
            </div>

            <div className="qnapost-inner">
              <div className="qnapost-topbar">
                <div className="qnapost-tags">
                  <TagChips
                    endpoint="/api/qna-tags/list"
                    mode="single"
                    value={tagId}
                    onChange={(v) => {
                      setTagId(v as number | null)
                      setCurrentPage(1)
                    }}
                    includeAllItem
                    gapPx={10}
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

              {/* 리스트: PostCard로 렌더 */}
              <div className="freepost-list">
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center py-20 no-result">
                    <img
                      src="/icons/empty.svg"
                      alt="아직 작성한 글이 없어요!"
                      className="w-20 h-20 mb-4"
                    />
                    <p className="text-body-1sb text-label-normal">
                      아직 작성한 글이 없어요!
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.postId ?? `${post.title}-${post.createdAt}`}
                      id={post.postId} // ✅ PostCard가 기대하는 id에 postId 매핑
                      title={post.title}
                      content={post.content}
                      writer={post.writer}
                      createdAt={post.createdAt}
                      tags={post.tags}
                      onClick={() => {
                        if (post.postId != null) navigate(`/qna/${post.postId}`)
                        else toast.error('잘못된 게시글 ID입니다.')
                      }}
                    />
                  ))
                )}
              </div>

              {/* ✅ 페이지네이션 (1-base) */}
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default QnaPostList
