// src/pages/auth/SignupPage.tsx
import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/api'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import { Button } from '../../components/ui/Button'
import AuthLayout from '../../components/layouts/AuthLayout'
import { AuthCard } from '../../components/ui/AuthCard'
import TextField from '../../components/forms/TextField'
import RoleSelect, { type Role } from '../../components/forms/RoleSelect'
import { useUserForm } from '../../hooks/useUserForm'

const JOIN_START_YEAR = 2015
const CALENDAR_ICON_PATH = '/icons/calendar.svg'

export default function SignupPage() {
  // 비밀번호 눈토글
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  // 👉 이름 상태 추가 (name 말고 realName으로)
  const [realName, setRealName] = useState('')
  const [realNameTouched, setRealNameTouched] = useState(false)

  // 드롭다운 옵션 (입사년도)
  const yearOptions = useMemo(() => {
    const endYear = new Date().getFullYear()
    return Array.from(
      { length: endYear - JOIN_START_YEAR + 1 },
      (_, i) => endYear - i
    )
  }, [])

  // joinedYear: '' | number
  const [joinedYear, setJoinedYear] = useState<number | ''>('')
  const [joinedYearTouched, setJoinedYearTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // joinedYear 유효성 (실제/표시 분리)
  const joinedYearEmpty = joinedYear === ''
  const joinedYearOutOfRange =
    !joinedYearEmpty && !yearOptions.includes(Number(joinedYear))

  // ✅ UI 표시 조건: (값이 있었고 blur됨 + 범위밖) || (제출 시 빈값/범위밖)
  const joinedYearInvalidUi =
    (joinedYearTouched && !joinedYearEmpty && joinedYearOutOfRange) ||
    (submitted && (joinedYearEmpty || joinedYearOutOfRange))

  // ✅ 실제 제출/버튼 비활성화
  const joinedYearActuallyInvalid = joinedYearEmpty || joinedYearOutOfRange

  const joinedYearMessage = joinedYearInvalidUi
    ? joinedYearEmpty
      ? '입사연도를 선택해 주세요.'
      : '유효한 연도를 선택해 주세요.'
    : undefined

  // 👉 이름 유효성 (제출 후 빈값이면 에러)
  const nameInvalid =
    (realNameTouched && realName.trim() === '') ||
    (submitted && realName.trim() === '')

  // 폼 훅
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
    pwInvalid,
    confirmInvalid,
    orgInvalid,
    emailHasError,
    emailMessage,
    nickHasError,
    nickMessage,
    isFormValid,
    checkEmailDuplicate,
    checkNicknameDuplicate,
  } = useUserForm('') // 초기 역할 없음

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true) // 제출 시 표시 플래그 ON

    // 👉 이름 체크
    if (!realName.trim()) {
      toastWarn('이름을 입력해 주세요.')
      return
    }

    if (!role) {
      toastWarn('역할을 선택해 주세요.')
      return
    }

    if (!isFormValid || joinedYearActuallyInvalid) {
      setJoinedYearTouched(true) // 제출 시 빈값도 에러 표시 허용
      toastError('입력값을 다시 확인해 주세요.')
      return
    }

    const formData = {
      name: realName, // 👉 여기서 name 키로 보내기
      email,
      password,
      nickname,
      organization,
      role,
      joinedYear: Number(joinedYear),
    }

    try {
      await api.post('/auth/sign-up', formData)
      toastSuccess('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch {
      toastError('회원가입 중 문제가 발생했습니다.')
    }
  }

  const submitDisabled =
    !isFormValid || !role || joinedYearActuallyInvalid || realName.trim() === ''

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <div className="relative flex flex-col items-center min-h-screen">
        <div
          className="absolute top-20 w-[440px] box-border px-5 pt-8 pb-[60px] mb-0 max-w-none
                     max-[560px]:static max-[560px]:w-full max-[560px]:max-w-[440px]
                     max-[560px]:h-auto max-[560px]:mt-24"
        >
          <AuthCard className="w-full max-w-[440px]">
            <h2 className="text-center text-[26px] font-extrabold mb-5">
              회원가입
            </h2>

            <form onSubmit={handleSubmit}>
              <TextField
                id="name"
                label="이름"
                required
                value={realName}
                placeholder="이름을 입력해 주세요."
                onChange={(e) => setRealName(e.target.value)}
                onBlur={() => setRealNameTouched(true)} // ← 추가
                invalid={nameInvalid}
                message={nameInvalid ? '이름을 입력해주세요.' : undefined}
              />

              {/* 이메일 */}
              <TextField
                id="email"
                label="이메일"
                required
                type="email"
                value={email}
                placeholder="이메일을 입력해 주세요."
                onChange={(e) => setEmail(e.target.value)}
                onBlur={checkEmailDuplicate}
                invalid={emailHasError}
                message={emailMessage}
                autoComplete="email"
                inputMode="email"
              />

              {/* 비밀번호 */}
              <TextField
                id="password"
                label="비밀번호"
                required
                type="password"
                value={password}
                placeholder="비밀번호를 입력해 주세요."
                onChange={(e) => setPassword(e.target.value)}
                showToggle
                visible={passwordVisible}
                onToggle={() => setPasswordVisible((v) => !v)}
                autoComplete="new-password"
                invalid={pwInvalid}
                message={
                  pwInvalid
                    ? '대문자와 소문자, 특수문자를 포함해 8자 이상으로 입력해 주세요.'
                    : undefined
                }
              />

              {/* 비밀번호 확인 */}
              <TextField
                id="confirmPassword"
                label="비밀번호 확인"
                required
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
                onBlur={checkNicknameDuplicate}
                showCount
                maxLength={10}
                invalid={nickHasError}
                message={nickMessage}
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
                message={orgInvalid ? '소속을 입력해 주세요.' : undefined}
              />

              {/* 입사년도: 빈 값일 때 blur로는 에러 표시하지 않음 */}
              <TextField
                id="joinedYear"
                label="입사년도"
                required
                value={joinedYear === '' ? '' : String(joinedYear)}
                placeholder="입사연도를 선택해 주세요."
                onChange={(e) => {
                  const v = e.target.value
                  setJoinedYear(v === '' ? '' : Number(v))
                }}
                onBlur={() => {
                  if (joinedYear !== '') setJoinedYearTouched(true)
                }}
                rightIconSrc={CALENDAR_ICON_PATH}
                dropdownOptions={yearOptions}
                invalid={joinedYearInvalidUi}
                message={joinedYearMessage}
              />

              {/* 역할 */}
              <RoleSelect
                className="mb-4"
                value={(role as Role) || ''}
                onChange={(next) => setRole(next)}
                showLabel
              />

              {/* 제출 */}
              <Button
                type="submit"
                variant="primary"
                size="m"
                className="w-full mt-4"
                disabled={submitDisabled}
              >
                완료
              </Button>

              {/* 하단 링크 */}
              <div className="mt-4 text-center text-body-2 text-label-neutral">
                이미 가입된 계정이 있나요?{' '}
                <Link
                  to="/login"
                  className="ml-1 font-semibold no-underline text-label-primary hover:underline"
                >
                  로그인하기
                </Link>
              </div>
            </form>
          </AuthCard>
        </div>
      </div>
    </AuthLayout>
  )
}
