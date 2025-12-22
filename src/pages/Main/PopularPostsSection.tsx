/**
 * 홈 화면의 인기 게시글 섹션
 * - 인기 게시글 API를 조회하여 상위 게시글을 가져옴
 * - 중복 게시글 제거 후 최대 3개만 PopularPostCard로 렌더링
 */

import { useEffect, useState } from 'react'
import PopularPostCard, {
  type PopularPost,
} from '../../components/posts/PopularPostCard'
import api from '../../api/api'
import { stripHtml } from '../../utils/stripHtml'

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
  profileImageUrl: x.profileImageUrl ?? undefined,
  content: x.content ? stripHtml(x.content) : '',
  viewCount: x.viewCount ?? 0,
  scrapCount: x.scrapCount ?? 0,
})

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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get<ApiPopularPost[]>('/api/home/popular')
        if (!mounted) return

        const arr = dedupe(Array.isArray(res.data) ? res.data : []).slice(0, 3)
        setItems(arr.map(toPopularPost))
      } catch {
        setItems([])
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
