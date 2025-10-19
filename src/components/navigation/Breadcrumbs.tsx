// components/navigation/BreadcrumbSimple.tsx
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
      className={clsx(
        // ✅ 폰트 크기는 설정 키에 맞춰 'text-title-1' 로!
        'flex items-center gap-1 text-title-1',
        className
      )}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <React.Fragment key={idx}>
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className={clsx(
                  // ✅ 앞쪽 항목은 assistive 색상
                  'text-label-assistive transition-colors hover:underline hover:text-label-normal'
                )}
              >
                {item.label}
              </Link>
            ) : (
              // ✅ 마지막 항목(현재 페이지)은 normal 색상
              <span className="text-label-normal">{item.label}</span>
            )}
            {!isLast && <span className="mx-1 text-label-assistive">›</span>}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
