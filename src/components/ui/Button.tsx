import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-2xl transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: `
          bg-interaction-normal text-label-inverse
          hover:bg-interaction-hover hover:text-label-inverse
          active:bg-interaction-active active:text-label-inverse
          disabled:bg-interaction-disable disabled:text-label-disable
        `,
        // ✅ 텍스트 색 고정 제거 (선택 상태는 페이지에서 className으로 제어)
        outlined: `
          border border-line-normal text-label-normal bg-white
          hover:bg-gray-50
          active:border-line-active
          disabled:text-label-disable disabled:border-line-normal
        `,
      },
      size: {
        m: 'h-12 w-[343px] text-body-1sb',
        // 눌렀을 때(pressed)만 파란 글자 필요하면 유지
        outlinedM: 'h-12 w-[165.5px] text-body-1sb active:text-label-primary',
        outlinedS: 'h-9 w-[61px] text-body-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'm',
    },
  }
)

// Props 타입 정의
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

// 컴포넌트 구현
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
