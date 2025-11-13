export function forceLogout() {
  try {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('accessTokenExpiresIn')
    localStorage.removeItem('userRole')

    // 전체 상태 초기화 겸 강제 이동
    window.location.replace('/login') // 뒤로가기도 막고 싶으면 replace
  } catch (e) {
    console.error('logout failed', e)
    window.location.replace('/login')
  }
}

export function isAccessTokenExpired(): boolean {
  const raw = localStorage.getItem('accessTokenExpiresIn')
  if (!raw) return true

  const expMs = Number(raw)
  if (!Number.isFinite(expMs)) return true

  return Date.now() >= expMs
}
