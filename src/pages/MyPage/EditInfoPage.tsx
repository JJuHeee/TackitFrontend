// src/pages/MyPage/EditInfoPage.tsx
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
    password, // 새 비밀번호
    confirmPassword, // 새 비밀번호 확인
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

  const [currentPassword, setCurrentPassword] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

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

  // 변경 여부/검증
  const hasPwChange = password.trim().length > 0
  const nicknameChanged = nickname !== myInfo.nickname
  const pwPolicyOk = !hasPwChange || passwordRegex.test(password)

  const canSubmit =
    (nicknameChanged || hasPwChange) &&
    !nickInvalid &&
    (!hasPwChange ||
      (pwPolicyOk &&
        !confirmInvalid &&
        currentPassword.trim().length > 0 &&
        currentPassword !== password))

  // 완료: 변경된 항목만 호출 (둘 다 바뀌면 둘 다 병렬 호출)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nicknameChanged && !hasPwChange) {
      toastWarn('변경된 내용이 없습니다.')
      return
    }

    // 비번 변경이 필요한 경우 프론트 검증
    if (hasPwChange) {
      if (!currentPassword.trim()) {
        toastWarn('현재 비밀번호를 입력해 주세요.')
        return
      }
      if (!pwPolicyOk) {
        toastWarn('새 비밀번호가 정책에 맞지 않습니다.')
        return
      }
      if (confirmInvalid) {
        toastWarn('새 비밀번호가 일치하지 않습니다.')
        return
      }
      if (currentPassword === password) {
        toastWarn('새 비밀번호가 기존 비밀번호와 동일합니다.')
        return
      }
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }

    // 닉네임과 비번을 각각 필요 시에만 호출
    const promises: Promise<any>[] = [
      nicknameChanged
        ? api.patch('/api/members/nickname', { nickname }, headers)
        : Promise.resolve('SKIP_NICK'),
      hasPwChange
        ? api.patch(
            '/api/members/password',
            { currentPassword, newPassword: password },
            headers
          )
        : Promise.resolve('SKIP_PW'),
    ]

    const [nickRes, pwRes] = await Promise.allSettled(promises)

    const nickTried = nicknameChanged
    const pwTried = hasPwChange
    const nickOk = nickTried ? nickRes.status === 'fulfilled' : null
    const pwOk = pwTried ? pwRes.status === 'fulfilled' : null

    // 결과 처리 (부분 성공/실패까지 구분)
    if (nickTried && pwTried) {
      if (nickOk && pwOk) {
        toastSuccess('닉네임과 비밀번호가 변경되었습니다.')
        // 보안상 초기화
        setCurrentPassword('')
        setPassword('')
        setConfirmPassword('')
        navigate('/mypage')
      } else if (nickOk || pwOk) {
        toastWarn('일부만 변경되었습니다. 다시 시도해 주세요.')
      } else {
        toastError('변경에 실패했습니다.')
      }
      return
    }

    if (nickTried) {
      if (nickOk) {
        toastSuccess('닉네임이 변경되었습니다.')
        navigate('/mypage')
      } else {
        toastError('닉네임 변경 중 문제가 발생했습니다.')
      }
    }

    if (pwTried) {
      if (pwOk) {
        toastSuccess('비밀번호가 변경되었습니다.')
        setCurrentPassword('')
        setPassword('')
        setConfirmPassword('')
        // 필요 시 navigate('/login')
      } else {
        toastError('비밀번호 변경 중 문제가 발생했습니다.')
      }
    }
  }

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

      {/* 비밀번호 변경 섹션 */}
      <div className="mt-6" />

      {/* 현재 비밀번호 */}
      <TextField
        id="currentPassword"
        label={
          <>
            현재 비밀번호<span className="ml-0.5 text-system-red">*</span>
          </>
        }
        type={showCurrentPw ? 'text' : 'password'}
        value={currentPassword}
        placeholder="현재 비밀번호를 입력해 주세요."
        onChange={(e) => setCurrentPassword(e.target.value)}
        showToggle
        visible={showCurrentPw}
        onToggle={() => setShowCurrentPw((v) => !v)}
        autoComplete="current-password"
      />

      {/* 새 비밀번호 */}
      <TextField
        id="password"
        label={
          <>
            새 비밀번호<span className="ml-0.5 text-system-red">*</span>
          </>
        }
        type={showNewPw ? 'text' : 'password'}
        value={password}
        placeholder="새 비밀번호를 입력해 주세요."
        onChange={(e) => setPassword(e.target.value)}
        showToggle
        visible={showNewPw}
        onToggle={() => setShowNewPw((v) => !v)}
        autoComplete="new-password"
        minLength={8}
        invalid={password.trim().length > 0 && !pwPolicyOk}
        message={
          password.trim().length > 0 && !pwPolicyOk
            ? '대/소문자, 특수문자 포함 8자 이상으로 입력해 주세요.'
            : undefined
        }
      />

      {/* 새 비밀번호 확인 */}
      <TextField
        id="confirmPassword"
        label={
          <>
            새 비밀번호 확인<span className="ml-0.5 text-system-red">*</span>
          </>
        }
        type={showConfirmPw ? 'text' : 'password'}
        value={confirmPassword}
        placeholder="새 비밀번호를 다시 입력해 주세요."
        onChange={(e) => setConfirmPassword(e.target.value)}
        showToggle
        visible={showConfirmPw}
        onToggle={() => setShowConfirmPw((v) => !v)}
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

      {/* 완료 버튼: 변경된 부분만 호출 */}
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
                <div className="relative w-[100px] h-[100px]">
                  <img
                    src="/icons/mypage-icon.svg"
                    alt="프로필 아이콘"
                    className="w-full h-full rounded-full bg-[#f5f5f5] cursor-pointer hover:opacity-80 transition"
                    onClick={() => navigate('/mypage/edit-info')}
                  />
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
