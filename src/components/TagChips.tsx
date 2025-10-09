import React, { useEffect, useMemo, useState } from 'react'
import Chip from './Chip'
import api from '../api/api'

type Mode = 'single' | 'multiple'
type TagItem = { id: number | string; name: string }

type Props = {
  endpoint?: string
  mode?: Mode
  value?: number | string | (number | string)[] | null
  onChange?: (v: any) => void
  includeAllItem?: boolean
  className?: string
  gapPx?: number
  fallbackTags?: TagItem[]
}

export default function TagChips({
  endpoint = '/api/tags/list',
  mode = 'single',
  value = mode === 'single' ? null : [],
  onChange,
  includeAllItem = false,
  className = '',
  gapPx = 10,
  fallbackTags = [],
}: Props) {
  const [tags, setTags] = useState<TagItem[]>([])
  const [loading, setLoading] = useState(true)

  const normalize = (arr: any[]): TagItem[] =>
    (arr ?? []).map((t) => ({ id: t.id, name: t.tagName ?? t.name }))

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await api.get(endpoint)
        const raw = Array.isArray(res.data?.content)
          ? res.data.content
          : res.data
        const data = normalize(Array.isArray(raw) ? raw : [])

        if (!mounted) return

        const base = data.length > 0 ? data : fallbackTags
        setTags(includeAllItem ? [{ id: 0, name: '전체' }, ...base] : base)
      } catch {
        if (!mounted) return
        const base = fallbackTags
        setTags(includeAllItem ? [{ id: 0, name: '전체' }, ...base] : base)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [endpoint, includeAllItem, fallbackTags])

  const selectedSet = useMemo(() => {
    if (mode === 'single') {
      const hasValue = value !== null && value !== undefined
      return new Set(hasValue ? [String(value)] : [])
    }
    const arr = Array.isArray(value) ? (value as any[]) : []
    return new Set(arr.map(String))
  }, [value, mode])

  const toggle = (id: number | string) => {
    if (!onChange) return
    const key = String(id)

    if (mode === 'single') {
      if (key === '0') {
        onChange(0)
        return
      }
      onChange(selectedSet.has(key) ? 0 : id)
    } else {
      const next = new Set(selectedSet)
      next.has(key) ? next.delete(key) : next.add(key)
      onChange(Array.from(next))
    }
  }

  if (loading) return <div className="h-10" />

  return (
    <div
      className={`flex flex-wrap ${className}`}
      style={{ gap: `${gapPx}px` }}
    >
      {tags.map((t) => (
        <Chip
          key={t.id}
          label={t.name}
          selected={selectedSet.has(String(t.id))}
          onClick={() => toggle(t.id)}
        />
      ))}
    </div>
  )
}
