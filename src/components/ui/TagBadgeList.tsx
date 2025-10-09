import React, { useEffect, useState } from 'react'
import TagBadge from './TagBadge'

type RawTag = string | { id?: number | string; name: string }

type TagBadgeListProps = {
  endpoint?: string
  dataKey?: string
  tags?: RawTag[]
  className?: string
  gapPx?: number
}

const TagBadgeList: React.FC<TagBadgeListProps> = ({
  endpoint,
  dataKey,
  tags,
  className = '',
  gapPx = 8,
}) => {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tags && tags.length) {
      const normalized = tags
        .map((t) => (typeof t === 'string' ? t : t?.name))
        .filter(Boolean) as string[]
      setItems(normalized)
      return
    }

    if (!endpoint) return
    let cancelled = false

    const fetchTags = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(endpoint, { credentials: 'include' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        const raw: RawTag[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.[dataKey ?? 'data'])
          ? json[dataKey ?? 'data']
          : []

        const normalized = raw
          .map((t) => (typeof t === 'string' ? t : t?.name))
          .filter(Boolean) as string[]

        if (!cancelled) setItems(normalized)
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTags()
    return () => {
      cancelled = true
    }
  }, [endpoint, dataKey, tags])

  if (loading || error || !items.length) return null

  return (
    <div
      className={['flex flex-wrap', className].join(' ')}
      style={{ gap: `${gapPx}px` }}
    >
      {items.map((tag, i) => (
        <TagBadge key={i} label={tag} />
      ))}
    </div>
  )
}

export default TagBadgeList
