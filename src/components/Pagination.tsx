import React from 'react'

type Props = {
  currentPage: number // 1-base
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number // 현재 페이지 양옆 개수
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}: Props) {
  if (totalPages <= 1) return null

  const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages)
  const createRange = (s: number, e: number) =>
    Array.from({ length: e - s + 1 }, (_, i) => s + i)

  const start = Math.max(2, currentPage - siblingCount)
  const end = Math.min(totalPages - 1, currentPage + siblingCount)

  const pages: (number | 'ellipsis')[] = [1]
  if (start > 2) pages.push('ellipsis')
  pages.push(...createRange(start, end))
  if (end < totalPages - 1) pages.push('ellipsis')
  pages.push(totalPages)

  const baseBtn =
    'inline-flex items-center justify-center w-8 h-8 rounded-lg text-body-2 transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--line-focus)]'

  const numberBtn = (page: number, isCurrent: boolean) =>
    [
      baseBtn,
      isCurrent
        ? 'bg-background-neutral text-label-normal'
        : 'text-label-neutral hover:text-label-normal',
    ].join(' ')

  const navBtn = (disabled: boolean) =>
    [
      baseBtn,
      disabled
        ? 'text-label-disable cursor-not-allowed'
        : 'text-label-neutral hover:text-label-normal',
    ].join(' ')

  return (
    <nav
      className={`flex items-center gap-3 select-none ${className}`}
      aria-label="Pagination"
    >
      {/* Prev */}
      <button
        type="button"
        className={navBtn(currentPage === 1)}
        onClick={() => currentPage > 1 && onPageChange(clamp(currentPage - 1))}
        aria-label="Previous page"
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* Page Numbers */}
      <ol className="flex items-center gap-2">
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <li key={`e-${idx}`} className="px-1 text-label-assistive">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={numberBtn(p, p === currentPage)}
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                aria-label={`Page ${p}`}
              >
                {p}
              </button>
            </li>
          )
        )}
      </ol>

      {/* Next */}
      <button
        type="button"
        className={navBtn(currentPage === totalPages)}
        onClick={() =>
          currentPage < totalPages && onPageChange(clamp(currentPage + 1))
        }
        aria-label="Next page"
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </nav>
  )
}
