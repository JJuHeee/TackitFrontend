/**
 * AdminDashboardPage (관리자 대시보드 페이지)
 *
 * 역할
 * - 관리자(ADMIN) 전용 대시보드 화면
 * - 여러 통계 API를 호출해 대시보드용 데이터로 가공 후 하위 섹션 컴포넌트에 전달
 *
 * 구현 메모
 * - 관리자 페이지 간 이동 후 재진입 시 로딩 지연을 줄이기 위해
 *   간단한 in-memory 캐시(dashboardCache) 사용
 * - 일부 API는 백엔드 미완/오류 상황을 고려해 더미 데이터로 폴백 처리
 */

import * as React from 'react'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import { DashboardStatsSection } from '../../components/admin/DashboardStatsSection'
import { DashboardGraphSection } from '../../components/admin/DashboardGraphSection'
import { DashboardIssueSection } from '../../components/admin/DashboardIssueSection'

type DashboardCache = {
  memberStats: {
    totalCount: number
    monthlyCount: number
    weeklyCount: number
  }
  postStats: {
    totalPosts: number
    deletedCount: number
  }
  deletedMembersCount: number
  timeStats: { dau: number; mau: number }
  ratio: number
  fetchedAt: number
}

let dashboardCache: DashboardCache | null = null

export default function AdminDashboardPage() {
  const USER_MANAGE_PATH = '/admin/users'
  const REPORT_MANAGE_PATH = '/admin/reports'

  const [memberStats, setMemberStats] = React.useState({
    totalCount: 0,
    monthlyCount: 0,
    weeklyCount: 0,
  })
  const [postStats, setPostStats] = React.useState({
    totalPosts: 0,
    deletedCount: 0,
  })
  const [deletedMembersCount, setDeletedMembersCount] = React.useState(0)
  const [ratio, setRatio] = React.useState(0)
  const [timeStats, setTimeStats] = React.useState({ dau: 0, mau: 0 })

  const role =
    typeof window !== 'undefined' ? localStorage.getItem('role') : null

  React.useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('accessToken')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined

      if (dashboardCache) {
        setMemberStats(dashboardCache.memberStats)
        setPostStats(dashboardCache.postStats)
        setDeletedMembersCount(dashboardCache.deletedMembersCount)
        setTimeStats(dashboardCache.timeStats)
        setRatio(dashboardCache.ratio)
        return
      }

      let nextMemberStats = { totalCount: 0, monthlyCount: 0, weeklyCount: 0 }
      let nextPostStats = { totalPosts: 0, deletedCount: 0 }
      let nextDeletedMembersCount = 0
      let nextTimeStats = { dau: 0, mau: 0 }
      let nextRatio = 0

      // 1) 사용자 통계
      try {
        const res = await api.get('/api/admin/dashboard/user-statistics', {
          headers,
        })
        nextMemberStats = res.data
      } catch {
        nextMemberStats = {
          totalCount: 100,
          monthlyCount: 100,
          weeklyCount: 50,
        }
      }

      // 2) 총 게시글 수
      try {
        const r = await api.get('/api/admin/dashboard/posts/count', { headers })
        nextPostStats.totalPosts = Number(r.data) || 0
      } catch {
        nextPostStats.totalPosts = 50
      }

      // 3) 비활성화(삭제) 게시글 수
      try {
        const r = await api.get('/api/admin/dashboard/deleted-posts/count', {
          headers,
        })
        nextPostStats.deletedCount = Number(r.data) || 0
      } catch {
        nextPostStats.deletedCount = 1
      }

      // 4) 탈퇴 계정 수
      try {
        const r = await api.get('/api/admin/members/deleted', { headers })
        nextDeletedMembersCount = Number(r.data?.totalCount) || 0
      } catch {
        nextDeletedMembersCount = 2
      }

      // 5) DAU, MAU
      try {
        const dauResp = await api.get('/api/admin/dashboard/users/dau', {
          headers,
        })
        const mauResp = await api.get('/api/admin/dashboard/users/mau', {
          headers,
        })
        const dau = Number(dauResp.data) || 45
        const mau = Number(mauResp.data) || 600
        nextTimeStats = { dau, mau }
        nextRatio = mau ? Math.round((dau / mau) * 1000) / 10 : 0
      } catch {
        const dau = 45
        const mau = 600
        nextTimeStats = { dau, mau }
        nextRatio = Math.round((dau / mau) * 1000) / 10
      }

      setMemberStats(nextMemberStats)
      setPostStats(nextPostStats)
      setDeletedMembersCount(nextDeletedMembersCount)
      setTimeStats(nextTimeStats)
      setRatio(nextRatio)

      dashboardCache = {
        memberStats: nextMemberStats,
        postStats: nextPostStats,
        deletedMembersCount: nextDeletedMembersCount,
        timeStats: nextTimeStats,
        ratio: nextRatio,
        fetchedAt: Date.now(),
      }
    }

    if (role === 'ADMIN') {
      void load()
    }
  }, [role])

  const goUsers = () => {
    window.location.href = USER_MANAGE_PATH
  }

  const goReports = () => {
    window.location.href = REPORT_MANAGE_PATH
  }

  return (
    <AdminLayout>
      {/* TopBar 아래 여백 */}
      <div className="mb-[32px]" />

      <DashboardStatsSection
        memberStats={memberStats}
        postStats={postStats}
        timeStats={timeStats}
        ratio={ratio}
      />

      <DashboardGraphSection />

      <DashboardIssueSection
        deletedMembersCount={deletedMembersCount}
        deletedCount={postStats.deletedCount}
        onClickUsers={goUsers}
        onClickReports={goReports}
      />
    </AdminLayout>
  )
}
