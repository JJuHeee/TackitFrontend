export function toAppRoute(relatedUrl: string): string {
  return relatedUrl.replace(/^\/api\//, '/')
}
