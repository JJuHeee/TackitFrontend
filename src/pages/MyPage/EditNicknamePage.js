import React, { useState, useEffect } from 'react'
import HomeBar from '../../components/HomeBar'
import './EditForm.css'
import api from '../../api/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const EditNicknamePage = () => {
  const [nickname, setNickname] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)
  const [checkMessage, setCheckMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const checkNickname = async () => {
      if (!nickname.trim()) {
        setCheckMessage('')
        setIsAvailable(null)
        return
      }

      try {
        await api.get(`/auth/check-nickname?nickname=${nickname}`)
        setIsAvailable(true)
        setCheckMessage('사용 가능한 닉네임입니다.')
      } catch (err) {
        if (err.response?.status === 409) {
          setIsAvailable(false)
          setCheckMessage('이미 사용 중인 닉네임입니다.')
        } else {
          setIsAvailable(false)
          setCheckMessage('중복 확인 중 오류가 발생했습니다.')
          console.error(err)
        }
      }
    }

    const delayCheck = setTimeout(() => {
      checkNickname()
    }, 300)

    return () => clearTimeout(delayCheck)
  }, [nickname])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nickname.trim()) {
      setCheckMessage('닉네임을 입력해주세요.')
      return
    }

    if (isAvailable !== true) {
      setCheckMessage('닉네임 중복을 확인해주세요.')
      return
    }

    try {
      const accessToken = localStorage.getItem('accessToken')

      await api.patch(
        '/api/members/nickname',
        { nickname },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      toast.success('닉네임이 변경되었습니다.')
      navigate('/mypage')
    } catch (err) {
      toast.error('닉네임 변경에 실패했습니다.')
    }
  }

  return (
    <>
      <HomeBar />
      <div className="edit-container">
        <form className="edit-box" onSubmit={handleSubmit}>
          <h2>닉네임 변경</h2>

          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="변경할 닉네임"
            className="edit-input"
          />

          <div
            className={`nickname-message ${
              isAvailable === false ? 'error' : 'success'
            }`}
          >
            {checkMessage}
          </div>

          <button
            type="submit"
            className="edit-submit-btn"
            disabled={isAvailable !== true}
          >
            닉네임 변경하기
          </button>
        </form>
      </div>
    </>
  )
}

export default EditNicknamePage
