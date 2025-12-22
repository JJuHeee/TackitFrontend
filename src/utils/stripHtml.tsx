/**
 * HTML 문자열에서 태그를 제거하고 순수 텍스트로 변환한다.
 * - <br>, <p>, <div>, <li> 등 줄바꿈 역할 태그를 \n으로 치환
 * - 게시글 미리보기에서 줄바꿈이 유지되도록 처리
 */

export function stripHtml(html: string): string {
  const temp = document.createElement('div')

  const normalized = html
    // 줄바꿈 역할 태그들
    .replace(/\[\[cover\]\]/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre)>/gi, '\n')

  temp.innerHTML = normalized

  return temp.innerText || temp.textContent || ''
}
