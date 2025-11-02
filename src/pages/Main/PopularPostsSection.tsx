// src/components/home/PopularPostsSection.tsx
import React, { useEffect, useState } from 'react'
import PopularPostCard, {
  PopularPost,
} from '../../components/posts/PopularPostCard'
import api from '../../api/api'

type ApiPopularPost = {
  id: number
  writer: string
  profileImageUrl: string | null
  title: string
  content: string
  createdAt: string
  type: 'FREE_POST' | 'QNA_POST' | 'TIP_POST' | string
  viewCount: number | null
  scrapCount: number | null
}

const toPopularPost = (x: ApiPopularPost): PopularPost => ({
  id: x.id,
  writer: x.writer,
  profileImageUrl: x.profileImageUrl ?? null,
  title: x.title,
  content: x.content ?? '',
  createdAt: x.createdAt,
  type: x.type,
  viewCount: x.viewCount ?? null,
  scrapCount: x.scrapCount ?? null,
})

const scoreOf = (p: PopularPost) =>
  Math.max(p.viewCount ?? 0, p.scrapCount ?? 0)

export default function PopularPostsSection() {
  const [items, setItems] = useState<PopularPost[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get<ApiPopularPost[]>('/api/home/popular')
        if (!mounted) return

        const arr = Array.isArray(res.data) ? res.data.map(toPopularPost) : []
        if (!arr.length) {
          setItems([]) // ✅ fallback 없이 빈 배열
          return
        }

        // 인기 점수순 → 최신순
        const sorted = arr
          .slice()
          .sort((a, b) => {
            const s = scoreOf(b) - scoreOf(a)
            if (s !== 0) return s
            return (b.createdAt || '').localeCompare(a.createdAt || '')
          })
          .slice(0, 3)

        setItems(sorted)
      } catch {
        setItems([]) // ✅ 요청 실패 시에도 fallback 대신 빈 상태
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  if (loading)
    return (
      <div className="text-body2-regular text-[var(--label-neutral)] mb-[24px]">
        불러오는 중...
      </div>
    )

  if (!items.length) return null

  return (
    <section className="mb-[24px]">
      <div className="flex gap-[25px] flex-wrap">
        {items.map((post, i) => (
          <PopularPostCard
            key={`${post.type}-${post.id}`}
            post={post}
            rank={i + 1}
          />
        ))}
      </div>
    </section>
  )
}
