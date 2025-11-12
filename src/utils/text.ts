import DOMPurify from 'dompurify'

export function toPlainText(html: string): string {
  if (!html) return ''
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
  return clean.replace(/\s+/g, ' ').trim()
}
