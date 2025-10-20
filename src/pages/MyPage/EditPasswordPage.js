import React, { useState } from 'react'
import HomeBar from '../../components/HomeBar'
import './EditForm.css'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'

const EditPasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const [currentPwVisible, setCurrentPwVisible] = useState(false)
  const [newPwVisible, setNewPwVisible] = useState(false)
  const [confirmPwVisible, setConfirmPwVisible] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentPassword) {
      setSubmitError('현재 비밀번호를 입력해주세요.')
      return
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.')
      setSubmitError('')
      return
    }

    setPasswordError('')
    setSubmitError('')

    try {
      const payload = {
        currentPassword,
        newPassword,
      }

      const { data } = await api.patch('/api/members/password', payload)

      if (data.changed) {
        setSubmitError('')
        toast.success(data.message)
        navigate('/mypage')
      } else {
        setSubmitError('비밀번호가 변경되지 않았습니다.')
      }
    } catch (err) {
      setSubmitError('현재 비밀번호와 일치하지 않습니다.')
      console.error(err)
    }
  }

  return (
    <>
      <HomeBar />
      <div className="edit-container">
        <form className="edit-box" onSubmit={handleSubmit}>
          <h2>비밀번호 변경</h2>

          {/* 현재 비밀번호 */}
          <label htmlFor="current-password">현재 비밀번호</label>
          <div style={{ position: 'relative' }}>
            <input
              type={currentPwVisible ? 'text' : 'password'}
              id="current-password"
              className="edit-input"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {currentPassword && (
              <button
                type="button"
                onClick={() => setCurrentPwVisible(!currentPwVisible)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-90%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {currentPwVisible ? (
                  <FaEyeSlash size={20} color="#3D4D5C" />
                ) : (
                  <FaEye size={20} color="#3D4D5C" />
                )}
              </button>
            )}
          </div>

          {/* 새 비밀번호 */}
          <label htmlFor="new-password">새 비밀번호</label>
          <div style={{ position: 'relative' }}>
            <input
              type={newPwVisible ? 'text' : 'password'}
              id="new-password"
              className="edit-input"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && (
              <button
                type="button"
                onClick={() => setNewPwVisible(!newPwVisible)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-90%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {newPwVisible ? (
                  <FaEyeSlash size={20} color="#3D4D5C" />
                ) : (
                  <FaEye size={20} color="#3D4D5C" />
                )}
              </button>
            )}
          </div>

          {/* 새 비밀번호 확인 */}
          <label>새 비밀번호 확인</label>
          <div style={{ position: 'relative' }}>
            <input
              type={confirmPwVisible ? 'text' : 'password'}
              className="edit-input"
              placeholder="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && (
              <button
                type="button"
                onClick={() => setConfirmPwVisible(!confirmPwVisible)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-90%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {confirmPwVisible ? (
                  <FaEyeSlash size={20} color="#3D4D5C" />
                ) : (
                  <FaEye size={20} color="#3D4D5C" />
                )}
              </button>
            )}
          </div>

          {/* 오류 메시지 */}
          {passwordError && (
            <div className="nickname-message error">{passwordError}</div>
          )}
          {submitError && (
            <div className="nickname-message error">{submitError}</div>
          )}

          <button type="submit" className="edit-submit-btn">
            비밀번호 변경하기
          </button>
        </form>
      </div>
    </>
  )
}

export default EditPasswordPage
