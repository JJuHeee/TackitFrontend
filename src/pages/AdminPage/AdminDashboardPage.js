import React, { useEffect, useState, useCallback } from 'react'
import './AdminDashboardPage.css'
import api from '../../api/api'
import usersFromApi from '../../data/users'
import { toast } from 'react-toastify'
import AdminHeader from './AdminHeader'

const USERS_PER_PAGE = 5
const PAGE_GROUP_SIZE = 5
const POSTS_PER_PAGE = 5

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState('ACTIVE')
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCount: 0,
    monthlyCount: 0,
    weeklyCount: 0,
  })
  const [activeTab, setActiveTab] = useState('Free')
  const [disabledPosts, setDisabledPosts] = useState([])
  const [postPage, setPostPage] = useState(1)
  const [totalPostPages, setTotalPostPages] = useState(1)

  const role = localStorage.getItem('role')

  const boardNameMap = {
    Free: '자유게시판',
    QnA: '질문게시판',
    Tip: '선임자의 TIP',
  }

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      try {
        const response = await api.get('admin/members', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setUsers(response.data?.length > 0 ? response.data : usersFromApi)
      } catch (error) {
        setUsers(usersFromApi)
      } finally {
        setLoading(false)
      }
    }

    if (role === 'ADMIN') fetchUsers()
    else setLoading(false)
  }, [role])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await api.get('admin/members/statistics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(response.data)
      } catch (error) {}
    }

    if (role === 'ADMIN') fetchStats()
  }, [role])

  const fetchDisabledPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await api.get(`admin/report/${activeTab}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: postPage - 1, size: POSTS_PER_PAGE },
      })
      setDisabledPosts(response.data.content)
      setTotalPostPages(response.data.totalPages)
    } catch (error) {
      setDisabledPosts([])
      setTotalPostPages(1)
    }
  }, [activeTab, postPage])

  useEffect(() => {
    fetchDisabledPosts()
  }, [fetchDisabledPosts])

  const filteredUsers = users
    .filter((user) => user.status === filter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  const currentGroup = Math.ceil(currentPage / PAGE_GROUP_SIZE)
  const groupStart = (currentGroup - 1) * PAGE_GROUP_SIZE + 1
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages)
  const visiblePages = []
  for (let i = groupStart; i <= groupEnd; i++) visiblePages.push(i)

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  )

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handlePostPageClick = (page) => {
    if (page >= 1 && page <= totalPostPages) setPostPage(page)
  }

  const handleDelete = async (postId) => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return
    try {
      const token = localStorage.getItem('accessToken')

      await api.delete(`admin/report/${activeTab}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('게시글이 삭제되었습니다.')
      fetchDisabledPosts()
    } catch (error) {
      toast.error('게시글 삭제에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  const handleActivate = async (postId) => {
    if (!window.confirm('이 게시글을 다시 활성화하시겠습니까?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const response = await api.patch(
        `admin/report/${activeTab}/posts/${postId}/activate`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(response.data)
      fetchDisabledPosts()
    } catch {
      toast.error('게시글 활성화에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  if (loading) return <div>로딩 중...</div>

  if (role !== 'ADMIN') {
    return (
      <div className="user-page-container">
        <AdminHeader />
        <div className="user-content">
          <h2 className="user-title">🚫 관리자만 접근할 수 있습니다.</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-container">
      <AdminHeader />
      <div className="user-content">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <p>총 가입자 수</p>
            <h3>{stats.totalCount.toLocaleString()}</h3>
          </div>
          <div className="dashboard-card">
            <p>이번 달 가입자 수</p>
            <h3>{stats.monthlyCount.toLocaleString()}</h3>
          </div>
          <div className="dashboard-card">
            <p>이번 주 가입자 수</p>
            <h3>{stats.weeklyCount.toLocaleString()}</h3>
          </div>
        </div>

        <h2 className="user-title">회원 정보</h2>
        <div className="user-tab-buttons">
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

        <table className="user-table">
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

        <div className="pagination">
          <button
            onClick={() => handlePageClick(groupStart - 1)}
            disabled={groupStart === 1}
            className="page-button"
          >
            ←
          </button>
          {visiblePages.map((pageNum) => (
            <button
              key={pageNum}
              className={`page-button ${
                currentPage === pageNum ? 'active' : ''
              }`}
              onClick={() => handlePageClick(pageNum)}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => handlePageClick(groupEnd + 1)}
            disabled={groupEnd === totalPages}
            className="page-button"
          >
            →
          </button>
        </div>

        <h2 className="user-title">신고 3회 이상 비활성화된 게시글</h2>
        <div className="bookmark-tabs">
          <button
            onClick={() => setActiveTab('Tip')}
            className={activeTab === 'Tip' ? 'active' : ''}
          >
            선임자의 TIP
          </button>
          <button
            onClick={() => setActiveTab('Free')}
            className={activeTab === 'Free' ? 'active' : ''}
          >
            자유게시판
          </button>
          <button
            onClick={() => setActiveTab('QnA')}
            className={activeTab === 'QnA' ? 'active' : ''}
          >
            질문게시판
          </button>
        </div>

        <ul className="post-management-list">
          {disabledPosts.map((post, index) => (
            <li key={index} className="post-management-item">
              <div className="post-management-left">
                <div className="post-management-icon">
                  <img
                    src="/search.svg"
                    alt="돋보기 아이콘"
                    className="search-icon"
                  />
                </div>
                <div className="post-management-texts">
                  <div className="post-management-board">
                    {boardNameMap[activeTab]}
                  </div>
                  <div className="post-management-title">{post.title}</div>
                  <div className="post-management-meta">
                    신고 수: {post.reportCount}회 Posted{' '}
                    <span className="date">
                      {new Date(post.createdAt).toLocaleString('ko-KR')}
                    </span>
                    , by @{post.nickname}
                  </div>
                </div>
              </div>
              <div className="post-management-actions">
                <button
                  className="activate-btn"
                  onClick={() => handleActivate(post.id)}
                >
                  활성화
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(post.id)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="pagination">
          <button
            onClick={() => handlePostPageClick(postPage - 1)}
            disabled={postPage === 1}
            className="page-button"
          >
            ←
          </button>
          {Array.from({ length: totalPostPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <button
                key={pageNum}
                className={`page-button ${
                  postPage === pageNum ? 'active' : ''
                }`}
                onClick={() => handlePostPageClick(pageNum)}
              >
                {pageNum}
              </button>
            )
          )}
          <button
            onClick={() => handlePostPageClick(postPage + 1)}
            disabled={postPage === totalPostPages}
            className="page-button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
