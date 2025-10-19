// src/pages/mypage/MyInfo.tsx
import React, { useEffect, useState } from 'react'
import api from '../../api/api' // 경로 확인

// 서버 응답: { nickname: string; joinedYear: number; yearsOfService: number }
export type MyInfoData = {
  nickname: string
  joinedYear: number
  yearsOfService: number
}

type MyInfoProps = {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}

const dummyMyInfo: MyInfoData = {
  nickname: '현재유저',
  joinedYear: 2022,
  yearsOfService: 4,
}

const MyInfo: React.FC<MyInfoProps> = ({ children }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        // ✅ 실제 엔드포인트 반영
        const { data } = await api.get<MyInfoData>('/api/members/me')
        if (isMounted) setMyInfo(data)
      } catch {
        if (isMounted) setMyInfo(dummyMyInfo)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  return <>{children(myInfo, loading)}</>
}

export default MyInfo
