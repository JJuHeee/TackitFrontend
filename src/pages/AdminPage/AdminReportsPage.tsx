import React, { useCallback, useEffect, useState } from 'react'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import { toast } from 'react-toastify'

const POSTS_PER_PAGE = 5

type Tab = 'Free' | 'QnA' | 'Tip'

const boardNameMap: Record<Tab, string> = {
  Free: '자유게시판',
  QnA: '질문게시판',
  Tip: '선임자의 TIP',
}

type DisabledPost = {
  id: number
  title: string
  reportCount: number
  createdAt: string
  nickname: string
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Free')
  const [disabledPosts, setDisabledPosts] = useState<DisabledPost[]>([])
  const [postPage, setPostPage] = useState(1)
  const [totalPostPages, setTotalPostPages] = useState(1)
  const role = localStorage.getItem('role')

  const fetchDisabledPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await api.get(`admin/report/${activeTab}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: postPage - 1, size: POSTS_PER_PAGE },
      })
      setDisabledPosts(res.data.content)
      setTotalPostPages(res.data.totalPages)
    } catch {
      setDisabledPosts([])
      setTotalPostPages(1)
    }
  }, [activeTab, postPage])

  useEffect(() => {
    fetchDisabledPosts()
  }, [fetchDisabledPosts])

  const handleDelete = async (postId: number) => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return
    try {
      const token = localStorage.getItem('accessToken')
      await api.delete(`admin/report/${activeTab}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('게시글이 삭제되었습니다.')
      fetchDisabledPosts()
    } catch {
      toast.error('게시글 삭제에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  const handleActivate = async (postId: number) => {
    if (!window.confirm('이 게시글을 다시 활성화하시겠습니까?')) return
    try {
      const token = localStorage.getItem('accessToken')
      const res = await api.patch(
        `admin/report/${activeTab}/posts/${postId}/activate`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(res.data)
      fetchDisabledPosts()
    } catch {
      toast.error('게시글 활성화에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <AdminLayout>
      <section className="rounded-2xl bg-white p-6 ring-1 ring-[var(--line-normal)]">
        <h2 className="mb-3 text-xl font-bold user-title">
          신고 3회 이상 비활성화된 게시글
        </h2>
        <div className="flex gap-2 mb-4 bookmark-tabs">
          <button
            onClick={() => {
              setActiveTab('Tip')
              setPostPage(1)
            }}
            className={activeTab === 'Tip' ? 'active' : ''}
          >
            선임자의 TIP
          </button>
          <button
            onClick={() => {
              setActiveTab('Free')
              setPostPage(1)
            }}
            className={activeTab === 'Free' ? 'active' : ''}
          >
            자유게시판
          </button>
          <button
            onClick={() => {
              setActiveTab('QnA')
              setPostPage(1)
            }}
            className={activeTab === 'QnA' ? 'active' : ''}
          >
            질문게시판
          </button>
        </div>

        <ul className="post-management-list">
          {disabledPosts.map((post) => (
            <li key={post.id} className="post-management-item">
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

        <div className="flex items-center justify-center gap-1 mt-4 pagination">
          <button
            onClick={() => setPostPage((p) => Math.max(1, p - 1))}
            disabled={postPage === 1}
            className="page-button"
          >
            ←
          </button>
          {Array.from({ length: totalPostPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`page-button ${postPage === n ? 'active' : ''}`}
              onClick={() => setPostPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPostPage((p) => Math.min(totalPostPages, p + 1))}
            disabled={postPage === totalPostPages}
            className="page-button"
          >
            →
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}
