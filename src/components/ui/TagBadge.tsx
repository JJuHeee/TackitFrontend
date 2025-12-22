/**
 * Design System – Tag
 */

import React from 'react'

type TagBadgeProps = {
  label: string
  className?: string
}

const TagBadge: React.FC<TagBadgeProps> = ({ label, className = '' }) => {
  return (
    <span
      className={[
        'inline-flex items-center justify-center whitespace-nowrap select-none',
        'px-4 py-1 rounded-lg font-medium',
        'bg-[var(--background-blue)] text-[var(--label-primary)]',
        className,
      ].join(' ')}
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-body2-r)',
        lineHeight: 'var(--lh-body2-r)',
        letterSpacing: 'var(--ls-body2-r)',
        fontWeight: 400,
      }}
    >
      {label}
    </span>
  )
}

export default TagBadge
