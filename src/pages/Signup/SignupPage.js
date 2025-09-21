import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './SignupPage.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import api from '../../api/api'
import { toast } from 'react-toastify'

function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [organization, setOrganization] = useState('')
  const [yearOfEmployment, setYearOfEmployment] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  const [emailCheckMessage, setEmailCheckMessage] = useState('')
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState('')
  const [role, setRole] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!role) {
      toast.error('역할을 선택해 주세요.')
      return
    }

    const formData = {
      email,
      password,
      nickname,
      organization,
      role,
    }

    try {
      await api.post('/auth/sign-up', formData)
      toast.success('회원가입이 완료되었습니다.')
      setEmail('')
      setPassword('')
      setNickname('')
      setOrganization('')
      setRole('')
      navigate('/login')
    } catch (error) {
      alert('회원가입 중 문제가 발생했습니다.')
    }
  }

  const checkEmailDuplicate = async () => {
    try {
      const response = await api.get(`/auth/check-email-auth?email=${email}`)

      if (response.status === 200) {
        setEmailCheckMessage('사용 가능한 이메일입니다.')
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status
        const message = error.response.data

        if (status === 409 && message === '이미 가입된 이메일입니다.') {
          setEmailCheckMessage('이미 사용 중인 이메일입니다.')
        } else if (
          status === 409 &&
          message === '탈퇴 이력이 있는 이메일입니다.'
        ) {
          setEmailCheckMessage(
            '해당 이메일은 탈퇴 이력이 있어 사용할 수 없습니다. 다른 이메일을 입력해주세요.'
          )
        } else {
          setEmailCheckMessage('이메일 확인 중 오류 발생')
        }
      } else {
        setEmailCheckMessage('서버와 통신 중 오류 발생')
      }
    }
  }

  const checkNicknameDuplicate = async () => {
    try {
      //닉네임 중복 확인 Api 사용
      await api.get(`/auth/check-nickname?nickname=${nickname}`)
      setNicknameCheckMessage('사용 가능한 닉네임입니다.')
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setNicknameCheckMessage('이미 사용 중인 닉네임입니다.')
      } else {
        setNicknameCheckMessage('닉네임 확인 중 오류 발생')
      }
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <div className="signup-box">
          <h2 className="signup-title">회원가입</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                이메일 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                placeholder="이메일을 입력해 주세요."
                onChange={(e) => setEmail(e.target.value)}
                onBlur={checkEmailDuplicate}
                required
              />
              <div className="check-message">{emailCheckMessage}</div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                비밀번호 <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  value={password}
                  placeholder="비밀번호를 입력해 주세요."
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash size={20} color="#3D4D5C" />
                    ) : (
                      <FaEye size={20} color="#3D4D5C" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="nickname">
                닉네임 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                placeholder="닉네임을 입력해 주세요."
                onChange={(e) => setNickname(e.target.value)}
                onBlur={checkNicknameDuplicate}
                required
              />
              <div className="check-message">{nicknameCheckMessage}</div>
            </div>

            <div className="form-group">
              <label htmlFor="organization">
                소속 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                id="organization"
                value={organization}
                placeholder="소속을 입력해 주세요."
                onChange={(e) => setOrganization(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>
                역할 <span style={{ color: 'red' }}>*</span>
              </label>
              <p className="helper">
                선택한 역할에 따라 작성 가능한 게시판이 다르며, 필요시 설정에서
                역할을 변경할 수 있습니다.
              </p>
              <div className="role-group">
                <button
                  type="button"
                  className={`role-btn ${role === 'NEWBIE' ? 'active' : ''}`}
                  onClick={() => setRole('NEWBIE')}
                >
                  신입
                </button>
                <button
                  type="button"
                  className={`role-btn ${role === 'SENIOR' ? 'active' : ''}`}
                  onClick={() => setRole('SENIOR')}
                >
                  선배
                </button>
              </div>
            </div>

            <button type="submit" className="signup-submit">
              완료
            </button>
            <div className="login-helper">
              이미 가입된 계정이 있나요?{' '}
              <Link to="/login" className="login-link">
                로그인하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
