/**
 * 브레드크럼 네비게이션 컴포넌트(마이페이지)
 * - 상위 경로로 이동 가능한 링크 제공
 * - 현재 페이지 위치 시각화
 */

import React from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

type BreadcrumbItem = {
  label: string
  to?: string
}

export default function BreadcrumbSimple({
  items,
  className = '',
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx('flex items-center gap-1 text-title-1', className)}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <React.Fragment key={idx}>
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className={clsx(
                  'text-label-assistive transition-colors hover:underline hover:text-label-normal'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-label-normal">{item.label}</span>
            )}
            {!isLast && <span className="mx-1 text-label-assistive">›</span>}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
