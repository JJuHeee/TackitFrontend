/**
 * 사용자 입력 HTML을 안전하게 렌더링하기 위한 XSS 방지 처리
 */

import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
