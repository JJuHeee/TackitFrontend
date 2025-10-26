// src/pages/AdminPage/AdminUsersPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import usersFromApi from '../../data/users'

const USERS_PER_PAGE = 5
const PAGE_GROUP_SIZE = 5

type UserStatus = 'ACTIVE' | 'DELETED'

type RawUser = {
  nickname: string
  email: string
  status: string
  createdAt: string
}

type User = {
  nickname: string
  email: string
  status: UserStatus
  createdAt: string
}

// 원본 데이터 → 안전한 User[]로 정규화
const normalizeUsers = (arr: RawUser[]): User[] =>
  arr.map((u) => ({
    ...u,
    status: (u.status === 'DELETED' ? 'DELETED' : 'ACTIVE') as UserStatus,
  }))

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<UserStatus>('ACTIVE')
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem('role')

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get<RawUser[]>('admin/members', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const payload: RawUser[] =
          res.data && res.data.length > 0
            ? res.data
            : (usersFromApi as RawUser[])
        setUsers(normalizeUsers(payload))
      } catch {
        setUsers(normalizeUsers(usersFromApi as RawUser[]))
      } finally {
        setLoading(false)
      }
    }
    if (role === 'ADMIN') fetchUsers()
    else setLoading(false)
  }, [role])

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => u.status === filter)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [users, filter]
  )

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE)
  const groupStart = (currentGroup - 1) * PAGE_GROUP_SIZE + 1
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages)
  const visiblePages = Array.from(
    { length: Math.max(groupEnd - groupStart + 1, 0) },
    (_, i) => groupStart + i
  )
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="rounded-2xl bg-white p-6 ring-1 ring-[var(--line-normal)]">
          로딩 중...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[var(--line-normal)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold user-title">회원 정보</h2>
          <div className="flex gap-2 user-tab-buttons">
            <button
              onClick={() => {
                setFilter('ACTIVE')
                setCurrentPage(1)
              }}
              className={`user-tab-button ${
                filter === 'ACTIVE' ? 'active-tab' : 'inactive-tab'
              }`}
            >
              사용 계정
            </button>
            <button
              onClick={() => {
                setFilter('DELETED')
                setCurrentPage(1)
              }}
              className={`user-tab-button ${
                filter === 'DELETED' ? 'active-tab' : 'inactive-tab'
              }`}
            >
              탈퇴 계정
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse user-table">
            <thead>
              <tr>
                <th>닉네임</th>
                <th>이메일</th>
                <th>상태</th>
                <th>가입 일자</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user, idx) => (
                <tr key={idx}>
                  <td>{user.nickname}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`user-status-badge ${
                        user.status === 'ACTIVE'
                          ? 'status-active'
                          : 'status-inactive'
                      }`}
                    >
                      {user.status === 'ACTIVE' ? '사용 중' : '탈퇴'}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="flex items-center justify-center gap-1 mt-4 pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(groupStart - 1, 1))}
            disabled={groupStart === 1}
            className="page-button"
          >
            ←
          </button>
          {visiblePages.map((n) => (
            <button
              key={n}
              className={`page-button ${currentPage === n ? 'active' : ''}`}
              onClick={() => setCurrentPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(groupEnd + 1, totalPages))
            }
            disabled={groupEnd === totalPages}
            className="page-button"
          >
            →
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}
