// src/pages/MyPage/MyInfo.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
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

const dummyMyInfo: MyInfoData = {
  nickname: '현재유저',
  email: 'dummy@test.com',
  organization: 'Tackit',
  role: 'SENIOR',
  joinedYear: 2022,
  yearsOfService: 3,
  profileImageUrl: null,
}

type MyInfoContextValue = {
  myInfo: MyInfoData | null
  loading: boolean
}

const MyInfoContext = createContext<MyInfoContextValue>({
  myInfo: null,
  loading: true,
})

export const MyInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [myInfo, setMyInfo] = useState<MyInfoData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get<MyInfoData>('/api/members/me')
        setMyInfo(data)
      } catch {
        setMyInfo(dummyMyInfo)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <MyInfoContext.Provider value={{ myInfo, loading }}>
      {children}
    </MyInfoContext.Provider>
  )
}

export const useMyInfo = () => useContext(MyInfoContext).myInfo
export const useMyInfoState = () => useContext(MyInfoContext)

export default function MyInfo({
  children,
}: {
  children: (myInfo: MyInfoData | null, loading: boolean) => React.ReactNode
}) {
  const { myInfo, loading } = useContext(MyInfoContext)
  return <>{children(myInfo, loading)}</>
}
