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
          ? 'bg-[var(--background-active)] text-[var(--label-inverse)]'
          : 'bg-[var(--background-neutral)] text-[var(--label-normal)]',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-95',
        'text-body-2',
        className,
      ].join(' ')}
    >
      {label}
    </button>
  )
}
