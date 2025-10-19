import React from 'react'

type ChipProps = {
  label: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export default function Chip({
  label,
  selected = false,
  onClick,
  disabled = false,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center',
        'h-10 min-w-[66px] px-3 py-2 rounded-lg',
        'whitespace-nowrap select-none transition',
        selected
          ? 'bg-[var(--background-active)] text-[var(--label-inverse)] text-body-1sb' // ✅ 선택 시 semibold
          : 'bg-[var(--background-neutral)] text-[var(--label-normal)] text-body-1', // ✅ 기본은 regular
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--line-focus)] focus-visible:ring-offset-2',
        className,
      ].join(' ')}
    >
      {label}
    </button>
  )
}
