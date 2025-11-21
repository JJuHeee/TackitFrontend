import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import TagChips from '../../components/TagChips'
import CommentRowCompact from '../../components/posts/CommentRowCompact'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './Bookmarked.css'

type Tab = 'qna' | 'free'

type CommentItem = {
  commentId: number
  postId: number
  content: string
  createdAt: string
  type: 'QnA' | 'Free'
}

type PostSummary = {
  title: string
  writer: string
}

export default function MyCommentList() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('qna')
  const [comments, setComments] = useState<CommentItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [cacheTick, setCacheTick] = useState(0)

  const tabTags = useMemo(
    () => [
      { id: 'qna', name: '신입이 질문해요' },
      { id: 'free', name: '다같이 얘기해요' },
    ],
    []
  )

  const size = 5
  const sortOrder = 'desc'
  const postCache = useRef(new Map<string, PostSummary>())
  const keyOf = (t: string, id: number) => `${t}:${id}`

  const fallbackData = useMemo(
    () => ({
      qna: {
        content: [
          {
            commentId: 101,
            postId: 1,
            content: '이 질문 정말 도움이 되었어요!',
            createdAt: '2025-05-25T12:10:00',
            type: 'QnA' as const,
          },
          {
            commentId: 102,
            postId: 2,
            content: '저도 같은 고민이에요 😥',
            createdAt: '2025-05-26T08:40:00',
            type: 'QnA' as const,
          },
        ],
        totalPages: 1,
      },
      free: {
        content: [
          {
            commentId: 201,
            postId: 3,
            content: '자유게시판 너무 재밌어요!',
            createdAt: '2025-05-27T10:30:00',
            type: 'Free' as const,
          },
        ],
        totalPages: 1,
      },
    }),
    []
  )

  async function fetchPostSummary(
    type: string,
    id: number
  ): Promise<PostSummary> {
    const url =
      type === 'QnA' ? `/api/qna-posts/${id}` : `/api/free-posts/${id}`
    const { data } = await api.get(url)
    return {
      title: data.title ?? '(제목 없음)',
      writer: data.writer ?? '',
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const endpoint =
          activeTab === 'free'
            ? `/api/mypage/free-comments?page=${
                currentPage - 1
              }&size=${size}&sort=createdAt,${sortOrder}`
            : `/api/mypage/qna-comments?page=${
                currentPage - 1
              }&size=${size}&sort=createdAt,${sortOrder}`

        const res = await api.get(endpoint)
        if (!mounted) return

        const list: CommentItem[] = res.data?.content ?? []
        setComments(list)
        setTotalPages(res.data?.totalPages ?? 1)

        // ✅ post 요약 캐싱
        const missing = list.filter(
          (c) => !postCache.current.has(keyOf(c.type, c.postId))
        )
        if (missing.length) {
          await Promise.all(
            missing.map(async (c) => {
              try {
                const summary = await fetchPostSummary(c.type, c.postId)
                postCache.current.set(keyOf(c.type, c.postId), summary)
              } catch {
                postCache.current.set(keyOf(c.type, c.postId), {
                  title: `(게시글 #${c.postId})`,
                  writer: '',
                })
              }
            })
          )
          if (mounted) setCacheTick((t) => t + 1)
        }
      } catch (err: any) {
        // ✅ 서버 응답 실패 (예: 503 등) → fallback 사용
        if (!mounted) return
        console.warn('⚠️ 서버 오류 발생, fallback 데이터 사용', err)
        const fb = fallbackData[activeTab]
        setComments(fb.content)
        setTotalPages(fb.totalPages)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [activeTab, currentPage, fallbackData])

  const onChangeTab = (next: string | number) => {
    const key = String(next) as Tab
    if (key === activeTab) return
    setActiveTab(key)
    setCurrentPage(1)
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}. ${String(d.getDate()).padStart(2, '0')}`
  }

  const empty = !loading && comments.length === 0

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* ✅ 브레드크럼 */}
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[22px] h-[22px]"
            />
            <span
              onClick={() => navigate('/mypage')}
              className="cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              내 활동
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[22px] h-[22px]"
            />
            <span className="text-title1-bold text-label-normal">
              내가 쓴 댓글
            </span>
          </div>

          {/* ✅ 탭 */}
          <TagChips
            endpoint="/__ignore__"
            mode="single"
            includeAllItem={false}
            value={activeTab}
            onChange={onChangeTab}
            fallbackTags={tabTags}
            className="ml-[20px] mb-6"
            gapPx={8}
          />

          {/* ✅ 댓글 목록 */}
          <section aria-live="polite" className="ml-[20px] mt-6">
            {loading ? (
              <div className="py-10 text-label-assistive">불러오는 중...</div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 댓글 목록"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 작성한 댓글이 없어요!
                </p>
              </div>
            ) : (
              comments.map((c) => {
                void cacheTick
                const s = postCache.current.get(keyOf(c.type, c.postId))
                return (
                  <CommentRowCompact
                    key={c.commentId}
                    id={c.postId}
                    title={s?.title ?? '제목'}
                    content={c.content ?? ''}
                    createdAt={c.createdAt}
                    onClick={() =>
                      navigate(
                        c.type === 'QnA'
                          ? `/qna/${c.postId}`
                          : `/free/${c.postId}`
                      )
                    }
                  />
                )
              })
            )}
          </section>

          {/* ✅ 페이지네이션 */}
          <div className="ml-[20px] mt-8 mb-8 flex justify-center">
            <PaginationGroup
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              groupSize={5}
            />
          </div>
        </div>
      </main>
    </>
  )
}
