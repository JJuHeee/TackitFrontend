import { toast, ToastOptions } from 'react-toastify'
import { Check, AlertTriangle, XCircle } from 'lucide-react'
import React from 'react'

type ToastKind = 'success' | 'warn' | 'error'

const baseOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 2500,
  hideProgressBar: true,
  closeButton: false,
  icon: false,
  draggable: true,
  pauseOnHover: true,
  style: {
    minWidth: 335,
    height: 56,
    background: 'var(--background-active)',
    color: 'var(--label-inverse)',
    borderRadius: 12,
    padding: '0 16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
  },
}

// ✅ 공용 토스트 바디 컴포넌트
function ToastBody({ message, kind }: { message: string; kind: ToastKind }) {
  let iconStyle: React.CSSProperties
  let IconComponent

  switch (kind) {
    case 'success':
      iconStyle = { background: 'var(--accent-positive, #22c55e)' }
      IconComponent = Check
      break
    case 'warn':
      iconStyle = { background: 'var(--accent-warning, #facc15)' }
      IconComponent = AlertTriangle
      break
    case 'error':
      iconStyle = { background: 'var(--accent-negative, #ef4444)' }
      IconComponent = XCircle
      break
  }

  return (
    <div className="flex items-center gap-12 h-14">
      <div
        className="flex items-center justify-center rounded-full w-7 h-7 shrink-0"
        style={iconStyle}
      >
        <IconComponent size={16} color="#fff" />
      </div>

      <span
        className="text-base font-semibold tracking-tight"
        style={{ color: 'var(--label-inverse)' }}
      >
        {message}
      </span>
    </div>
  )
}

// ✅ 공용 호출 함수
export const showToast = (message: string, kind: ToastKind = 'success') => {
  toast(<ToastBody message={message} kind={kind} />, baseOptions)
}

// ✅ 개별 헬퍼 함수
export const toastSuccess = (msg = '성공적으로 완료되었습니다.') =>
  showToast(msg, 'success')

export const toastWarn = (msg = '입력값을 확인해 주세요.') =>
  showToast(msg, 'warn')

export const toastError = (msg = '오류가 발생했습니다.') =>
  showToast(msg, 'error')
