import * as React from 'react'
import { SectionTitle } from './SectionTitle'
import { FixedStatCard } from './FixedStatCard'

type MemberStats = {
  totalCount: number
  monthlyCount: number
  weeklyCount: number
}

type PostStats = {
  totalPosts: number
  deletedCount: number
}

type TimeStats = {
  dau: number
  mau: number
}

type Props = {
  memberStats: MemberStats
  postStats: PostStats
  timeStats: TimeStats
  ratio: number
}

export function DashboardStatsSection({
  memberStats,
  postStats,
  timeStats,
  ratio,
}: Props) {
  return (
    <>
      {/* 누적 지표 */}
      <SectionTitle>누적 지표</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[20px] flex-wrap">
        <FixedStatCard
          className="w-[533px] h-[112px]"
          title="총 가입자 수"
          value={memberStats.totalCount.toLocaleString()}
          suffix="명"
          iconSrc="/icons/admin/total-users.svg"
        />
        <FixedStatCard
          className="w-[533px] h-[112px]"
          title="총 게시글 수"
          value={postStats.totalPosts.toLocaleString()}
          suffix="개"
          iconSrc="/icons/admin/total-posts.svg"
        />
      </div>

      {/* 기간 지표 */}
      <SectionTitle>기간 지표</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[20px] flex-wrap">
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="이번 달 가입자 수"
          value={memberStats.monthlyCount.toLocaleString()}
          suffix="명"
          iconSrc="/icons/admin/monthly-signups.svg"
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="DAU"
          value={timeStats.dau.toLocaleString()}
          suffix="명"
          iconSrc="/icons/admin/dau.svg"
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="MAU"
          value={timeStats.mau.toLocaleString()}
          suffix="명"
          iconSrc="/icons/admin/mau.svg"
        />
        <FixedStatCard
          className="w-[256px] h-[112px]"
          title="DAU/MAU"
          value={ratio.toString()}
          suffix="%"
          iconSrc="/icons/admin/dau-mau.svg"
          valueClassName="text-[var(--label-primary)]"
        />
      </div>
    </>
  )
}
