import { useState, useMemo } from 'react'
import api from '../api/api'

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

  const emailInvalid = useMemo(
    () => !!email && !/^\S+@\S+\.\S+$/.test(email),
    [email]
  )
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|`~]).{8,}$/

  const pwInvalid = useMemo(
    () => !!password && !passwordRegex.test(password),
    [password]
  )
  const confirmInvalid = useMemo(
    () => !!confirmPassword && confirmPassword !== password,
    [confirmPassword, password]
  )
  const nickInvalid = useMemo(
    () => !!nickname && nickname.length > 10,
    [nickname]
  )
  const orgInvalid = useMemo(
    () => !!organization && organization.trim().length === 0,
    [organization]
  )

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
      const res = await api.get(`/auth/check-email-auth?email=${email}`)
      if (res.status === 200) setEmailCheckMessage('사용 가능한 이메일입니다.')
    } catch (error: any) {
      const msg = error.response?.data
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
      await api.get(`/auth/check-nickname?nickname=${nickname}`)
      setNicknameCheckMessage('사용 가능한 닉네임입니다.')
    } catch (error: any) {
      if (error.response?.status === 409) {
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
