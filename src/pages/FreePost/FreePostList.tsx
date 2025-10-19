import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './FreePostList.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import Footer from '../../components/layouts/Footer'
import TagChips from '../../components/TagChips'
import Pagination from '../../components/Pagination'
import PostCard from '../../components/posts/PostCard'
import { stripHtml } from '../../utils/stripHtml'
import { hydrateCoverToken } from '../../utils/coverToken'
import type {
  Post,
  ListRespAll,
  ListRespByTag,
  ApiPostAll,
  ApiPostByTag,
} from '../../types/post'

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

function FreePostList() {
  const navigate = useNavigate()

  const [tagId, setTagId] = useState<number | null>(0) // 0/null = 전체
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1) // 1-base
  const size = 5

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const isAll = tagId === 0 || tagId === null
        const url = isAll ? `/api/free-posts` : `/api/free_tags/${tagId}/posts`

        const res = await api.get<ListRespAll | ListRespByTag>(url, {
          params: {
            page: currentPage - 1, 
            size,
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
        setTotalPages(Math.max(1, Number(data?.totalPages ?? 1)))
      } catch {
        // fallback
        const fallbackResponse = {
          page: 0,
          content: [
            {
              id: 2,
              writer: '기본값',
              title: '요즘 날씨 너무 좋지 않나요?',
              content: '코스 있으시면 댓글로 알려주세요!...',
              tags: ['일상', '산책', '추천'],
              createdAt: '2025-05-26T00:49:09.773772',
              imageUrl: null,
            },
            {
              id: 1,
              writer: 'test',
              title: '프론트엔드 스터디 같이 하실 분!',
              content:
                '안녕하세요.\n오늘은 날씨가 정말 좋네요!\n\n내일은 비가 온다고 합니다.',
              tags: ['스터디', '프론트엔드', 'React', '모집'],
              createdAt: '2025-05-26T00:47:58.054746',
              imageUrl:
                'https://tackit.s3.ap-northeast-2.amazonaws.com/sample-image.jpg',
            },
          ],
          size: 5,
          totalElements: 2,
          totalPages: 1,
        }
        setPosts(fallbackResponse.content)
        setTotalPages(fallbackResponse.totalPages)
      }
    }
    fetchPosts()
  }, [currentPage, tagId])

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <HomeBar />
        <main className="flex-1">
          <div className="post-container">
            <div className="post-banner">
              <img src="/banners/free-banner.svg" alt="자유게시판 배너" />
            </div>

            {/* 태그칩 + 글쓰기 버튼 */}
            <div className="post-topbar">
              <div className="post-tags">
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
                    id={post.id}
                    title={post.title}
                    content={stripHtml(
                      hydrateCoverToken(post.content, post.imageUrl)
                    )}
                    writer={post.writer}
                    createdAt={post.createdAt}
                    tags={post.tags}
                    imageUrl={post.imageUrl ?? null}
                    onClick={() => navigate(`/free/${post.id}`)}
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

export default FreePostList
