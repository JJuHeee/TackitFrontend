import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './TipPostList.css'
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
      title: '요즘 날씨 너무 좋지 않나요?',
      content:
        '코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!',
      tags: ['일상', '산책', '추천'],
      createdAt: '2025-05-26T00:49:09.773772',
      type: 'Tip',
      imageUrl: null,
    },
    {
      postId: 1,
      writer: 'test',
      title: '프론트엔드 스터디 같이 하실 분!',
      content:
        '안녕하세요.\n오늘은 날씨가 정말 좋네요!\n\n내일은 비가 온다고 합니다.',
      tags: ['스터디', '프론트엔드', 'React', '모집'],
      createdAt: '2025-05-26T00:47:58.054746',
      type: 'Tip',
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
  type: p.type ?? 'Tip',
  imageUrl: p.imageUrl ?? null,
})

const mapByTagToPost = (p: any): Post => ({
  postId: p.postId ?? p.id,
  writer: p.writer ?? '',
  title: p.title ?? '',
  content: p.content ?? '',
  tags: Array.isArray(p.tags) ? p.tags : [],
  createdAt: p.createdAt ?? '',
  type: p.type ?? 'Tip',
  imageUrl: p.imageUrl ?? null,
})

export default function TipPostList() {
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
        const url = isAll ? `/api/tip-posts` : `/api/tip-tags/${tagId}/posts`

        const res = await api.get<ListResp>(url, {
          params: {
            page: currentPage - 1, // 서버는 0-base
            size,
            sort: 'createdAt,desc',
          },
        })

        const data = res.data
        const contentArr = Array.isArray(data?.content) ? data.content : []

        // Free와 동일하게 'postId' 존재 여부로 매핑 분기
        const normalized: Post[] = contentArr.map((item: any) =>
          'postId' in item ? mapByTagToPost(item) : mapAllToPost(item)
        )

        setPosts(normalized)
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch {
        // fallback
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
          <div className="tippost-container">
            {/* 배너 */}
            <div className="tippost-banner">
              <img src="/banners/tip-banner.svg" alt="선임자의 TIP 배너" />
            </div>

            {/* 태그칩 + 글쓰기 버튼 */}
            <div className="tippost-topbar">
              <div className="tippost-tags">
                <TagChips
                  endpoint="/api/tip-tags/list"
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
                    { id: 2, name: '협업' },
                    { id: 3, name: '툴' },
                    { id: 4, name: '커리어' },
                  ]}
                />
              </div>

              <button
                className="write-button"
                onClick={() => navigate('/tip/write')}
              >
                + 글쓰기
              </button>
            </div>

            {/* 리스트 */}
            <div className="tippost-list">
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
                      if (post.postId != null) navigate(`/tip/${post.postId}`)
                      else toast.error('잘못된 게시글 ID입니다.')
                    }}
                  />
                ))
              )}
            </div>

            {/* 페이지네이션 (1-base) */}
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
