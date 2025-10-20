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
