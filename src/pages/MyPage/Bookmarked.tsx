// src/pages/MyPage/Bookmarked.tsx
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
  tipId: number
  title: string
  contentPreview?: string
  authorName: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
}
type FreeItem = {
  freeId: number
  title: string
  content?: string
  contentPreview?: string
  authorName: string
  createdAt: string
  imageUrl?: string | null
  tags?: string[]
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
}

type Row = {
  id: number
  title: string
  content: string
  writer: string
  createdAt: string
  tags: string[]
  imageUrl: string | null
}

export default function Bookmarked() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('tip')
  const [posts, setPosts] = useState<Array<TipItem | FreeItem | QnaItem>>([])
  const [currentPage, setCurrentPage] = useState(1) // 1-base
  const [totalPages, setTotalPages] = useState(1)

  const tabTags = useMemo(
    () => [
      { id: 'tip', name: '선배가 알려줘요' },
      { id: 'qna', name: '신입이 질문해요' },
      { id: 'free', name: '다같이 얘기해요' },
    ],
    []
  )

  type Fallback = {
    tip: { content: TipItem[]; totalPages: number }
    free: { content: FreeItem[]; totalPages: number }
    qna: { content: QnaItem[]; totalPages: number }
  }

  const fallbackData: Fallback = useMemo(
    () => ({
      tip: {
        content: [
          {
            tipId: 1,
            title: '신입사원을 위한 회사생활 꿀팁',
            contentPreview: '첫 직장에 입사하면…',
            authorName: '선배로부터',
            createdAt: '2025-05-26T16:55:22.233909',
            tags: ['인수인계'],
          },
        ],
        totalPages: 1,
      },
      free: {
        content: [
          {
            freeId: 2,
            title: '자유 게시글 예시',
            contentPreview: '자유롭게 소통하는 공간…',
            authorName: '홍길동',
            createdAt: '2025-05-27T22:27:15.846678',
            tags: ['잡담'],
          },
        ],
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
        ],
        totalPages: 1,
      },
    }),
    []
  )

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const pageParam = currentPage - 1 // 서버 0-base
        const url =
          activeTab === 'tip'
            ? `/api/mypage/tip-scraps?page=${pageParam}`
            : activeTab === 'free'
            ? `/api/mypage/free-scraps?page=${pageParam}`
            : `/api/qna-post/scrap?page=${pageParam}`

        const res = await api.get(url)
        if (!mounted) return
        setPosts(res.data.content ?? [])
        setTotalPages(res.data.totalPages ?? 1)
      } catch {
        if (!mounted) return
        const fb = fallbackData[activeTab]
        setPosts(fb.content as Array<TipItem | FreeItem | QnaItem>)
        setTotalPages(fb.totalPages)
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

  const openDetail = (id: number) => {
    const path =
      activeTab === 'tip' ? 'tip' : activeTab === 'free' ? 'free' : 'qna'
    navigate(`/${path}/${id}`)
  }

  const mapToRow = (p: TipItem | FreeItem | QnaItem): Row => {
    if (activeTab === 'tip') {
      const t = p as TipItem
      return {
        id: t.tipId,
        title: t.title,
        content: t.contentPreview ?? '',
        writer: t.authorName,
        createdAt: t.createdAt,
        tags: t.tags ?? [],
        imageUrl: t.imageUrl ?? null,
      }
    }
    if (activeTab === 'free') {
      const f = p as FreeItem
      return {
        id: f.freeId,
        title: f.title,
        content: (f.content ?? f.contentPreview ?? '') as string,
        writer: f.authorName,
        createdAt: f.createdAt,
        tags: f.tags ?? [],
        imageUrl: f.imageUrl ?? null,
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
    }
  }

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-[24px] h-[24px]  text-label-assistive"
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
            <span className="text-title1-bold text-label-normal">스크랩</span>
          </div>

          <TagChips
            endpoint="/__ignore__"
            mode="single"
            includeAllItem={false}
            value={activeTab}
            onChange={onChangeTab}
            fallbackTags={tabTags}
            className="ml-[20px] mb-6" /* 32px */
            gapPx={8}
          />

          {/* 리스트: 태그와 같은 시작선(ml-20), 태그 아래 여백 24px */}
          <section aria-live="polite" className="ml-[20px] mt-6">
            {!posts || posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center no-result">
                <img
                  src="/icons/empty.svg"
                  alt="빈 게시판"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-body-1sb text-label-normal">
                  아직 스크랩한 글이 없어요!
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
                    imageUrl={row.imageUrl ?? null}
                    showReplyIcon={false}
                    density="comfortable"
                    onClick={() => openDetail(row.id)}
                    className="mb-4"
                  />
                )
              })
            )}
          </section>

          {/* 페이지네이션도 같은 정렬 유지 */}
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
