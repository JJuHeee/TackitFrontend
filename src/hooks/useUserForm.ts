// src/hooks/useUserForm.ts
import { useState } from 'react'
import api from '../api/api'
import type { AxiosError } from 'axios'

type CheckEmailErrorBody = string | { message?: string } | undefined

// ✅ 정규식은 모듈 상단에 (의존성 경고 예방)
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+={[\]};:'",.<>/?\\|`~]).{8,}$/

export function useUserForm(initialRole = '') {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [organization, setOrganization] = useState('')
  const [role, setRole] = useState(initialRole)

  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('')
  const [emailServerError, setEmailServerError] = useState('')
  const [nickServerError, setNickServerError] = useState('')

  // ✅ 가벼운 계산은 그냥 바로 계산
  const emailInvalid = !!email && !/^\S+@\S+\.\S+$/.test(email)
  const pwInvalid = !!password && !PASSWORD_REGEX.test(password)
  const confirmInvalid = !!confirmPassword && confirmPassword !== password
  const nickInvalid = !!nickname && nickname.length > 10
  const orgInvalid = !!organization && organization.trim().length === 0

  const emailHasError = (!!email && emailInvalid) || !!emailServerError
  const emailMessage = emailInvalid
    ? '규칙에 맞는 이메일 주소를 입력해 주세요.'
    : emailServerError || emailCheckMessage

  const nickHasError = (!!nickname && nickInvalid) || !!nickServerError
  const nickMessage = nickInvalid
    ? '닉네임은 10자 이내로 입력해 주세요.'
    : nickServerError || nicknameCheckMessage

  const isFormValid = Boolean(
    email &&
      !emailInvalid &&
      password &&
      !pwInvalid &&
      confirmPassword &&
      !confirmInvalid &&
      nickname &&
      !nickInvalid &&
      organization &&
      !orgInvalid &&
      role
  )

  const checkEmailDuplicate = async () => {
    setEmailServerError('')
    setEmailCheckMessage('')
    if (!email || emailInvalid) return
    try {
      const encoded = encodeURIComponent(email)
      const res = await api.get(`/auth/check-email-auth?email=${encoded}`)
      if (res.status === 200) setEmailCheckMessage('사용 가능한 이메일입니다.')
    } catch (e: unknown) {
      const err = e as AxiosError<CheckEmailErrorBody>
      const msg =
        (typeof err.response?.data === 'string'
          ? err.response?.data
          : err.response?.data?.message) || ''
      if (msg === '이미 가입된 이메일입니다.') {
        setEmailServerError('이미 사용 중인 이메일입니다.')
      } else if (msg === '탈퇴 이력이 있는 이메일입니다.') {
        setEmailServerError(
          '해당 이메일은 탈퇴 이력이 있어 사용할 수 없습니다.'
        )
      } else {
        setEmailServerError('이메일 확인 중 오류 발생')
      }
    }
  }

  const checkNicknameDuplicate = async () => {
    setNickServerError('')
    setNicknameCheckMessage('')
    if (!nickname || nickInvalid) return
    try {
      const encoded = encodeURIComponent(nickname)
      await api.get(`/auth/check-nickname?nickname=${encoded}`)
      setNicknameCheckMessage('사용 가능한 닉네임입니다.')
    } catch (e: unknown) {
      const err = e as AxiosError
      if (err.response?.status === 409) {
        setNickServerError('이미 사용 중인 닉네임입니다.')
      } else {
        setNickServerError('닉네임 확인 중 오류 발생')
      }
    }
  }

  return {
    // 상태
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

    // 유효성
    emailInvalid,
    pwInvalid,
    confirmInvalid,
    nickInvalid,
    orgInvalid,
    emailHasError,
    emailMessage,
    nickHasError,
    nickMessage,
    isFormValid,

    // API
    checkEmailDuplicate,
    checkNicknameDuplicate,
  }
}
