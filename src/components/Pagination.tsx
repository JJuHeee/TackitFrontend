type Props = {
  currentPage: number // 1-base
  totalPages: number
  onPageChange: (page: number) => void
  groupSize?: number // 한 번에 보여줄 페이지 개수 (기본 5)
  className?: string
}

export default function PaginationGroup({
  currentPage,
  totalPages,
  onPageChange,
  groupSize = 5,
  className = '',
}: Props) {
  if (totalPages <= 1) return null

  const clamp = (n: number) => Math.min(Math.max(n, 1), totalPages)

  // 현재 페이지가 속한 그룹 계산 (0-base 그룹 인덱스)
  const currentGroup = Math.floor((currentPage - 1) / groupSize)
  const start = currentGroup * groupSize + 1
  const end = Math.min(start + groupSize - 1, totalPages)

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const isFirstGroup = start === 1
  const isLastGroup = end === totalPages

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
      {/* Prev Group */}
      <button
        type="button"
        className={navBtn(isFirstGroup)}
        onClick={() => !isFirstGroup && onPageChange(clamp(start - groupSize))}
        aria-label="Previous pages"
        disabled={isFirstGroup}
      >
        &lt;
      </button>

      {/* Page Numbers (fixed group size view) */}
      <ol className="flex items-center gap-2">
        {pages.map((p) => (
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
        ))}
      </ol>

      <button
        type="button"
        className={navBtn(isLastGroup)}
        onClick={() => !isLastGroup && onPageChange(clamp(end + 1))}
        aria-label="Next pages"
        disabled={isLastGroup}
      >
        &gt;
      </button>
    </nav>
  )
}
