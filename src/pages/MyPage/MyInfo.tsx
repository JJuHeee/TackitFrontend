// src/pages/mypage/MyInfo.tsx
import React, { useEffect, useState } from 'react'
import api from '../../api/api'

// ✅ 서버 응답에 맞게 필드 확장
export type MyInfoData = {
  nickname: string
  email: string
  organization: string
  role: 'NEWBIE' | 'SENIOR' | 'ADMIN' | string // 역할 값은 문자열로 처리
  joinedYear: number
  yearsOfService: number
  profileImageUrl: string | null
}

type MyInfoProps = {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}

// ✅ 더미 데이터도 동일한 구조로 맞춤
const dummyMyInfo: MyInfoData = {
  nickname: '현재유저',
  email: 'dummy@test.com',
  organization: 'Tackit',
  role: 'SENIOR',
  joinedYear: 2022,
  yearsOfService: 3,
  profileImageUrl: null,
}

const MyInfo: React.FC<MyInfoProps> = ({ children }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        // ✅ 최신 API 응답 구조 반영
        const { data } = await api.get<MyInfoData>('/api/members/me')
        if (isMounted) setMyInfo(data)
      } catch {
        // ✅ 실패 시 더미 데이터로 대체
        if (isMounted) setMyInfo(dummyMyInfo)
      } finally {
        if (isMounted) setLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  // ✅ 렌더-프로프 방식으로 전달
  return <>{children(myInfo, loading)}</>
}

export default MyInfo
