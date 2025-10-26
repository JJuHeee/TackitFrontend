/// <reference types="react-scripts" />

// (보수적으로 명시해주면 더 확실)
declare module '*.svg' {
  import * as React from 'react'
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >
  const src: string
  export default src
}
