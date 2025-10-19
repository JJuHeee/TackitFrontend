// src/pages/MyPage/EditInfoPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import { toastSuccess, toastError } from '../../utils/toast'
import HomeBar from '../../components/HomeBar'
import { Button } from '../../components/ui/Button'
import TextField from '../../components/forms/TextField'
import RoleSelect, { type Role } from '../../components/forms/RoleSelect'
import { useUserForm } from '../../hooks/useUserForm'

export default function EditInfoPage() {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false)

  // ✅ 기존 useUserForm 훅 재사용
  const {
    email,
    password,
    confirmPassword,
    nickname,
    organization,
    role,
    setEmail,
    setPassword,
    setConfirmPassword,
    setNickname,
    setOrganization,
    setRole,
    confirmInvalid,
    nickInvalid,
    orgInvalid,
    isFormValid,
  } = useUserForm('')

  /** ✅ 유저 정보 불러오기 */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/mypage/info')
        const data = res.data
        setEmail(data.email)
        setNickname(data.nickname)
        setOrganization(data.organization)
        setRole(data.role)
        setUserLoaded(true)
      } catch {
        toastError('프로필 정보를 불러오지 못했습니다.')
      }
    })()
  }, [])

  /** ✅ 프로필 수정 요청 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userLoaded) return

    const formData = {
      password,
      nickname,
      organization,
      role,
    }

    try {
      await api.patch('/mypage/info', formData)
      toastSuccess('프로필이 성공적으로 수정되었습니다.')
      navigate('/mypage')
    } catch {
      toastError('프로필 수정 중 문제가 발생했습니다.')
    }
  }

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          <div className="mb-[32px] flex items-center space-x-[6px]">
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              마이페이지
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
            />
            <span
              onClick={() => navigate('/mypage')}
              className="no-underline cursor-pointer text-title1-bold text-label-assistive hover:text-label-normal"
              style={{ textDecoration: 'none' }}
            >
              프로필
            </span>
            <img
              src="/assets/icons/chevron-right.svg"
              alt=">"
              className="w-5.5 h-5.5 text-label-assistive"
            />
            <span className="text-title1-bold text-label-normal">
              프로필 편집
            </span>
          </div>

          <div className="relative flex flex-col items-center min-h-screen">
            <div className="mt-6 w-[440px] px-5 pt-8 pb-[60px] max-[560px]:static max-[560px]:w-full max-[560px]:mt-8">
              {/* ✅ 프로필 이미지 */}
              <div className="flex justify-center mb-6">
                <img
                  src="/icons/profile.svg"
                  alt="프로필 아이콘"
                  className="h-[100px] w-[100px] cursor-pointer hover:opacity-80 transition"
                  onClick={() => {
                    // TODO: 이미지 업로드 로직 연결
                    toastSuccess('프로필 이미지를 변경할 수 있습니다.')
                  }}
                />
              </div>

              <form onSubmit={handleSubmit}>
                {/* 이메일 (읽기 전용) */}
                <TextField
                  id="email"
                  label="이메일"
                  required
                  type="email"
                  value={email}
                  onChange={() => {}}
                  placeholder="이메일"
                  disabled
                />

                {/* 비밀번호 */}
                <TextField
                  id="password"
                  label="새 비밀번호"
                  type="password"
                  value={password}
                  placeholder="변경할 비밀번호를 입력해 주세요."
                  onChange={(e) => setPassword(e.target.value)}
                  showToggle
                  visible={passwordVisible}
                  onToggle={() => setPasswordVisible((v) => !v)}
                  autoComplete="new-password"
                  minLength={8}
                  invalid={password.length > 0 && password.length < 8}
                  message={
                    password.length > 0 && password.length < 8
                      ? '8자 이상으로 작성해 주세요.'
                      : undefined
                  }
                />

                {/* 비밀번호 확인 */}
                <TextField
                  id="confirmPassword"
                  label="비밀번호 확인"
                  type="password"
                  value={confirmPassword}
                  placeholder="비밀번호를 다시 입력해 주세요."
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showToggle
                  visible={confirmPasswordVisible}
                  onToggle={() => setConfirmPasswordVisible((v) => !v)}
                  autoComplete="new-password"
                  invalid={confirmInvalid}
                  message={
                    confirmInvalid ? '비밀번호가 일치하지 않습니다.' : undefined
                  }
                />

                {/* 닉네임 */}
                <TextField
                  id="nickname"
                  label="닉네임"
                  required
                  value={nickname}
                  placeholder="닉네임을 입력해 주세요."
                  onChange={(e) => setNickname(e.target.value)}
                  showCount
                  maxLength={10}
                  invalid={nickInvalid}
                />

                {/* 소속 */}
                <TextField
                  id="organization"
                  label="소속"
                  required
                  value={organization}
                  placeholder="소속을 입력해 주세요."
                  onChange={(e) => setOrganization(e.target.value)}
                  invalid={orgInvalid}
                />

                {/* 역할 */}
                <RoleSelect
                  className="mb-4"
                  value={(role as Role) || ''}
                  onChange={(next) => setRole(next)}
                  showLabel
                  descriptionText="선택한 역할에 따라 작성 가능한 게시판이 달라요"
                />

                {/* 완료 버튼 */}
                <Button
                  type="submit"
                  variant="primary"
                  size="m"
                  className="w-full mt-4"
                  disabled={!isFormValid}
                >
                  완료
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
