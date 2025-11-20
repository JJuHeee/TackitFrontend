// src/pages/Login/FindEmailPage.tsx
import React, { useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { AuthCard } from '../../components/ui/AuthCard'
import { Button } from '../../components/ui/Button'
import api from '../../api/api'
import { toastSuccess, toastError } from '../../utils/toast'
import TextField from '../../components/forms/TextField'

export default function FindEmailPage(): JSX.Element {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [error, setError] = useState('')
  const [foundEmail, setFoundEmail] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isValid = Boolean(name.trim() && organization.trim())

  const nameInvalid = submitted && !name.trim()
  const orgInvalid = submitted && !organization.trim()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    setError('')
    setFoundEmail(null)

    if (!isValid) return

    try {
      const res = await api.post<{ email: string }>('/auth/find-email', {
        name,
        organization,
      })

      const email = res.data.email
      setFoundEmail(email)
      toastSuccess('가입된 이메일을 찾았습니다.')
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data

      if (status === 404 && msg === '회원을 찾을 수 없습니다.') {
        setError('회원을 찾을 수 없습니다.')
      } else {
        setError('이메일 찾기 중 문제가 발생했습니다. 다시 시도해 주세요.')
      }
      toastError('이메일을 찾을 수 없습니다.')
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
          이메일 찾기
        </h2>

        {/* 이메일 찾기 폼 */}
        <form onSubmit={handleSubmit} className="w-[392px] mx-auto">
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

          {/* 다음 버튼: 둘 다 입력됐을 때만 활성화 */}
          <Button
            type="submit"
            variant="primary"
            size="m"
            className="w-full mt-4"
            disabled={submitDisabled}
          >
            다음
          </Button>

          {/* 이메일 찾은 경우 표시 (임시 UI, 나중에 모달로 변경 가능) */}
          {foundEmail && (
            <p className="mt-4 text-center text-body-2 text-label-normal">
              등록된 이메일을 찾았어요{' '}
              <span className="font-semibold text-label-normal">
                {foundEmail}
              </span>{' '}
            </p>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
