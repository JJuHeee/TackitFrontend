import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  // 공통 스타일
  'inline-flex items-center justify-center font-semibold rounded-2xl transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed',
  {
    variants: {
      // 버튼 종류
      variant: {
        // Main 버튼
        primary: `
          bg-interaction-normal text-white
          hover:bg-interaction-hover
          active:bg-interaction-active
          disabled:bg-interaction-disable
          disabled:text-label-disable
        `,
        // Outlined 버튼
        outlined: `
          border border-line-normal text-label-normal bg-white
          hover:bg-gray-50
          active:border-line-active active:text-interaction-normal
          disabled:text-label-disable disabled:border-line-normal
        `,
      },
      // 버튼 사이즈
      size: {
        m: 'h-12 w-[343px] text-body-1sb', // Main 버튼
        outlinedM: 'h-12 w-[165.5px] text-body-1sb', // Outlined M 버튼
        outlinedS: 'h-9 w-[61px] text-body-2', // Outlined S 버튼
      },
    },
    // 기본값
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
