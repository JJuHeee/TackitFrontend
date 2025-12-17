import * as React from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { SectionTitle } from './SectionTitle'

/** 연도 선택 버튼 */
function YearPicker({
  year,
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
}: {
  year: number
  onPrev: () => void
  onNext: () => void
  canPrev?: boolean
  canNext?: boolean
}) {
  return (
    <div
      className="inline-flex items-center gap-[12px] h-[40px] px-[18px] rounded-[20px] ring-1 ring-[var(--line-normal)] bg-white text-[18px] font-semibold text-[var(--label-normal)] select-none"
      aria-label="연도 선택"
    >
      <button
        type="button"
        aria-label="이전 연도"
        onClick={onPrev}
        disabled={!canPrev}
        className={[
          'grid place-items-center w-[20px] h-[20px] rounded-full',
          canPrev
            ? 'hover:bg-[var(--background-neutral)]'
            : 'opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 19L8 12L15 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {year}

      <button
        type="button"
        aria-label="다음 연도"
        onClick={onNext}
        disabled={!canNext}
        className={[
          'grid place-items-center w-[20px] h-[20px] rounded-full',
          canNext
            ? 'hover:bg-[var(--background-neutral)]'
            : 'opacity-40 cursor-not-allowed',
        ].join(' ')}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 5L16 12L9 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/** 차트 채우기용 그래디언트 */
function ChartDefs() {
  return (
    <svg width="0" height="0">
      <defs>
        <linearGradient id="gradJoined" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-primary-500)"
            stopOpacity="0.32"
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary-500)"
            stopOpacity="0.06"
          />
        </linearGradient>
        <linearGradient id="gradMau" x1="0" x2="0" y1="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-primary-300)"
            stopOpacity="0.28"
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary-300)"
            stopOpacity="0.06"
          />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** 범례 */
function DotLegend() {
  return (
    <div className="flex items-center gap-[24px] ml-[70px] text-body-2 text-label-neutral">
      <span className="inline-flex items-center gap-[8px]">
        <span className="inline-block w-[8px] h-[8px] rounded-full bg-primary-300" />
        월별 가입자 수
      </span>
      <span className="inline-flex items-center gap-[8px]">
        <span className="inline-block w-[8px] h-[8px] rounded-full bg-primary-500" />
        월별 활성 사용자(MAU)
      </span>
    </div>
  )
}

type SeriesItem = {
  month: string
  joined: number
  mau: number
}

export function DashboardGraphSection() {
  const [year, setYear] = React.useState<number>(2025)
  const [series, setSeries] = React.useState<SeriesItem[]>([])

  const now = React.useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const capMonthsForYear = React.useCallback(
    (y: number) => {
      if (y < currentYear) return 12
      if (y > currentYear) return 0
      return Math.min(currentMonth, 12)
    },
    [currentYear, currentMonth]
  )

  // 🔹 async / demo / api 전부 제거한 버전
  const fetchSeries = React.useCallback(
    (y: number) => {
      const cap = capMonthsForYear(y)

      const emptySeries: SeriesItem[] = Array.from({ length: 12 }).map(
        (_, i) => ({
          month: `${i + 1}월`,
          joined: 0,
          mau: 0,
        })
      )

      setSeries(emptySeries.slice(0, cap))
    },
    [capMonthsForYear]
  )

  React.useEffect(() => {
    fetchSeries(year)
  }, [year, fetchSeries])

  return (
    <>
      <SectionTitle>월별 추이 그래프</SectionTitle>
      <div className="ml-[36px] mb-[32px] rounded-[12px] bg-white p-[20px] w-[1086px] h-[416px] max-w-[calc(100%-36px-24px)]">
        <div className="flex items-center">
          <DotLegend />
          <div className="ml-auto">
            <YearPicker
              year={year}
              onPrev={() => setYear((y) => y - 1)}
              onNext={() => setYear((y) => y + 1)}
            />
          </div>
        </div>

        <div className="h-[320px] w-full mt-[4px]">
          <ChartDefs />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 16, bottom: 0, left: 20, right: 20 }}
            >
              <CartesianGrid
                stroke="var(--line-normal)"
                strokeWidth={1}
                strokeOpacity={1}
                horizontal={true}
                vertical={true}
              />

              <XAxis
                dataKey="month"
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: 'var(--line-normal)', strokeWidth: 1 }}
                tick={{ className: 'text-body-2 text-label-assistive' }}
              />

              <YAxis
                domain={[0, 200]}
                ticks={[0, 50, 100, 150, 200]}
                tickLine={false}
                axisLine={false}
                tick={{ className: 'text-body-2 text-label-assistive' }}
              />

              <Tooltip
                cursor={{ strokeOpacity: 0.08 }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid var(--line-normal)`,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                }}
                labelStyle={{ color: 'var(--label-neutral)' }}
              />

              <Area
                type="monotone"
                dataKey="mau"
                stroke="var(--color-primary-300)"
                strokeWidth={2}
                fill="url(#gradMau)"
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-primary-300)' }}
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="joined"
                stroke="var(--color-primary-500)"
                strokeWidth={2}
                fill="url(#gradJoined)"
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-primary-500)' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
