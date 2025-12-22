/**
 * 게시글 본문에서 커버 이미지 처리를 위한 유틸
 * - 업로드 전: base64 이미지 → COVER_TOKEN으로 치환
 * - 조회 시: COVER_TOKEN → 서버 이미지 URL로 복원
 */

export const COVER_TOKEN = '[[COVER]]'

export function replaceFirstDataUrlImgWithToken(html: string): string {
  if (!html) return html
  const dataUrlImgRegex = /<img[^>]*src="data:image\/[^"]+"[^>]*>/i
  return html.replace(dataUrlImgRegex, COVER_TOKEN)
}

export function hydrateCoverToken(
  html: string,
  imageUrl?: string | null
): string {
  if (!html) return html
  if (!html.includes(COVER_TOKEN)) return html
  const imgHtml = imageUrl ? `<img src="${imageUrl}" />` : ''
  return html.replace(COVER_TOKEN, imgHtml)
}
