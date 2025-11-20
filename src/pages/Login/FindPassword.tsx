// src/pages/Login/FindPasswordPage.tsx
import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { AuthCard } from '../../components/ui/AuthCard'
import { Button } from '../../components/ui/Button'
import api from '../../api/api'
import { toastSuccess, toastError } from '../../utils/toast'
import TextField from '../../components/forms/TextField'

export default function FindPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isValid = Boolean(email.trim() && name.trim() && organization.trim())

  const emailInvalid = submitted && !email.trim()
  const nameInvalid = submitted && !name.trim()
  const orgInvalid = submitted && !organization.trim()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    setError('')
    setSuccess(false)

    if (!isValid) return

    try {
      // 🔐 비밀번호 찾기 API (엔드포인트는 실제 명세에 맞게 수정해줘!)
      await api.post('/auth/find-password', {
        email,
        name,
        organization,
      })

      setSuccess(true)
      toastSuccess('비밀번호 재설정 안내를 이메일로 보내드렸습니다.')
      // 여기서 별도 재설정 페이지로 이동하고 싶으면 navigate 써서 추가하면 됨
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data

      if (status === 404 && msg === '회원을 찾을 수 없습니다.') {
        setError('회원을 찾을 수 없습니다.')
      } else {
        setError('비밀번호 찾기 중 문제가 발생했습니다. 다시 시도해 주세요.')
      }
      toastError('비밀번호를 찾을 수 없습니다.')
    }
  }

  const submitDisabled = !isValid

  return (
    <AuthLayout icons={['/assets/auth/auth-icon.svg']} iconOffset={80}>
      <AuthCard
        className="w-[440px] rounded-[12px] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]
               translate-y-8 md:translate-y-12 lg:translate-y-16"
      >
        {/* 타이틀 */}
        <h2 className="mb-8 text-center text-title1-bold text-label-normal">
          비밀번호 찾기
        </h2>

        {/* 비밀번호 찾기 폼 */}
        <form onSubmit={handleSubmit} className="w-[392px] mx-auto">
          {/* 이메일 */}
          <TextField
            id="email"
            label="이메일"
            required
            type="email"
            value={email}
            placeholder="이메일을 입력해 주세요."
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setSubmitted(true)}
            invalid={emailInvalid}
            message={emailInvalid ? '이메일을 입력해 주세요.' : undefined}
            autoComplete="email"
            inputMode="email"
          />

          {/* 이름 */}
          <TextField
            id="name"
            label="이름"
            required
            value={name}
            placeholder="이름을 입력해 주세요."
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setSubmitted(true)}
            invalid={nameInvalid}
            message={nameInvalid ? '이름을 입력해 주세요.' : undefined}
          />

          {/* 소속 */}
          <TextField
            id="organization"
            label="소속"
            required
            value={organization}
            placeholder="소속을 입력해 주세요."
            onChange={(e) => setOrganization(e.target.value)}
            onBlur={() => setSubmitted(true)}
            invalid={orgInvalid}
            message={orgInvalid ? '소속을 입력해 주세요.' : undefined}
          />

          {/* 에러 메시지 (API 응답용) */}
          {error && <p className="mt-1 text-sm text-system-red">{error}</p>}

          {/* 다음 버튼: 세 필드 모두 입력됐을 때만 활성화 */}
          <Button
            type="submit"
            variant="primary"
            size="m"
            className="w-full mt-4"
            disabled={submitDisabled}
          >
            다음
          </Button>

          {/* 성공 안내 (임시 UI, 나중에 모달/다음 페이지로 변경 가능) */}
          {success && (
            <p className="mt-4 text-center text-body-2 text-label-neutral">
              비밀번호 재설정 안내를{' '}
              <span className="font-semibold text-label-primary">{email}</span>
              로 보내드렸습니다.
            </p>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
