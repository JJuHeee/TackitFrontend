// src/constants/boardApi.ts
export type Board = 'free' | 'qna' | 'tip'

// ✅ 태그 전체 목록 (게시판별)
export const TAG_LIST_ENDPOINT: Record<Board, string> = {
  free: '/api/free_tags',
  qna: '/api/qna-tags/list',
  tip: '/api/tip-tags/list',
}

// ✅ 태그별 게시글 목록 (게시판별)
export const TAG_POSTS_ENDPOINT: Record<
  Board,
  (id: number | string) => string
> = {
  free: (id) => `/api/free_tags/${id}/posts`,
  qna: (id) => `/api/qna-tags/${id}/posts`,
  tip: (id) => `/api/tip-tags/${id}/posts`,
}

// ✅ 전체 게시글 목록 (게시판별)
export const ALL_POSTS_ENDPOINT: Record<Board, string> = {
  free: '/api/free-posts',
  qna: '/api/qna-post/list',
  tip: '/api/tip-posts',
}

// 💡 공통 URL 빌더 (페이지네이션/정렬 파라미터 포함)
type ListParams = { page: number; size?: number; sort?: string }
export function buildListUrl(
  base: string,
  { page, size = 5, sort = 'createdAt,desc' }: ListParams
) {
  const usp = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  })
  return `${base}?${usp.toString()}`
}
