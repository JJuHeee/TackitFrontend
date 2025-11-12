import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import MainFooter from '../../components/layouts/MainFooter'
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
    fetchPosts('/api/qna-posts?page=0&size=3&sort=createdAt,desc', toQna).then(
      setQnas
    )

    // FREE 최신 3개
    fetchPosts(
      '/api/free-posts?page=0&size=3&sort=createdAt,desc',
      toFree
    ).then(setFrees)
  }, [])

  useEffect(() => {
    // 최초 방문 시 온보딩 노출
    const seen = localStorage.getItem(ONBOARD_KEY)
    if (!seen) {
      setOpenOnboarding(true)
    }
    // 특정 라우팅에서 강제 노출하고 싶다면:
    if (state?.showOnboarding) {
      setOpenOnboarding(true)
    }
  }, [state?.showOnboarding])

  const dismiss = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem(ONBOARD_KEY, '1')
    }
    setOpenOnboarding(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-blue">
      <div className="mb-4">
        <HomeBar />
      </div>

      <main className="flex-1">
        <div className="home-container">
          {/* 배너: 아래 여백 112 */}
          <div className="home-banner !mb-[112px]">
            <img src="/banners/home-banner.svg" alt="홈 배너" />
          </div>

          {/* 인기 게시물 */}
          <PopularPostsSection />

          {/* 선배가 알려줘요 (TIP) */}
          <SectionList
            sectionTitle={
              <span className="flex items-center gap-2">
                <img
                  src="/icons/tip.svg"
                  alt="tip게시판 아이콘"
                  className="w-[40px] h-[40px]"
                />
                선배가 알려줘요
              </span>
            }
            moreText="전체보기 >"
            moreTo="/tip"
            items={tips}
          />

          {/* 신입이 질문해요 (QnA) */}
          <SectionList
            sectionTitle={
              <span className="flex items-center gap-2">
                <img
                  src="/icons/qna.svg"
                  alt="질문게시판 아이콘"
                  className="w-[40px] h-[40px]"
                />
                신입이 질문해요
              </span>
            }
            moreText="전체보기 >"
            moreTo="/qna"
            items={qnas}
          />

          {/* 자유게시판 (Free) */}
          <SectionList
            sectionTitle={
              <span className="flex items-center gap-2">
                <img
                  src="/icons/free.svg"
                  alt="자유게시판 아이콘"
                  className="w-[40px] h-[40px]"
                />
                다같이 얘기해요
              </span>
            }
            moreText="전체보기 >"
            moreTo="/free"
            items={frees}
          />
        </div>
      </main>

      <MainFooter />

      {openOnboarding && <OnboardingModal onClose={dismiss} />}
    </div>
  )
}

function SectionList({
  sectionTitle,
  moreText,
  moreTo,
  items,
}: {
  sectionTitle: React.ReactNode
  moreText: string
  moreTo: string
  items: BaseItem[]
}) {
  return (
    <section className="mb-[60px]">
      <div className="overflow-hidden bg-white rounded-xl">
        {/* 제목 + 더보기 버튼 */}
        <div className="flex items-center justify-between px-6 pt-6 mb-4">
          <h3 className="text-title-1 text-label-normal">{sectionTitle}</h3>
          <Link
            to={moreTo}
            className="text-body-2 text-label-neutral hover:underline"
          >
            {moreText}
          </Link>
        </div>

        {/* 게시글 리스트 */}
        <div>
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
                  imageUrl={p.imageUrl ?? undefined}
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
      </div>
    </section>
  )
}

function EmptyRow() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[228px] py-10 rounded-xl">
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
