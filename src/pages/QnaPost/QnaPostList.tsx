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
import { stripHtml } from '../../utils/stripHtml'
import { hydrateCoverToken } from '../../utils/coverToken'

type Post = {
  postId: number
  writer: string
  title: string
  content: string
  tags: string[]
  type?: 'Free' | 'Qna' | 'Tip'
  createdAt: string
  imageUrl?: string | null
}

type ListResp = {
  page: number // 0-base
  content: Post[] | any[]
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
      imageUrl: null,
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
      imageUrl:
        'https://tackit.s3.ap-northeast-2.amazonaws.com/sample-image.jpg',
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

const mapAllToPost = (p: any): Post => ({
  postId: p.postId ?? p.id,
  writer: p.writer ?? '',
  title: p.title ?? '',
  content: p.content ?? '',
  tags: Array.isArray(p.tags) ? p.tags : [],
  createdAt: p.createdAt ?? '',
  type: p.type ?? 'Qna',
  imageUrl: p.imageUrl ?? null,
})

const mapByTagToPost = (p: any): Post => ({
  postId: p.postId ?? p.id,
  writer: p.writer ?? '',
  title: p.title ?? '',
  content: p.content ?? '',
  tags: Array.isArray(p.tags) ? p.tags : [],
  createdAt: p.createdAt ?? '',
  type: p.type ?? 'Qna',
  imageUrl: p.imageUrl ?? null,
})

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

        const data = res.data
        const contentArr = Array.isArray(data?.content) ? data.content : []
        const normalized: Post[] = contentArr.map((item: any) =>
          'postId' in item ? mapByTagToPost(item) : mapAllToPost(item)
        )

        setPosts(normalized)
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch {
        setPosts(
          (fallbackResponse.content as any[]).map((p) =>
            'postId' in p ? mapByTagToPost(p) : mapAllToPost(p)
          )
        )
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
            {/* 배너 */}
            <div className="qnapost-banner">
              <img src="/banners/qna-banner.svg" alt="질문게시판 배너" />
            </div>

            {/* 태그칩 + 글쓰기 버튼 */}
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

            {/* 리스트 */}
            <div className="qnapost-list">
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
                    id={post.postId}
                    title={post.title}
                    content={stripHtml(
                      hydrateCoverToken(post.content, post.imageUrl ?? null)
                    )}
                    writer={post.writer}
                    createdAt={post.createdAt}
                    tags={post.tags}
                    imageUrl={post.imageUrl ?? null}
                    onClick={() => {
                      if (post.postId != null) navigate(`/qna/${post.postId}`)
                      else toast.error('잘못된 게시글 ID입니다.')
                    }}
                  />
                ))
              )}
            </div>

            {/* 페이지네이션 */}
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
        </main>
        <Footer />
      </div>
    </>
  )
}

export default QnaPostList
