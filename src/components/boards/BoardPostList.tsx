import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import Footer from '../../components/layouts/Footer'
import TagChips from '../../components/TagChips'
import Pagination from '../../components/Pagination'
import PostCard from '../../components/posts/PostCard'
import api from '../../api/api'
import { stripHtml } from '../../utils/stripHtml'
import { hydrateCoverToken } from '../../utils/coverToken'
import type {
  Post,
  ListRespAll,
  ListRespByTag,
  ApiPostAll,
  ApiPostByTag,
} from '../../types/post'
import './BoardPostList.css'

// 사용자
type UserInfo = {
  nickname: string
  joinedYear?: number
  yearsOfService?: number
  role?: 'NEWBIE' | 'SENIOR' | 'ADMIN'
}

// Fallback 포스트 타입
type FallbackPost = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[] // ← 문자열 태그 기준 (예: ['일상','추천'])
  createdAt: string
  imageUrl: string | null
}

const mapAllToPost = (p: ApiPostAll): Post => ({
  id: p.id,
  writer: p.writer,
  title: p.title,
  content: p.content,
  tags: p.tags,
  createdAt: p.createdAt,
  imageUrl: p.imageUrl ?? null,
})

const mapByTagToPost = (p: ApiPostByTag): Post => ({
  id: p.postId,
  writer: p.writer,
  title: p.title,
  content: p.content,
  tags: p.tags,
  createdAt: p.createdAt,
  imageUrl: p.imageUrl ?? null,
})

type Props = {
  boardName: string
  postApi: string
  tagApi: string
  writePath: string
  detailBasePath: string
  bannerSrc?: string
  pageSize?: number
  canWrite?: (user: UserInfo | null) => boolean

  /** 서버 태그 실패 시 보여줄 기본 태그 목록 */
  tagFallbacks?: { id: number; name: string }[]

  /** 서버 글 목록 실패 시 사용할 기본 포스트 목록 */
  fallbackPosts?: FallbackPost[]
}

function sliceByPage<T>(arr: T[], page: number, size: number) {
  const start = (page - 1) * size
  return arr.slice(start, start + size)
}

export default function BoardPostList({
  boardName,
  postApi,
  tagApi,
  writePath,
  detailBasePath,
  bannerSrc = '/banners/default-board.svg',
  pageSize = 5,
  canWrite = (u) => !!u,
  tagFallbacks,
  fallbackPosts,
}: Props) {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserInfo | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  const [tagId, setTagId] = useState<number | null>(0) // 0/null = 전체
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1) // 1-base

  // tagId → tagName 매핑 (fallbackTags 기준)
  const tagNameById = useMemo(() => {
    const map = new Map<number, string>()
    tagFallbacks?.forEach((t) => map.set(t.id, t.name))
    return map
  }, [tagFallbacks])

  // 사용자 fetch
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get<UserInfo>('/api/members/me')
        setUser(res.data ?? null)
      } catch {
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }
    fetchMe()
  }, [])

  // 글 목록 fetch
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isAll = tagId === 0 || tagId === null
        const url = isAll ? postApi : `${tagApi}/${tagId}/posts`

        const res = await api.get<ListRespAll | ListRespByTag>(url, {
          params: {
            page: currentPage - 1, // 서버는 0-base
            size: pageSize,
            sort: 'createdAt,desc',
          },
        })

        const data = res.data
        const normalized: Post[] = (data.content as any[]).map((item) =>
          'postId' in item
            ? mapByTagToPost(item as ApiPostByTag)
            : mapAllToPost(item as ApiPostAll)
        )

        setPosts(normalized)
        setTotalPages(Math.max(1, Number((data as any)?.totalPages ?? 1)))
      } catch {
        // ⬇️ Fallback 로직
        if (fallbackPosts && fallbackPosts.length > 0) {
          const isAll = tagId === 0 || tagId === null

          // 태그 필터: tagId가 "전체"가 아니면, tagFallbacks로 tagName을 찾아 필터
          let filtered = fallbackPosts
          if (!isAll && tagNameById.size > 0) {
            const selectedName = tagNameById.get(tagId as number)
            if (selectedName) {
              filtered = fallbackPosts.filter(
                (p) => Array.isArray(p.tags) && p.tags.includes(selectedName)
              )
            } else {
              // 매핑 실패 시 안전하게 빈 목록
              filtered = []
            }
          }

          const totalElements = filtered.length
          const totalPages = Math.max(
            1,
            Math.ceil(totalElements / (pageSize ?? 5))
          )
          const pageContent = sliceByPage(filtered, currentPage, pageSize ?? 5)

          // Fallback도 PostCard와 동일하게 가공
          const normalizedFallback: Post[] = pageContent.map((p) => ({
            id: p.id,
            writer: p.writer,
            title: p.title,
            content: p.content,
            tags: p.tags,
            createdAt: p.createdAt,
            imageUrl: p.imageUrl,
          }))

          setPosts(normalizedFallback)
          setTotalPages(totalPages)
        } else {
          // fallbackPosts가 없으면 기존 빈 상태
          setPosts([])
          setTotalPages(1)
        }
      }
    }
    fetchPosts()
  }, [
    currentPage,
    tagId,
    postApi,
    tagApi,
    pageSize,
    fallbackPosts,
    tagNameById,
  ])

  const writeEnabled = canWrite(user)

  return (
    <div className="flex flex-col min-h-screen">
      <HomeBar />
      <main className="flex-1">
        <div className="post-container">
          <div className="post-banner">
            <img src={bannerSrc} alt={`${boardName} 배너`} />
          </div>

          <div className="post-topbar">
            <div className="post-tags">
              <TagChips
                endpoint={tagApi}
                mode="single"
                value={tagId}
                onChange={(v) => {
                  setTagId(v as number | null)
                  setCurrentPage(1)
                }}
                includeAllItem
                gapPx={10}
                fallbackTags={tagFallbacks}
              />
            </div>

            {/* 버튼은 렌더 유무로 제어 */}
            {!userLoading && writeEnabled && (
              <button
                className="write-button"
                onClick={() => navigate(writePath)}
              >
                + 글쓰기
              </button>
            )}
          </div>

          <div className="post-list">
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
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={stripHtml(
                    hydrateCoverToken(post.content, post.imageUrl)
                  )}
                  writer={post.writer}
                  createdAt={post.createdAt}
                  tags={post.tags}
                  imageUrl={post.imageUrl ?? null}
                  onClick={() => navigate(`${detailBasePath}/${post.id}`)}
                />
              ))
            )}
          </div>

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
  )
}
