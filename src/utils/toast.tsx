import { toast, ToastOptions } from 'react-toastify'
import { Check } from 'lucide-react'
import React from 'react'

type ToastKind = 'success'

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

function ToastBody({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-12 h-14">
      <div
        className="flex items-center justify-center rounded-full w-7 h-7 shrink-0"
        style={{ background: 'var(--accent-positive, #22c55e)' }}
      >
        <Check size={16} color="#fff" />
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

export const showToast = (message: string, _kind: ToastKind = 'success') => {
  toast(<ToastBody message={message} />, baseOptions)
}

export const toastSuccess = (msg = '메시지에 마침표를 찍어요.') =>
  showToast(msg, 'success')
