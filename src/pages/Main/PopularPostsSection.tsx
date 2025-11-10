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
  ...x,
  profileImageUrl: x.profileImageUrl ?? null,
  content: x.content ?? '',
  viewCount: x.viewCount ?? 0,
  scrapCount: x.scrapCount ?? 0,
})

// ✅ (type,id) 기준 중복 제거 함수
function dedupe(arr: ApiPopularPost[]) {
  const seen = new Set<string>()
  return arr.filter((x) => {
    const key = `${x.type}:${x.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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

        let arr = Array.isArray(res.data) ? res.data : []
        arr = dedupe(arr) // ✅ 중복 제거
        arr = arr.slice(0, 3) // ✅ Top 3만 사용

        setItems(arr.map(toPopularPost))
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mb-[60px]">
      <h2 className="flex items-center gap-2 text-title-1 text-label-normal">
        <img
          src="/icons/popular.svg"
          alt="인기 게시물 아이콘"
          className="ml-[24px] w-[40px] h-[40px]"
        />
        이번주 인기 게시글
      </h2>

      <div className="mt-[24px] flex gap-[25px] flex-wrap">
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
