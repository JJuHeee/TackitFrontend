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
