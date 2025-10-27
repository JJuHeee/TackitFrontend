// src/components/home/PopularPostsSection.tsx
import React, { useEffect, useState } from 'react'
import PopularPostCard, {
  PopularPost,
} from '../../components/posts/PopularPostCard'
import api from '../../api/api'
import { fallbackPopularPosts } from '../../data/fallbackPopularPosts'

export default function PopularPostsSection() {
  const [items, setItems] = useState<PopularPost[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api.get<PopularPost[]>('/api/home/popular')
        if (!mounted) return
        const data =
          Array.isArray(res.data) && res.data.length
            ? res.data.slice(0, 3)
            : fallbackPopularPosts

        setItems(data)
      } catch {
        setItems(fallbackPopularPosts)
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
          <PopularPostCard key={post.id} post={post} rank={i + 1} />
        ))}
      </div>
    </section>
  )
}
