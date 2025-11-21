// src/components/auth/AuthResultCard.tsx
import React from 'react'
import { AuthCard } from '../ui/AuthCard'
import { Button } from '../ui/Button'

type Variant = 'success' | 'warning'

type AuthResultCardProps = {
  variant?: Variant
  title: string
  description?: string
  buttonLabel: string
  onButtonClick: () => void
  children?: React.ReactNode
}

export default function AuthResultCard({
  variant = 'success',
  title,
  description,
  buttonLabel,
  onButtonClick,
  children,
}: AuthResultCardProps) {
  const iconSrc =
    variant === 'success'
      ? '/icons/check-circle.svg'
      : '/icons/warning-circle.svg'

  const hasDescription = !!description
  const hasChildren = !!children

  const isDescriptionMode = hasDescription && !hasChildren
  const isChildrenMode = hasChildren && !hasDescription

  return (
    <AuthCard className="w-[440px] rounded-[12px] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col items-center justify-center">
        {/* 아이콘 (위 ↔ 제목 12px) */}
        <img
          src={iconSrc}
          alt={variant}
          className="mb-[12px] h-[23.1px] w-[23.1px]"
        />

        {/* 제목: 
            - 설명 모드: 아래 4px
            - children 모드: 아래 12px */}
        <h2
          className={`text-center text-title-2b text-label-normal ${
            isDescriptionMode ? 'mb-[4px]' : 'mb-[12px]'
          }`}
        >
          {title}
        </h2>

        {/* 1) 설명 있는 버전: icon → title → description → button
               간격: 12 / 4 / 24 */}
        {isDescriptionMode && (
          <>
            <p className="mb-[24px] text-center text-body-2 text-label-neutral">
              {description}
            </p>
            <Button
              variant="primary"
              size="m"
              className="w-full h-12"
              onClick={onButtonClick}
            >
              {buttonLabel}
            </Button>
          </>
        )}

        {/* 2) 설명 없고 children 있는 버전:
               icon → title → children → button
               간격: 12 / 12 / 24 */}
        {isChildrenMode && (
          <>
            <div
              className="
                mb-[24px]
                flex items-center justify-center
                w-[392px] h-[40px]
                rounded-[12px]
                bg-background-blue
                text-label-normal text-body-2
              "
            >
              {children}
            </div>
            <Button
              variant="primary"
              size="m"
              className="w-full h-12"
              onClick={onButtonClick}
            >
              {buttonLabel}
            </Button>
          </>
        )}

        {/* 설명도 children도 없을 때 fallback */}
        {!isDescriptionMode && !isChildrenMode && (
          <Button
            variant="primary"
            size="m"
            className="w-full h-12"
            onClick={onButtonClick}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
    </AuthCard>
  )
}
