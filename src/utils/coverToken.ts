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
