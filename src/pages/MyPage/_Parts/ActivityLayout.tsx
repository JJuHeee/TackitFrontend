// components/navigation/Breadcrumbs.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

type BreadcrumbItem = { label: string; to?: string }

export default function Breadcrumbs({
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
        'flex items-center gap-1 text-title1-bold text-label-assistive mt-[60px]', // ✅ 여백 추가
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
                className="transition-colors hover:underline hover:text-label-normal"
              >
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
            {!isLast && <span className="mx-1">›</span>}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
