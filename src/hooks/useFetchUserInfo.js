import { useEffect, useState } from 'react'
import api from '../api/api'

const useFetchUserInfo = () => {
  const [userInfo, setUserInfo] = useState({
    nickname: '기본값',
    joinedYear: 2024,
    yearsOfService: 2,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken')

        // 토큰 없으면 요청 중단
        if (!token) {
          setError(new Error('토큰 없음'))
          setLoading(false)
          return
        }

        const response = await api.get('/api/members/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUserInfo(response.data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  return { userInfo, loading, error }
}

export default useFetchUserInfo
