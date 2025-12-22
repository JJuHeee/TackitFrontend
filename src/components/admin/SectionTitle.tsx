/**
 * 섹션 제목 컴포넌트
 * - 관리자 대시보드 섹션의 제목 스타일을 공통으로 제공
 */

import * as React from 'react'

type Props = {
  children: React.ReactNode
}

export function SectionTitle({ children }: Props) {
  return (
    <h2
      className="
        ml-[36px] mb-[20px]
        text-title1-bold
        text-label-normal
      "
    >
      {children}
    </h2>
  )
}
