// src/pages/auth/LoginPage.jsx
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '../../api/api'
import AuthLayout from '../../components/layouts/AuthLayout'
import { AuthCard } from '../../components/ui/AuthCard'
import { Button } from '../../components/ui/Button'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // 세션 만료 알림(회원가입 페이지 로직과 동일)
  useEffect(() => {
    const hasAccessToken = !!localStorage.getItem('accessToken')
    if (!hasAccessToken) return
    const raw = localStorage.getItem('accessTokenExpiresIn')
    let expMs = raw ? parseInt(raw, 10) : NaN
    if (!Number.isFinite(expMs)) return
    if (expMs < 1e12) expMs = expMs * 1000

    const now = Date.now()
    const threshold = 3 * 60 * 1000 // 만료 3분 전 알림
    if (expMs <= now) return

    const warnDelay = Math.max(0, expMs - now - threshold)
    if (warnDelay === 0 && sessionStorage.getItem('warnedSoon') === '1') return

    const id = setTimeout(() => {
      alert('세션이 곧 만료됩니다. 자동 연장되거나 다시 로그인해 주세요.')
      sessionStorage.setItem('warnedSoon', '1')
    }, warnDelay)
    return () => clearTimeout(id)
  }, [])

  const isValid = email.trim() && password.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 1) 이메일 인증/중복 체크
    try {
      await api.get(`/auth/check-email-auth?email=${email}`)
      // 200이면 통과
    } catch (checkError) {
      const status = checkError.response?.status
      const message = checkError.response?.data
      if (status === 409 && message === '탈퇴 이력이 있는 이메일입니다.') {
        setError('탈퇴한 이메일입니다. 다른 이메일로 회원가입해주세요.')
        return
      }
      if (status === 409 && message === '이미 가입된 이메일입니다.') {
        // 이미 가입 → 로그인 시도 계속
      } else {
        setError('이메일 확인이 완료되지 않았습니다. 다시 시도해 주세요.')
        return
      }
    }

    // 2) 로그인
    try {
      const res = await api.post('/auth/sign-in', { email, password })
      const {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        grantType,
        role,
      } = res.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('accessTokenExpiresIn', accessTokenExpiresIn)
      localStorage.setItem('grantType', grantType)
      localStorage.setItem('role', role)

      navigate(role === 'ADMIN' ? '/admin' : '/main')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        setError('로그인이 완료되지 않았습니다. 다시 한 번 시도해 주세요.')
      }
    }
  }

  return (
    <AuthLayout
      icons={['/assets/auth/auth-icon.svg']} // 하단 스트립 1장
      iconOffset={80} // 스트립 위 간격
    >
      <div className="px-4">
        <AuthCard className="absolute left-[530px] top-[150px] w-[440px] min-h-[400px]">
          {/* 로고 영역 */}
          <div className="flex items-center justify-center mb-6">
            <img src="/logo.png" alt="Tackit" className="h-14" />
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 */}
            <div>
              <label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-label-secondary"
              ></label>
              <input
                id="email"
                type="email"
                placeholder="이메일을 입력해 주세요."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                required
                className="w-full px-3 py-3 text-sm border rounded-lg outline-none border-line-default focus:border-line-active"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-label-secondary"
              ></label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해 주세요."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 pr-10 text-sm border rounded-lg outline-none border-line-default focus:border-line-active"
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute -translate-y-1/2 right-3 top-1/2"
                    aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                )}
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && <p className="text-sm leading-5 text-red-500">{error}</p>}

            <div className="mt-2 text-right">
              <Link
                to="/main"
                className="text-xs text-label-neutral hover:text-label-primary"
              >
                비밀번호 찾기
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="m"
              className="w-full mt-2"
              disabled={!isValid}
            >
              로그인
            </Button>
          </form>

          {/* 하단 회원가입 */}
          <div className="mt-5 text-sm text-center">
            아직 tackit 회원이 아닌가요?{' '}
            <Link to="/signup" className="font-medium text-label-primary">
              가입하기
            </Link>
          </div>
        </AuthCard>

        {/* 스트립과 겹침 방지용 여백 (iconOffset만큼) */}
        <div style={{ height: 80 }} />
      </div>
    </AuthLayout>
  )
}
