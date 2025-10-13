import DOMPurify from 'dompurify'

const hasDOM = typeof window !== 'undefined' && typeof document !== 'undefined'

export function toPlainText(html: string): string {
  if (!html) return ''
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  return clean.replace(/\s+/g, ' ').trim()
}
