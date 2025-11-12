import * as React from 'react'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import {
  Users,
  FileText,
  UserPlus,
  CalendarDays,
  UsersRound,
  Gauge,
  Trash2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="ml-[36px] mb-[20px] text-[var(--label-normal)] font-bold text-[20px] leading-[24px]">
      {children}
    </h2>
  )
}

function FixedStatCard({
  title,
  value,
  suffix,
  Icon,
  className,
  rightExtra, // 제목 옆에 붙일 요소(경고 아이콘 등)
}: {
  title: string
  value: React.ReactNode
  suffix?: string
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
  className: string
  rightExtra?: React.ReactNode
}) {
  return (
    <div
      className={[
        'bg-white ring-1 ring-[var(--line-normal)] rounded-[12px]',
        'px-[20px] py-[16px]',
        'flex items-center gap-[16px]',
        className,
      ].join(' ')}
      style={{ minHeight: 112 }}
    >
      {Icon && (
        <div className="shrink-0 w-[48px] h-[48px] rounded-[12px] bg-[var(--color-primary-50,#EEF5FF)] flex items-center justify-center">
          <Icon className="w-[24px] h-[24px]" aria-hidden />
        </div>
      )}

      {/* 본문 */}
      <div className="flex-1 min-w-0">
        {/* 제목줄: 제목 + 추가아이콘 나란히 */}
        <div className="flex items-center gap-[6px]">
          <p className="text-[15px] leading-[22px] text-[var(--label-neutral)] truncate">
            {title}
          </p>
          {rightExtra ? <div className="shrink-0">{rightExtra}</div> : null}
        </div>

        {/* 값 */}
        <div className="flex items-baseline gap-[4px] mt-[4px]">
          <span className="text-[24px] leading-none font-extrabold">
            {value}
          </span>
          {suffix ? (
            <span className="text-[14px] leading-[20px] text-[var(--label-neutral)]">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/** 연도 선택 캡슐 버튼 */
function YearPicker({
  year,
  onPrev,
  onNext,
}: {
  year: number
  onPrev: () => void
  onNext: () => void
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
        className="grid place-items-center w-[20px] h-[20px] rounded-full hover:bg-[var(--background-neutral)]"
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
        className="grid place-items-center w-[20px] h-[20px] rounded-full hover:bg-[var(--background-neutral)]"
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

/** 범례(● 점) */
function DotLegend() {
  return (
    <div className="flex items-center gap-[24px] ml-[8px] mb-[12px] text-[14px] text-[var(--label-neutral)]">
      <span className="inline-flex items-center gap-[8px]">
        <span
          className="inline-block w-[8px] h-[8px] rounded-full"
          style={{ background: 'var(--color-primary-300)' }}
        />
        월별 가입자 수
      </span>
      <span className="inline-flex items-center gap-[8px]">
        <span
          className="inline-block w-[8px] h-[8px] rounded-full"
          style={{ background: 'var(--color-primary-500)' }}
        />
        월별 활성 사용자(MAU)
      </span>
    </div>
  )
}

function ChevronRightBtn({
  onClick,
  ariaLabel,
}: {
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        absolute right-[16px] top-1/2 -translate-y-1/2
        grid place-items-center w-[28px] h-[28px]
        rounded-full hover:bg-[var(--background-neutral)]
        focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]
      "
    >
      <img
        src="/assets/icons/arrow-right.svg"
        alt="이동"
        className="w-[18px] h-[18px]"
      />
    </button>
  )
}

function BubbleTip({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="
        absolute bottom-[36px] left-1/2 -translate-x-1/2
        z-50
        rounded-[8px] px-[12px] py-[8px]
        flex items-center justify-center text-center
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
      "
      style={{
        width: 'max-content',
        maxWidth: 420,
        backgroundColor: 'var(--background-active)',
        color: 'var(--label-inverse)',
      }}
    >
      <span className="text-[14px] leading-[20px] font-medium">{children}</span>

      {/* 🔺 꼬리 (아이콘 바로 위에 붙게) */}
      <div
        className="
          absolute -bottom-[6px] left-1/2 -translate-x-1/2
          w-0 h-0
          border-x-[6px] border-x-transparent border-t-[6px]
        "
        style={{ borderTopColor: 'var(--background-active)' }}
      />
    </div>
  )
}

// --------------------------------------------
// Page
// --------------------------------------------
export default function AdminDashboardPage() {
  const USER_MANAGE_PATH = '/admin/users'
  const REPORT_MANAGE_PATH = '/admin/reports'
  const goUsers = () => {
    window.location.href = USER_MANAGE_PATH
  }
  const goReports = () => {
    window.location.href = REPORT_MANAGE_PATH
  }

  const [memberStats, setMemberStats] = React.useState({
    totalCount: 0,
    monthlyCount: 0,
    weeklyCount: 0,
  })
  const [postStats, setPostStats] = React.useState({
    totalPosts: 0,
    deletedCount: 0, // 비활성화(삭제) 게시글 수
  })
  const [deletedMembersCount, setDeletedMembersCount] = React.useState(0)

  const [ratio, setRatio] = React.useState(0) // DAU/MAU (%)
  const [timeStats, setTimeStats] = React.useState({ dau: 0, mau: 0 })

  const [series, setSeries] = React.useState(
    Array.from({ length: 12 }).map((_, i) => ({
      month: `${i + 1}월`,
      joined: 0,
      mau: 0,
    }))
  )

  const [year, setYear] = React.useState<number>(2025) // 기본 2025로
  const [warnOpen, setWarnOpen] = React.useState(false)

  const role =
    typeof window !== 'undefined' ? localStorage.getItem('role') : null

  // 현재 연/월 (Asia/Seoul 기준으로 JS Date 사용)
  const now = React.useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // 1~12

  // 그래프에 표시할 월 수 제한 (요구: 2025년 10월까지만)
  const capMonthsForYear = React.useCallback(
    (y: number) => {
      if (y < currentYear) return 12
      if (y > currentYear) return 0
      // 올해인 경우 현재 월까지만 (요구사항: 지금은 2025-10)
      return Math.min(currentMonth, 12)
    },
    [currentYear, currentMonth]
  )

  // ===== 데이터 로드 =====
  React.useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      // 1) 사용자 통계 (/api/admin/dashboard/user-statistics)
      try {
        const res = await api.get('/api/admin/dashboard/user-statistics', {
          headers,
        })
        setMemberStats(res.data) // { totalCount, monthlyCount, weeklyCount }
      } catch {
        // Fallback
        setMemberStats({ totalCount: 100, monthlyCount: 100, weeklyCount: 50 })
      }

      // 2) 총 게시글 수 (/api/admin/dashboard/posts/count)
      try {
        const r = await api.get('/api/admin/dashboard/posts/count', { headers })
        setPostStats((prev) => ({ ...prev, totalPosts: Number(r.data) || 0 }))
      } catch {
        setPostStats((prev) => ({ ...prev, totalPosts: 50 }))
      }

      // 3) 비활성화(삭제) 게시글 수 (/api/admin/dashboard/deleted-posts/count)
      try {
        const r = await api.get('/api/admin/dashboard/deleted-posts/count', {
          headers,
        })
        setPostStats((prev) => ({ ...prev, deletedCount: Number(r.data) || 0 }))
      } catch {
        setPostStats((prev) => ({ ...prev, deletedCount: 1 }))
      }

      // 4) 탈퇴 계정 수 (/api/admin/members/deleted)
      try {
        const r = await api.get('/api/admin/members/deleted', { headers })
        // r.data = { totalCount: number, members: [] }
        setDeletedMembersCount(Number(r.data?.totalCount) || 0)
      } catch {
        setDeletedMembersCount(2)
      }

      // 5) DAU, MAU (/api/admin/dashboard/users/dau, /api/admin/dashboard/users/mau)
      try {
        const dauResp = await api.get('/api/admin/dashboard/users/dau', {
          headers,
        })
        const mauResp = await api.get('/api/admin/dashboard/users/mau', {
          headers,
        })
        const dau = Number(dauResp.data) || 45
        const mau = Number(mauResp.data) || 600
        setTimeStats({ dau, mau })
        setRatio(mau ? Math.round((dau / mau) * 1000) / 10 : 0) // 소수 1자리
      } catch {
        const dau = 45
        const mau = 600
        setTimeStats({ dau, mau })
        setRatio(Math.round((dau / mau) * 1000) / 10)
      }
    }

    if (role === 'ADMIN') load()
  }, [role])

  const fetchSeries = React.useCallback(
    async (y: number) => {
      const cap = capMonthsForYear(y)

      try {
        const demoMAU = [
          60, 80, 112, 120, 90, 112, 112, 116, 126, 130, 115, 115,
        ]
        const demoJoined = [25, 40, 45, 50, 60, 68, 72, 74, 79, 85, 86, 93]
        const raw = demoMAU.map((m, i) => ({
          month: `${i + 1}월`,
          joined: demoJoined[i],
          mau: m,
        }))

        setSeries(raw.slice(0, cap))
      } catch {
        const demoMAU = [
          60, 80, 112, 120, 90, 112, 112, 116, 126, 130, 115, 115,
        ]
        const demoJoined = [25, 40, 45, 50, 60, 68, 72, 74, 79, 85, 86, 93]
        const raw = demoMAU.map((m, i) => ({
          month: `${i + 1}월`,
          joined: demoJoined[i],
          mau: m,
        }))
        setSeries(raw.slice(0, cap))
      }
    },
    [capMonthsForYear]
  )

  React.useEffect(() => {
    fetchSeries(year)
  }, [year, fetchSeries])

  return (
    <AdminLayout>
      {/* TopBar 아래 여백 32px */}
      <div className="mb-[32px]" />

      {/* ===== 누적 지표 ===== */}
      <SectionTitle>누적 지표</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[20px] flex-wrap">
        <FixedStatCard
          className="w-[533px] h-[112px]"
          title="총 가입자 수"
          value={memberStats.totalCount.toLocaleString()}
          suffix="명"
          Icon={Users}
        />
        <FixedStatCard
          className="w-[533px] h-[112px]"
          title="총 게시글 수"
          value={postStats.totalPosts.toLocaleString()}
          suffix="개"
          Icon={FileText}
        />
      </div>

      {/* ===== 기간 지표 ===== */}
      <SectionTitle>기간 지표</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[20px] flex-wrap">
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="이번 달 가입자 수"
          value={memberStats.monthlyCount.toLocaleString()}
          suffix="명"
          Icon={UserPlus}
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="DAU"
          value={timeStats.dau.toLocaleString()}
          suffix="명"
          Icon={CalendarDays}
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="MAU"
          value={timeStats.mau.toLocaleString()}
          suffix="명"
          Icon={UsersRound}
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="DAU/MAU"
          value={`${ratio}`}
          suffix="%"
          Icon={Gauge}
        />
      </div>

      {/* ===== 월별 추이 그래프 ===== */}
      <SectionTitle>월별 추이 그래프</SectionTitle>
      <div className="ml-[36px] mb-[32px] rounded-[12px] bg-white ring-1 ring-[var(--line-normal)] p-[20px] w-[1100px] max-w-[calc(100%-36px-24px)]">
        {/* 범례 + 연도 선택 */}
        <div className="flex items-center justify-between">
          <DotLegend />
          <YearPicker
            year={year}
            onPrev={() => setYear((y) => y - 1)}
            onNext={() => setYear((y) => y + 1)}
          />
        </div>

        {/* 차트 */}
        <div className="h-[320px] w-full mt-[4px]">
          <ChartDefs />
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ left: 8, right: 8, top: 16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--line-normal)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--label-neutral)' }}
              />
              <YAxis
                domain={[0, 'dataMax + 20']}
                tickCount={5}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--label-neutral)' }}
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

              {/* MAU: 연한 파랑 */}
              <Area
                type="monotone"
                dataKey="mau"
                stroke="var(--color-primary-300)"
                strokeWidth={2}
                fill="url(#gradMau)"
                dot={{ r: 3, strokeWidth: 0, fill: 'var(--color-primary-300)' }}
                activeDot={{ r: 5 }}
              />

              {/* joined: 진한 파랑 */}
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

      {/* ===== 주의/이슈 영역 ===== */}
      <SectionTitle>주의/이슈 영역</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[20px] flex-wrap">
        {/* 탈퇴 계정 카드 */}
        <div className="relative">
          <FixedStatCard
            className="w-[533px] h-[112px]"
            title="탈퇴 계정"
            value={deletedMembersCount.toLocaleString()}
            suffix="개"
            Icon={Trash2}
          />
          <ChevronRightBtn
            onClick={goUsers}
            ariaLabel="사용자 관리 페이지로 이동"
          />
        </div>

        {/* 삭제(비활성화) 게시글 카드 */}
        <div className="relative">
          <FixedStatCard
            className="w-[533px] h-[112px]"
            title="삭제 게시글/댓글"
            value={postStats.deletedCount.toLocaleString()}
            suffix="개"
            Icon={Trash2}
            rightExtra={
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setWarnOpen((v) => !v)}
                  className="p-[6px] rounded-[8px] hover:bg-[var(--background-neutral)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)]"
                  aria-label="주의 안내 열기"
                >
                  <img
                    src="/warning.svg"
                    alt="주의"
                    className="w-[20px] h-[20px]"
                  />
                </button>

                <BubbleTip open={warnOpen}>
                  신고 3회 누적 시 게시글은 비활성화되며, 댓글은 자동으로
                  삭제됩니다.
                </BubbleTip>
              </div>
            }
          />

          <ChevronRightBtn
            onClick={goReports}
            ariaLabel="신고 관리 페이지로 이동"
          />
        </div>
      </div>
    </AdminLayout>
  )
}
