import React from 'react'
import clsx from 'clsx'

interface AuthCardProps {
  className?: string
  children: React.ReactNode
}

export function AuthCard({ className, children }: AuthCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl p-6',
        // 0px 8px 16px rgba(0,0,0,0.08)
        'shadow-[0_8px_16px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      {children}
    </div>
  )
}
