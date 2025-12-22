/**
 * event-source-polyfill 라이브러리의 타입 정보를 보강하기 위한 TypeScript 선언 파일
 * - Authorization 헤더, heartbeatTimeout 등 커스텀 옵션 타입 정의
 */

declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillInit extends EventSourceInit {
    headers?: Record<string, string>
    heartbeatTimeout?: number
    withCredentials?: boolean
  }

  export class EventSourcePolyfill {
    constructor(url: string, eventSourceInitDict?: EventSourcePolyfillInit)
    onopen: ((ev: Event) => any) | null
    onmessage: ((ev: MessageEvent) => any) | null
    onerror: ((ev: Event) => any) | null
    addEventListener(type: string, listener: (evt: any) => void): void
    removeEventListener(type: string, listener: (evt: any) => void): void
    close(): void
    readonly url: string
    readonly readyState: number
    withCredentials: boolean
  }

  export const NativeEventSource:
    | (typeof window extends any ? typeof window.EventSource : any)
    | undefined
  export const EventSource:
    | (typeof window extends any ? typeof window.EventSource : any)
    | undefined

  export default EventSourcePolyfill
}
