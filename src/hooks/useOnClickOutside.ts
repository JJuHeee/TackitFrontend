// 알림 종 드롭다운 외부 클릭 감지용

import { useEffect } from 'react'

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (evt: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (evt: any) => {
      const el = ref.current
      if (!el || el.contains(evt.target)) return
      handler(evt)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
