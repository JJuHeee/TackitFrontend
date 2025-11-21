import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import TagChips from '../../components/TagChips'
import PostRowCompact from '../../components/posts/PostRowCompact'
import PaginationGroup from '../../components/Pagination'
import api from '../../api/api'
import './Bookmarked.css'

type Tab = 'tip' | 'qna' | 'free'

type TipItem = {
  id: number
  title: string
  content?: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
  type?: string
}

type FreeItem = {
  id: number
  title: string
  content?: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
  type?: string
}

type QnaItem = {
  postId: number
  title: string
  content?: string
  contentPreview?: string
  writer: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
  profileImageUrl?: string | null
  type?: string
}

type Row = {
  id: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags: string[]
  imageUrl: string | null
  profileImageUrl?: string | null
}

export default function MyPostList() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('tip')
  const [posts, setPosts] = useState<Array<TipItem | FreeItem | QnaItem>>([])
  const [currentPage, setCurrentPage] = useState(1) // 1-base
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const tabTags = useMemo(
    () => [
      { id: 'tip', name: '선배가 알려줘요' },
      { id: 'qna', name: '신입이 질문해요' },
      { id: 'free', name: '다같이 얘기해요' },
    ],
    []
  )

  const fallbackData = useMemo(
    () => ({
      tip: {
        content: [
          {
            id: 1,
            title: '신입사원을 위한 회사생활 꿀팁',
            contentPreview: '첫 직장에 입사하면…',
            writer: '선배로부터',
            createdAt: '2025-05-26T16:55:22.233909',
            tags: ['인수인계'],
          },
        ] as TipItem[],
        totalPages: 1,
      },
      free: {
        content: [
          {
            id: 2,
            title: '자유 게시글 예시',
            contentPreview: '자유롭게 소통하는 공간…',
            writer: '홍길동',
            createdAt: '2025-05-27T22:27:15.846678',
            tags: ['잡담'],
            profileImageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
          },
        ] as FreeItem[],
        totalPages: 1,
      },
      qna: {
        content: [
          {
            postId: 3,
            title: '실수했을 때 대처법이 궁금해요',
            contentPreview: '업무 중 실수가 발생했다면…',
            writer: 'newbie01',
            createdAt: '2025-05-27T20:24:20.359041',
            tags: ['질문'],
          },
        ] as QnaItem[],
        totalPages: 1,
      },
    }),
    []
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)

        const token = localStorage.getItem('accessToken')
        const pageParam = currentPage - 1
        const size = 3
        const sortOrder = 'desc'

        const endpoint =
          activeTab === 'tip'
            ? `/api/mypage/tip-posts`
            : activeTab === 'free'
            ? `/api/mypage/free-posts`
            : `/api/mypage/qna-posts`

        const res = await api.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: pageParam,
            size,
            sort: `createdAt,${sortOrder}`,
          },
        })

        if (!mounted) return

        setPosts(res.data?.content ?? [])
        setTotalPages(res.data?.totalPages ?? 1)
      } catch (err) {
        console.warn('⚠️ 내가 쓴 글 목록 API 실패, fallback 사용', err)
        if (!mounted) return
        const fb = fallbackData[activeTab]
        setPosts(fb.content)
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

  const toDetailPath = (tab: Tab, id: number) => {
    if (tab === 'tip') return `/tip/${id}`
    if (tab === 'free') return `/free/${id}`
    return `/qna/${id}`
  }

  const mapToRow = (p: TipItem | FreeItem | QnaItem): Row => {
    if (activeTab === 'tip') {
      const t = p as TipItem
      return {
        id: t.id,
        title: t.title,
        content: t.contentPreview ?? '',
        writer: t.writer,
        createdAt: t.createdAt,
        tags: t.tags ?? [],
        imageUrl: t.imageUrl ?? null,
        profileImageUrl: t.profileImageUrl ?? null,
      }
    }
    if (activeTab === 'free') {
      const f = p as FreeItem
      return {
        id: f.id,
        title: f.title,
        content: (f.content ?? f.contentPreview ?? '') as string,
        writer: f.writer,
        createdAt: f.createdAt,
        tags: f.tags ?? [],
        imageUrl: f.imageUrl ?? null,
        profileImageUrl: f.profileImageUrl ?? null,
      }
    }
    const q = p as QnaItem
    return {
      id: q.postId,
      title: q.title,
      content: (q.content ?? q.contentPreview ?? '') as string,
      writer: q.writer,
      createdAt: q.createdAt,
      tags: q.tags ?? [],
      imageUrl: q.imageUrl ?? null,
      profileImageUrl: q.profileImageUrl ?? null,
    }
  }

  const empty = !loading && posts.length === 0

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* 브레드크럼 */}
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
            />
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              내 활동
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
            />
            <span className="text-title1-bold text-label-normal">
              내가 쓴 글
            </span>
          </div>

          {/* 탭 */}
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

          {/* 리스트 */}
          <section aria-live="polite" className="ml-[20px] mt-6">
            {loading ? (
              <div className="py-10 text-label-assistive">불러오는 중...</div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 게시판"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 작성한 글이 없어요!
                </p>
              </div>
            ) : (
              posts.map((raw, idx) => {
                const row = mapToRow(raw)
                return (
                  <PostRowCompact
                    key={`${row.id}-${idx}`}
                    id={row.id}
                    title={row.title}
                    content={row.content}
                    writer={row.writer}
                    createdAt={row.createdAt}
                    tags={row.tags}
                    imageUrl={row.imageUrl}
                    profileImageUrl={row.profileImageUrl}
                    showReplyIcon={false}
                    density="comfortable"
                    onClick={() => navigate(toDetailPath(activeTab, row.id))}
                    className="mb-4"
                  />
                )
              })
            )}
          </section>

          {/* 페이지네이션 */}
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
