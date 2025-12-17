import * as React from 'react'

type Props = {
  title: string
  value: React.ReactNode
  suffix?: string
  iconSrc?: string
  className: string
  rightExtra?: React.ReactNode
  valueClassName?: string
}

export function FixedStatCard({
  title,
  value,
  suffix,
  iconSrc,
  className,
  rightExtra,
  valueClassName,
}: Props) {
  return (
    <div
      className={[
        'bg-white rounded-[12px]',
        'px-[24px] py-[24px]',
        'flex items-center gap-[24px]',
        className,
      ].join(' ')}
      style={{ minHeight: 112 }}
    >
      {iconSrc && (
        <div className="shrink-0 w-[64px] h-[64px] flex items-center justify-center">
          <img
            src={iconSrc}
            alt={title}
            className="w-[64px] h-[64px] object-contain"
          />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[6px]">
          <p className="text-[15px] leading-[22px] text-[var(--label-neutral)] truncate">
            {title}
          </p>
          {rightExtra ? <div className="shrink-0">{rightExtra}</div> : null}
        </div>

        <div className="flex items-baseline gap-[4px] mt-[4px]">
          <span
            className={[
              'text-[24px] leading-none font-extrabold',
              valueClassName || '',
            ].join(' ')}
          >
            {value}
          </span>

          {suffix ? (
            <span
              className={[
                'text-[14px] leading-[20px]',
                valueClassName || 'text-[var(--label-neutral)]',
              ].join(' ')}
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
