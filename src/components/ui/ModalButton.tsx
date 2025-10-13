import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

/**
 * Modal Button Variants
 * primary → 파란색 (확인)
 * ghost   → 흰색 + 회색 보더 (취소)
 */
const modalButtonVariants = cva(
  `
  inline-flex items-center justify-center font-semibold transition-all select-none
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2
  disabled:cursor-not-allowed rounded-xl
  `,
  {
    variants: {
      variant: {
        primary: `

         bg-interaction-normal text-label-inverse
         hover:bg-interaction-hover
         active:bg-interaction-active
        disabled:bg-interaction-disable disabled:text-label-disable
        `,
        ghost: `
          bg-[var(--background-common)]
          border border-[var(--line-normal)]
          text-[var(--label-normal)]
          hover:bg-[var(--background-hover)]
          active:border-[var(--line-active)]
          disabled:text-[var(--label-disable)] disabled:border-[var(--line-normal)]
        `,
      },
      size: {
        s: 'h-9 px-4 text-body-2 rounded-lg',
        m: 'h-11 px-5 text-body-1sb rounded-xl',
        l: 'w-[165px] h-[45px] text-body-1sb rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'l', // 기본 L 사이즈로 지정
    },
  }
)

export interface ModalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modalButtonVariants> {}

export const ModalButton = React.forwardRef<
  HTMLButtonElement,
  ModalButtonProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(modalButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  )
})

ModalButton.displayName = 'ModalButton'

export default ModalButton
