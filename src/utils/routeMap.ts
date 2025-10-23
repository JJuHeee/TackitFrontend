export function toAppRoute(relatedUrl: string): string {
  const mapping: Record<string, string> = {
    'free-posts': 'free',
    'qna-post': 'qna',
    'tip-posts': 'tip',
  }
  return relatedUrl
    .replace(/^\/api\//, '/') // /api/ 제거
    .replace(
      /^(\/)(free-posts|qna-post|tips-post)(\/?)/,
      (_, slash, key, after) => {
        return `/${mapping[key]}${after}`
      }
    )
}
