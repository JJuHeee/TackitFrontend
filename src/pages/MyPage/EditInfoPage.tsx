import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import { toastSuccess, toastError, toastWarn } from '../../utils/toast'
import HomeBar from '../../components/HomeBar'
import { Button } from '../../components/ui/Button'
import TextField from '../../components/forms/TextField'
import { useUserForm } from '../../hooks/useUserForm'
import MyInfo, { type MyInfoData } from './MyInfo'

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={[}\];:'",.<>/?\\|`~]).{8,}$/

function EditInfoForm({ myInfo }: { myInfo: MyInfoData }) {
  const navigate = useNavigate()
  const {
    email,
    password,
    confirmPassword,
    nickname,
    organization,
    setEmail,
    setPassword,
    setConfirmPassword,
    setNickname,
    setOrganization,
    setRole,
    confirmInvalid,
    nickInvalid,
  } = useUserForm('')

  const [initialized, setInitialized] = useState(false)

  // MyInfo 수신 후 1회 초기화
  useEffect(() => {
    if (!initialized && myInfo) {
      setEmail(myInfo.email)
      setNickname(myInfo.nickname)
      setOrganization(myInfo.organization)
      setRole(myInfo.role)
      setInitialized(true)
    }
  }, [initialized, myInfo, setEmail, setNickname, setOrganization, setRole])

  // 제출: 변경된 필드만 payload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: { password?: string; nickname?: string } = {}
    if (password.trim() !== '') payload.password = password
    if (nickname !== myInfo.nickname) payload.nickname = nickname

    if (Object.keys(payload).length === 0) {
      toastWarn('변경된 내용이 없습니다.')
      return
    }

    try {
      await api.patch('/api/members/me', payload)
      toastSuccess('프로필이 성공적으로 수정되었습니다.')
      navigate('/mypage')
    } catch {
      toastError('프로필 수정 중 문제가 발생했습니다.')
    }
  }

  // 버튼 활성화 조건(회원정보 수정 전용)
  const hasPw = password.trim().length > 0
  const pwPolicyOk = !hasPw || passwordRegex.test(password)
  const hasChange = hasPw || nickname !== myInfo.nickname
  const canSubmit = pwPolicyOk && !confirmInvalid && !nickInvalid && hasChange

  return (
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
        label={
          <>
            비밀번호<span className="ml-0.5 text-system-red">*</span>
          </>
        }
        type="password"
        value={password}
        placeholder="변경할 비밀번호를 입력해 주세요."
        onChange={(e) => setPassword(e.target.value)}
        showToggle
        autoComplete="new-password"
        minLength={8}
        invalid={hasPw && !pwPolicyOk}
        message={
          hasPw && !pwPolicyOk
            ? '대/소문자, 특수문자 포함 8자 이상으로 입력해 주세요.'
            : undefined
        }
      />

      {/* 비밀번호 확인 */}
      <TextField
        id="confirmPassword"
        label={
          <>
            비밀번호 확인<span className="ml-0.5 text-system-red">*</span>
          </>
        }
        type="password"
        value={confirmPassword}
        placeholder="비밀번호를 다시 입력해 주세요."
        onChange={(e) => setConfirmPassword(e.target.value)}
        showToggle
        autoComplete="new-password"
        invalid={confirmInvalid}
        message={confirmInvalid ? '비밀번호가 일치하지 않습니다.' : undefined}
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

      {/* 소속 (읽기 전용) */}
      <TextField
        id="organization"
        label="소속"
        required
        value={organization}
        onChange={() => {}}
        placeholder="소속"
        disabled
      />

      {/* 완료 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="m"
        className="w-full mt-4"
        disabled={!canSubmit}
      >
        완료
      </Button>

      {/* 안내 문구 */}
      <p className="mt-4 text-center text-body2-regular text-label-neutral">
        *역할을 잘못 설정했다면 tackit 고객센터로 연락해주세요.
      </p>
    </form>
  )
}

export default function EditInfoPage() {
  const navigate = useNavigate()

  return (
    <>
      <HomeBar />
      <main className="pt-[60px] pb-8">
        <div className="post-container">
          {/* 브레드크럼 */}
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
              className="w-[22px] h-[22px] text-label-assistive"
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
              className="w-[22px] h-[22px] text-label-assistive"
            />
            <span className="text-title1-bold text-label-normal">
              프로필 편집
            </span>
          </div>

          <div className="relative flex flex-col items-center min-h-screen">
            <div className="mt-6 w-[440px] px-5 pt-8 pb-[60px] max-[560px]:static max-[560px]:w-full max-[560px]:mt-8">
              {/* 프로필 이미지 */}
              <div className="flex justify-center mb-6">
                {/* 프로필 아이콘 + 수정 아이콘을 감싸는 래퍼 */}
                <div className="relative w-[100px] h-[100px]">
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
              </div>

              {/* MyInfo 사용 */}
              <MyInfo>
                {(myInfo, loading) => {
                  if (loading)
                    return (
                      <p className="text-center text-label-neutral">
                        불러오는 중…
                      </p>
                    )
                  if (!myInfo)
                    return (
                      <p className="text-center text-label-neutral">
                        프로필 정보를 불러오지 못했습니다.
                      </p>
                    )
                  return <EditInfoForm myInfo={myInfo} />
                }}
              </MyInfo>
            </div>
          </div>
        </div>
      </main>
    </>
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
