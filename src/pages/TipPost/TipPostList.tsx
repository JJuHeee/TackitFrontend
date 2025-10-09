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
      title: '요즘 날씨 너무 좋지 않나요?',
      content:
        '코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!코스 있으시면 댓글로 알려주세요!',
      tags: ['일상', '산책', '추천'],
      createdAt: '2025-05-26T00:49:09.773772',
      type: 'Tip',
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
    },
  ],
  size: 5,
  totalElements: 2,
  totalPages: 1,
}

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
        // 전체: /api/tip-posts, 태그별: /api/tip-tags/{tagId}/posts
        const url = isAll ? `/api/tip-posts` : `/api/tip-tags/${tagId}/posts`

        const res = await api.get<ListResp>(url, {
          params: {
            page: currentPage - 1, // 서버는 0-base
            size,
            sort: 'createdAt,desc',
          },
        })

        const data = res.data
        const content: Post[] = (
          Array.isArray(data?.content) ? data.content : []
        ).map((p: any) => ({
          postId: p.postId ?? p.id, // 서버가 id로 줄 수도 있어 보정
          writer: p.writer ?? '',
          title: p.title ?? '',
          content: p.content ?? '',
          tags: Array.isArray(p.tags) ? p.tags : [],
          type: p.type ?? 'Tip',
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
      <HomeBar />

      <div className="tippost-container">
        {/* 배너 */}
        <div className="tippost-banner">
          <img src="/banners/tip-banner.svg" alt="선임자의 TIP 배너" />
        </div>

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

        <div className="tippost-list">
          {posts.length === 0 ? (
            <div className="no-result">게시글이 없습니다.</div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.postId ?? `${post.title}-${post.createdAt}`}
                id={post.postId}
                title={post.title}
                content={post.content}
                writer={post.writer}
                createdAt={post.createdAt}
                tags={post.tags}
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

      <Footer />
    </>
  )
}
