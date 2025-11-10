import React from 'react'

type Role = 'NEWBIE' | 'SENIOR'

type PostAuthorMetaProps = {
  writer?: string
  createdAt?: string
  className?: string
  role?: Role
  joinedYear?: number
  profileImageUrl?: string | null
}

export default function PostAuthorMeta({
  writer,
  createdAt,
  className,
  role,
  joinedYear,
  profileImageUrl,
}: PostAuthorMetaProps) {
  const formatDate = (s?: string) => {
    if (!s) return '-'
    const d = new Date(s)
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 입사해 포함 n년차 계산 (예: 2023 → 2025년엔 3년차)
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

  return (
    <div
      className={`post-author-meta flex items-center gap-2 ${className ?? ''}`}
    >
      {/* 프로필 이미지 */}
      <img
        src={profileImageUrl || '/icons/mypage-icon.svg'}
        alt="작성자 프로필"
        className="object-cover w-6 h-6 rounded-full"
      />

      {/* 닉네임 + 뱃지 + 년차 */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5">
          <span className="text-body-1sb text-label-normal">
            {writer || ''}
          </span>

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
            <span className="text-body-1sb text-primary-600">{years}년차</span>
          )}
        </span>

        {/* 구분선 */}
        <span className="text-label-assistive">|</span>

        {/* 날짜 */}
        <span className="text-body-2 text-label-neutral">
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  )
}
