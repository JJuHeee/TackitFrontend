// src/pages/Main/MainPage.tsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import Footer from '../../components/layouts/Footer'
import api from '../../api/api'
import PostRowCompact from '../../components/posts/PostRowCompact'
import './MainPage.css'
import {
  fallbackQnaPosts,
  fallbackFreePosts,
  fallbackTipPosts,
} from '../../data/fallbackPosts'

// ---------- 공통 타입 ----------
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
  page?: number
  content: T[]
  size?: number
  totalElements?: number
  totalPages?: number
}

// ---------- 응답 정규화 ----------
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
  id: x.postId, // ✅ QnA는 postId
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

// ---------- 공통 fetch + fallback ----------
async function fetchWithFallback(
  url: string,
  mapFn: (x: any) => BaseItem,
  fallback: { content: any[] }
) {
  try {
    const { data } = await api.get<PageResponse<any>>(url)
    const arr = (data?.content ?? []).map(mapFn)
    if (arr.length) return arr
  } catch {
    // ignore
  }
  return (fallback.content ?? []).map(mapFn)
}

export default function MainPage() {
  const [tips, setTips] = useState<BaseItem[]>([])
  const [qnas, setQnas] = useState<BaseItem[]>([])
  const [frees, setFrees] = useState<BaseItem[]>([])

  useEffect(() => {
    // TIP 최신 3개
    fetchWithFallback(
      '/api/tip-posts?page=0&size=3&sort=createdAt,desc',
      toTip,
      fallbackTipPosts
    ).then(setTips)

    // QNA 최신 3개
    fetchWithFallback(
      '/api/qna-post/list?page=0&size=3&sort=createdAt,desc',
      toQna,
      fallbackQnaPosts
    ).then(setQnas)

    // FREE 최신 3개
    fetchWithFallback(
      '/api/free-posts?page=0&size=3&sort=createdAt,desc',
      toFree,
      fallbackFreePosts
    ).then(setFrees)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <HomeBar />

      <main className="flex-1">
        <div className="home-container">
          {/* 배너: 아래 여백 80 */}
          <div className="home-banner mb-[80px]">
            <img src="/banners/home-banner.svg" alt="홈 배너" />
          </div>

          {/* 이번주 인기 게시물(헤더만, 공간 비워둠) */}
          <section className="mb-[60px]">
            <h2 className="text-title-1 text-label-normal">
              이번주 인기 게시물
            </h2>
            {/* TODO: 카드/차트 자리 */}
          </section>

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
      {/* 헤더: title1-bold / label-normal + 오른쪽 전체보기(body2-regular / label-neutral) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-1 text-label-normal">{title}</h3>
        <Link
          to={moreTo}
          className="text-body-2 text-label-neutral hover:underline"
        >
          {moreText}
        </Link>
      </div>

      {/* 리스트: PostRowCompact 사용 (섹션 외곽선 없음) */}
      {/* 리스트: PostRowCompact 사용 (섹션 외곽선 없음) */}
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
                previewLines={1} // ✅ 미리보기 1줄
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
    <div className="py-16 text-center text-body-2">아직 게시글이 없어요.</div>
  )
}
