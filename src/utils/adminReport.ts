export function toReportPostTypePath(t: string) {
  if (t === 'FREE') return 'Free'
  if (t === 'QNA') return 'Qna'
  if (t === 'TIP') return 'Tip'
  return null
}
