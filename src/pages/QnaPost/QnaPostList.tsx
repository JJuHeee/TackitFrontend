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
import MyInfo from '../MyPage/MyInfo'
import WriteButton from '../../components/ui/WriteButton'

type Post = {
  postId: number
  writer: string
  title: string
  content: string
  tags: string[]
  type?: 'Free' | 'Qna' | 'Tip'
  createdAt: string
  imageUrl?: string | null
  profileImageUrl?: string | null
}

type ListResp = {
  page: number // 0-base
  content: Post[] | any[]
  size: number
  totalElements: number
  totalPages: number
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
  profileImageUrl: p.profileImageUrl ?? null,
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
  profileImageUrl: p.profileImageUrl ?? null,
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
        const url = isAll ? `/api/qna-posts` : `/api/qna-tags/${tagId}/posts`

        const res = await api.get<ListResp>(url, {
          params: {
            page: currentPage - 1,
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
      } catch (error) {
        console.error('QnA 게시글 조회 실패:', error)
        setPosts([])
        setTotalPages(1)

        toast.error('게시글을 불러오지 못했어요.')
      }
    }

    fetchPosts()
  }, [currentPage, tagId])

  return (
    <MyInfo>
      {(myInfo, loading) => (
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

                {/* 글쓰기 버튼 컴포넌트 */}
                {myInfo?.role === 'NEWBIE' && (
                  <WriteButton onClick={() => navigate('/qna/write')} />
                )}
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
                      profileImageUrl={post.profileImageUrl ?? null}
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
      )}
    </MyInfo>
  )
}

export default QnaPostList
