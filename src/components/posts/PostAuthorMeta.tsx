/**
 * 공용 작성자 메타 정보 컴포넌트
 *
 * - 작성자 이름, 프로필 이미지, 역할(신입/선배), 연차, 작성일 표시
 * - variant에 따라 날짜 포맷 및 타이포 스타일 분기 (default / compact)
 * - writer가 없을 경우 날짜만 렌더링
 */

export type Role = 'NEWBIE' | 'SENIOR'

type PostAuthorMetaProps = {
  writer?: string
  createdAt?: string
  className?: string
  role?: Role
  joinedYear?: number
  profileImageUrl?: string | null
  variant?: 'default' | 'compact'
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
      ? '/icons/newbie.svg'
      : role === 'SENIOR'
      ? '/icons/senior.svg'
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
      className={`post-author-meta flex items-center ${writer ? 'gap-2' : ''} ${
        className ?? ''
      }`}
    >
      {writer && (
        <img
          src={profileImageUrl || '/icons/mypage-icon.svg'}
          alt="작성자 프로필"
          className="object-cover w-6 h-6 rounded-full shrink-0"
          loading="lazy"
        />
      )}

      {writer && (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5">
            <span className={nameCls}>{writer}</span>

            {roleBadgeSrc && (
              <img
                src={roleBadgeSrc}
                alt={role === 'NEWBIE' ? '신입' : '선배'}
                className="w-5 h-5"
              />
            )}

            {typeof years === 'number' && (
              <span className={yearsCls}>{years}년차</span>
            )}
          </span>
        </div>
      )}

      {writer && <span className="text-label-assistive">|</span>}

      {/* 날짜만 표시될 때 앞에 여백 없음 */}
      <span className={dateCls}>{formatDate(createdAt)}</span>
    </div>
  )
}
