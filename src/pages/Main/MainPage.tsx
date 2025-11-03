// src/pages/Main/MainPage.tsx
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import Footer from '../../components/layouts/Footer'
import api from '../../api/api'
import PostRowCompact from '../../components/posts/PostRowCompact'
import './MainPage.css'
import PopularPostsSection from './PopularPostsSection'
import OnboardingModal from '../../components/modals/OnboardingModal'

const ONBOARD_KEY = 'onboard.seen.v1'

type PostId = number
type BaseItem = {
  id: PostId
  title: string
  content: string
  writer: string
  createdAt: string
  tags?: string[]
  imageUrl?: string | null
}
type PageResponse<T> = {
  content: T[]
}

const toTip = (x: any): BaseItem => ({
  id: x.id,
  title: x.title,
  content: x.content ?? '',
  writer: x.writer ?? '',
  createdAt: x.createdAt,
  tags: x.tags ?? [],
  imageUrl: x.imageUrl ?? null,
})
const toQna = (x: any): BaseItem => ({
  id: x.postId,
  title: x.title,
  content: x.content ?? '',
  writer: x.writer ?? '',
  createdAt: x.createdAt,
  tags: x.tags ?? [],
  imageUrl: x.imageUrl ?? null,
})
const toFree = (x: any): BaseItem => ({
  id: x.id,
  title: x.title,
  content: x.content ?? '',
  writer: x.writer ?? '',
  createdAt: x.createdAt,
  tags: x.tags ?? [],
  imageUrl: x.imageUrl ?? null,
})

async function fetchPosts(
  url: string,
  mapFn: (x: any) => BaseItem
): Promise<BaseItem[]> {
  try {
    const { data } = await api.get<PageResponse<any>>(url)
    return (data?.content ?? []).map(mapFn)
  } catch {
    return []
  }
}

export default function MainPage() {
  const [tips, setTips] = useState<BaseItem[]>([])
  const [qnas, setQnas] = useState<BaseItem[]>([])
  const [frees, setFrees] = useState<BaseItem[]>([])
  const { state } = useLocation() as { state?: { showOnboarding?: boolean } }
  const [openOnboarding, setOpenOnboarding] = useState(false)

  useEffect(() => {
    // TIP 최신 3개
    fetchPosts('/api/tip-posts?page=0&size=3&sort=createdAt,desc', toTip).then(
      setTips
    )

    // QNA 최신 3개
    fetchPosts(
      '/api/qna-post/list?page=0&size=3&sort=createdAt,desc',
      toQna
    ).then(setQnas)

    // FREE 최신 3개
    fetchPosts(
      '/api/free-posts?page=0&size=3&sort=createdAt,desc',
      toFree
    ).then(setFrees)
  }, [])

  useEffect(() => {
    const seen = localStorage.getItem(ONBOARD_KEY)
    if (!seen) {
      setOpenOnboarding(true)
    }
  }, [])

  const dismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem(ONBOARD_KEY, '1')
    }
    setOpenOnboarding(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomeBar />

      <main className="flex-1">
        <div className="home-container">
          {/* 배너: 아래 여백 80 */}
          <div className="home-banner mb-[80px]">
            <img src="/banners/home-banner.svg" alt="홈 배너" />
          </div>

          {/* 인기 게시물: 섹션/헤더를 PopularPostsSection 내부로 이동 */}
          <PopularPostsSection />

          {/* 선배가 알려줘요 (TIP) */}
          <SectionList
            title="선배가 알려줘요"
            moreText="전체보기 >"
            moreTo="/tip"
            items={tips}
          />

          {/* 신입이 질문해요 (QnA) */}
          <SectionList
            title="신입이 질문해요"
            moreText="전체보기 >"
            moreTo="/qna"
            items={qnas}
          />

          {/* 자유롭게 얘기해요 (Free) */}
          <SectionList
            title="자유롭게 얘기해요"
            moreText="전체보기 >"
            moreTo="/free"
            items={frees}
          />
        </div>
      </main>

      <Footer />

      {openOnboarding && <OnboardingModal onClose={dismiss} />}
    </div>
  )
}

/** 공통 섹션: 헤더 + 최신 3개 리스트 */
function SectionList({
  title,
  moreText,
  moreTo,
  items,
}: {
  title: string
  moreText: string
  moreTo: string
  items: BaseItem[]
}) {
  return (
    <section className="mb-[60px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-1 text-label-normal">{title}</h3>
        <Link
          to={moreTo}
          className="text-body-2 text-label-neutral hover:underline"
        >
          {moreText}
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl">
        {items.length === 0 ? (
          <EmptyRow />
        ) : (
          items.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              to={`${moreTo.replace(/\/$/, '')}/${p.id}`}
              className="block"
              style={{ textDecoration: 'none' }}
            >
              <PostRowCompact
                id={p.id}
                title={p.title}
                content={p.content}
                writer={p.writer}
                createdAt={p.createdAt}
                tags={p.tags}
                imageUrl={p.imageUrl ?? null}
                previewLines={1}
                showTags
                showDate
                density="comfortable"
                className="bg-white"
              />
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function EmptyRow() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[228px] py-10 bg-white rounded-xl">
      <img
        src="/icons/empty.svg"
        alt="아직 게시글이 없어요!"
        className="w-20 h-20 mb-4"
      />
      <p className="text-body-1sb text-label-normal">
        아직 작성한 글이 없어요!
      </p>
    </div>
  )
}
