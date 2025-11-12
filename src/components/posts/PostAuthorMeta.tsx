type Role = 'NEWBIE' | 'SENIOR'

type PostAuthorMetaProps = {
  writer?: string
  createdAt?: string
  className?: string
  role?: Role
  joinedYear?: number
  profileImageUrl?: string | null

  /** ⬇ 폰트 스타일 분기용 */
  variant?: 'default' | 'compact'

  /** ⬇ 세부 오버라이드(원하면 개별적으로 덮어쓰기) */
  nameClassName?: string
  yearsClassName?: string
  dateClassName?: string
}

export default function PostAuthorMeta({
  writer,
  createdAt,
  className,
  role,
  joinedYear,
  profileImageUrl,
  variant = 'default',
  nameClassName,
  yearsClassName,
  dateClassName,
}: PostAuthorMetaProps) {
  const formatDate = (s?: string) => {
    if (!s) return '-'
    const d = new Date(s)

    if (variant === 'compact') {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}년 ${month}월 ${day}일`
    } else {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    }
  }

  const calcYears = (jy?: number) => {
    if (!jy) return null
    const nowYear = new Date().getFullYear()
    const n = nowYear - jy + 1
    return n > 0 ? n : null
  }

  const years = role === 'SENIOR' ? calcYears(joinedYear) : null
  const roleBadgeSrc =
    role === 'NEWBIE'
      ? '/icons/신입.svg'
      : role === 'SENIOR'
      ? '/icons/선배.svg'
      : null

  const nameCls =
    nameClassName ??
    (variant === 'compact'
      ? 'text-caption-regular text-label-neutral'
      : 'text-body-1sb text-label-normal')

  const yearsCls = yearsClassName ?? 'text-caption-regular text-primary-600'

  const dateCls =
    dateClassName ??
    (variant === 'compact'
      ? 'text-caption-regular text-label-neutral'
      : 'text-body-1 text-label-neutral')

  return (
    <div
      className={`post-author-meta flex items-center gap-2 ${className ?? ''}`}
    >
      {/* 프로필 이미지 */}
      <img
        src={profileImageUrl || '/icons/mypage-icon.svg'}
        alt="작성자 프로필"
        className="object-cover w-6 h-6 rounded-full shrink-0"
        loading="lazy"
      />

      {/* 닉네임 + 뱃지 + 년차 */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className={nameCls}>{writer || ''}</span>

          {/* 역할 뱃지 (20×20) */}
          {roleBadgeSrc && (
            <img
              src={roleBadgeSrc}
              alt={role === 'NEWBIE' ? '신입' : '선배'}
              className="w-5 h-5"
            />
          )}

          {/* 선배일 경우 년차 표시 */}
          {typeof years === 'number' && (
            <span className={yearsCls}>{years}년차</span>
          )}
        </span>

        {/* 구분선 */}
        <span className="text-label-assistive">|</span>

        {/* 날짜 */}
        <span className={dateCls}>{formatDate(createdAt)}</span>
      </div>
    </div>
  )
}
