import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: `
          bg-interaction-normal text-label-inverse rounded-xl
          hover:bg-interaction-hover hover:text-label-inverse
          active:bg-interaction-active active:text-label-inverse
          disabled:bg-interaction-disable disabled:text-label-disable
        `,
        outlined: `
          border border-line-normal text-label-normal bg-white rounded-xl
          hover:bg-gray-50
          active:border-line-active
          disabled:text-label-disable disabled:border-line-normal
        `,
      },
      size: {
        m: 'h-12 w-[343px] text-body-1sb rounded-xl',
        outlinedM:
          'h-12 w-[165.5px] text-body-1sb active:text-label-primary rounded-xl',
        outlinedS: 'h-9 px-3 text-body-2 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'm',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

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
