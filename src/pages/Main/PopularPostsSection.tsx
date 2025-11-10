import React, { useEffect, useState } from 'react'
import PopularPostCard, {
  type PopularPost,
} from '../../components/posts/PopularPostCard'
import api from '../../api/api'

type ApiPopularPost = {
  id: number
  writer: string
  profileImageUrl: string | null
  title: string
  content: string | null
  createdAt: string
  type: 'FREE_POST' | 'QNA_POST' | 'TIP_POST' | string
  viewCount: number | null
  scrapCount: number | null
}

const toPopularPost = (x: ApiPopularPost): PopularPost => ({
  ...x,
  // 컴포넌트가 undefined를 기대할 수 있으므로 null -> undefined 치환
  profileImageUrl: x.profileImageUrl ?? undefined,
  content: x.content ?? '',
  viewCount: x.viewCount ?? 0,
  scrapCount: x.scrapCount ?? 0,
})

// (type,id) 기준 중복 제거
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
  // loading을 실제로 사용하거나, 아래 줄을 삭제하세요.
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get<ApiPopularPost[]>('/api/home/popular')
        if (!mounted) return

        let arr: ApiPopularPost[] = Array.isArray(res.data) ? res.data : []
        arr = dedupe(arr).slice(0, 3)
        setItems(arr.map(toPopularPost))
      } catch {
        setItems([])
      } finally {
        if (mounted) setLoading(false)
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

      {/* loading 활용 예시: 필요 없으면 제거 */}
      {/* {loading && <p className="mt-2 text-label-assistive">불러오는 중…</p>} */}

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
