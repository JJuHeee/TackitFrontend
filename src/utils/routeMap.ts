/**
 * 알림에 포함된 API 기반 URL을
 * 앱 내부 라우트 경로(/free, /qna, /tip)로 변환하는 유틸 함수
 */

export function toAppRoute(relatedUrl: string): string {
  const mapping: Record<string, string> = {
    'free-posts': 'free',
    'qna-post': 'qna',
    'tip-posts': 'tip',
  }

  return relatedUrl
    .replace(/^\/api\//, '/')
    .replace(
      /^(\/)(free-posts|qna-post|tip-posts)(\/?)/,
      (_, slash, key, after) => {
        return `/${mapping[key]}${after}`
      }
    )
}
