import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import MyInfo from './MyInfo'
import Modal from '../../components/modals/Modal'
import api from '../../api/api'
import { toastSuccess, toastError } from '../../utils/toast'
import { Button } from '../../components/ui/Button'
import { notificationSSE } from '../../services/notificationSSE'

const ROUTES = {
  posts: '/mypage/posts',
  comments: '/mypage/comments',
  scraps: '/mypage/bookmarked',
}

export default function MyPageHome() {
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)

  const handleConfirmLogout = () => {
    setLogoutOpen(false)

    // 1) 먼저 SSE 연결 종료
    try {
      notificationSSE.stop()
    } catch (e) {
      console.warn('SSE stop failed (ignored)', e)
    }

    // 2) 토큰/세션 정리
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('accessTokenExpiresIn')
    localStorage.removeItem('grantType')
    localStorage.removeItem('role')

    navigate('/login')
  }

  const handleConfirmWithdraw = async () => {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      toastError('인증 정보가 없습니다. 다시 로그인해주세요.')
      navigate('/login')
      return
    }

    try {
      const response = await api.post(
        '/withdraw',
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      toastSuccess(response.data?.message || '탈퇴가 완료되었습니다.')

      try {
        notificationSSE.stop()
      } catch (e) {
        console.warn(e)
      }

      // 토큰 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('accessTokenExpiresIn')
      localStorage.removeItem('grantType')
      localStorage.removeItem('role')

      setWithdrawOpen(false)
      navigate('/login')
    } catch {
      toastError('탈퇴 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomeBar />

      <main className="flex flex-1">
        <div className="w-[1100px] mx-auto flex flex-col pb-[80px]">
          <h1 className="mt-[60px] text-title-1 text-label-normal font-bold">
            마이페이지
          </h1>

          <MyInfo>
            {(me, loading) => (
              <>
                {/* 프로필 섹션 */}
                <section className="mt-[32px] ml-[20px]">
                  <h2 className="mb-[24px] text-title-1 text-label-normal font-bold">
                    프로필
                  </h2>

                  <div className="w-full rounded-[12px] border border-line-normal">
                    <div className="flex items-center justify-between p-[24px]">
                      <div className="flex items-center">
                        <div className="relative w-[80px] h-[80px]">
                          {/* 프로필 아이콘 */}
                          <img
                            src="/icons/mypage-icon.svg"
                            alt="프로필 아이콘"
                            className="w-full h-full rounded-full bg-[#f5f5f5] cursor-pointer hover:opacity-80 transition"
                            onClick={() => navigate('/mypage/edit-info')}
                          />

                          {/* 수정 아이콘 (오른쪽 아래 겹침) */}
                          <div
                            className="absolute bottom-0 right-0 w-[32px] h-[32px] flex items-center justify-center cursor-pointer"
                            onClick={() => navigate('/mypage/edit-info')}
                          >
                            <img
                              src="/icons/edit.svg"
                              alt="수정"
                              className="w-[32px] h-[32px]"
                            />
                          </div>
                        </div>

                        <div className="ml-[24px]">
                          {/* 닉네임 + 역할 뱃지 */}
                          <div className="flex items-center gap-[8px] text-title-2b text-label-normal">
                            {loading ? (
                              <span className="inline-block h-[22px] w-[120px] animate-pulse rounded bg-gray-200" />
                            ) : (
                              <>
                                <span>{me?.nickname ?? '사용자'}</span>
                                {me?.role === 'NEWBIE' && (
                                  <img
                                    src="/icons/신입.svg"
                                    alt="신입 뱃지"
                                    className="w-[24px] h-[24px]"
                                  />
                                )}
                                {me?.role === 'SENIOR' && (
                                  <img
                                    src="/icons/선배.svg"
                                    alt="선배 뱃지"
                                    className="w-[24px] h-[24px]"
                                  />
                                )}
                              </>
                            )}
                          </div>

                          {/* 닉네임 아래 소속 + 이메일 */}
                          {!loading && (
                            <div className="mt-[8px] flex items-center">
                              <span className="text-body1-regular text-label-neutral mr-[16px]">
                                {me?.organization ?? '-'}
                              </span>
                              <span
                                className="inline-block w-px h-[16px] bg-[var(--line-normal)] mr-[16px]"
                                aria-hidden="true"
                              />
                              <span className="text-body1-regular text-label-neutral">
                                {me?.email ?? '-'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 로그아웃 버튼 */}
                      <Button
                        variant="outlined"
                        size="outlinedM"
                        onClick={() => setLogoutOpen(true)}
                      >
                        로그아웃
                      </Button>
                    </div>
                  </div>
                </section>

                {/* 내 활동 */}
                <section className="mt-[40px] mb-[24px] ml-[20px]">
                  <h2 className="mb-[24px] text-title-1 text-label-normal font-bold">
                    내 활동
                  </h2>
                  <div className="relative w-full h-[128px] rounded-[12px] border border-line-normal overflow-hidden">
                    <span className="pointer-events-none absolute top-1/2 left-[33.333%] h-[80px] w-px -translate-y-1/2 bg-[var(--line-normal)]" />
                    <span className="pointer-events-none absolute top-1/2 left-[66.666%] h-[80px] w-px -translate-y-1/2 bg-[var(--line-normal)]" />
                    <div className="grid h-full grid-cols-3">
                      <ActivityItem
                        icon="/icons/doc.svg"
                        label="내가 쓴 글"
                        onClick={() => navigate(ROUTES.posts)}
                      />
                      <ActivityItem
                        icon="/icons/comment.svg"
                        label="내가 쓴 댓글"
                        onClick={() => navigate(ROUTES.comments)}
                      />
                      <ActivityItem
                        icon="/icons/bookmark.svg"
                        label="스크랩"
                        onClick={() => navigate(ROUTES.scraps)}
                      />
                    </div>
                  </div>
                </section>

                {/* 하단 탈퇴 버튼 */}
                <div className="flex justify-center mt-auto">
                  <button
                    type="button"
                    className="text-body-1 text-label-neutral"
                    onClick={() => setWithdrawOpen(true)}
                  >
                    탈퇴하기
                  </button>
                </div>

                {/* 로그아웃 모달 */}
                <Modal
                  open={logoutOpen}
                  title="로그아웃 하시겠습니까?"
                  confirmText="네"
                  cancelText="취소"
                  onConfirm={handleConfirmLogout}
                  onCancel={() => setLogoutOpen(false)}
                />

                {/* 탈퇴 모달 (API 연결됨) */}
                <Modal
                  open={withdrawOpen}
                  title="계정을 탈퇴하시겠습니까?"
                  description="탈퇴 후에는 계정을 복구할 수 없습니다."
                  confirmText="탈퇴하기"
                  cancelText="취소"
                  onConfirm={handleConfirmWithdraw}
                  onCancel={() => setWithdrawOpen(false)}
                />
              </>
            )}
          </MyInfo>
        </div>
      </main>
    </div>
  )
}

function ActivityItem({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick?: () => void
}) {
  return (
    <div
      className="flex h-full w-full flex-col items-start justify-start px-[24px] py-[24px] cursor-pointer hover:bg-background-neutral transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <img src={icon} alt={label} className="w-[28px] h-[28px] mb-[12px]" />
      <span className="text-title-2b text-label-normal">{label}</span>
    </div>
  )
}
