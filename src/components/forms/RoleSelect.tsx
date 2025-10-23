import * as React from 'react'
import { Button } from '../ui/Button'

export type Role = 'NEWBIE' | 'SENIOR'
type Props = {
  value: Role | ''
  onChange: (next: Role) => void
  showLabel?: boolean
  renderHelper?: (r: Role) => React.ReactNode
  renderIcon?: (r: Role) => React.ReactNode
  className?: string
  descriptionText?: string
}

const ROLE_ICONS: Record<Role, { src: string; alt: string }> = {
  NEWBIE: { src: '/icons/icon-newbie.svg', alt: 'newbie icon' },
  SENIOR: { src: '/icons/icon-senior.svg', alt: 'senior icon' },
}

export default function RoleSelect({
  value,
  onChange,
  showLabel = true,
  renderHelper,
  renderIcon,
  className = '',
  descriptionText = '선택한 역할에 따라 작성 가능한 게시판이 달라요. 매년 1월 1일, 신입은 자동으로 선배로 전환됩니다.',
}: Props) {
  const helper = React.useMemo(() => {
    if (!value) return null
    if (renderHelper) return renderHelper(value)
    return value === 'SENIOR'
      ? '신입에게 도움을 주고 TIP을 공유할 수 있어요.'
      : '선배들의 경험을 확인하고 질문을 남길 수 있어요.'
  }, [value, renderHelper])

  return (
    <div className={className}>
      {showLabel && (
        <>
          <label className="block mb-2 text-body-2sb text-label-normal">
            역할 <span className="text-system-red">*</span>
          </label>
          <p className="mt-1.5 text-caption text-label-neutral">
            {descriptionText}
          </p>
        </>
      )}

      <div className="grid grid-cols-2 gap-3 mt-2">
        <Button
          type="button"
          variant="outlined"
          size="outlinedM"
          onClick={() => onChange('NEWBIE')}
          className={
            value === 'NEWBIE' ? '!border-line-active !text-label-primary' : ''
          }
        >
          신입
        </Button>
        <Button
          type="button"
          variant="outlined"
          size="outlinedM"
          onClick={() => onChange('SENIOR')}
          className={
            value === 'SENIOR' ? '!border-line-active !text-label-primary' : ''
          }
        >
          선배
        </Button>
      </div>

      {value && (
        // h=40, w=full, r=8, bg-blue, 왼쪽 패딩 12px, 아이콘-텍스트 간격 8px
        <div className="mt-3 flex items-center h-10 w-full rounded-lg bg-[#EEF2FF] pl-3 pr-4 gap-2">
          {renderIcon ? (
            renderIcon(value)
          ) : (
            <img
              src={ROLE_ICONS[value].src}
              alt={ROLE_ICONS[value].alt}
              className="w-5 h-5 shrink-0"
            />
          )}
          <p className="text-body-2 text-label-normal">{helper}</p>
        </div>
      )}
    </div>
  )
}
