/**
 * 글쓰기 버튼 (아이콘 18x18, 텍스트 고정)
 */
type WriteButtonProps = {
  onClick?: () => void
  disabled?: boolean
}

export default function WriteButton({
  onClick,
  disabled = false,
}: WriteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        w-[104px] h-[48px] px-4 py-3
        rounded-[12px]
        bg-primary-500 text-label-inverse
        text-body-1sb font-sans
        transition-colors duration-200
        hover:bg-primary-600 active:bg-primary-700
        disabled:bg-gray-300 disabled:cursor-not-allowed
      `}
    >
      <img
        src="/icons/add.svg"
        alt="글쓰기 아이콘"
        className="w-[18px] h-[18px]"
      />
      <span>글쓰기</span>
    </button>
  )
}
