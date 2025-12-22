import React, { useEffect, useState } from 'react'
import api from '../../api/api'

export type MyInfoData = {
  nickname: string
  email: string
  organization: string
  role: 'NEWBIE' | 'SENIOR' | 'ADMIN' | string
  joinedYear: number
  yearsOfService: number
  profileImageUrl: string | null
}

type MyInfoProps = {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}

const MyInfo: React.FC<MyInfoProps> = ({ children }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      try {
        const { data } = await api.get<MyInfoData>('/api/members/me')
        if (isMounted) setMyInfo(data)
      } catch (error) {
        console.error('내 정보 조회 실패', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  // 렌더-프로프 방식
  return <>{children(myInfo, loading)}</>
}

export default MyInfo
