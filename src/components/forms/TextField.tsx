import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  id?: string
  label?: React.ReactNode
  required?: boolean
  type?: 'text' | 'email' | 'password'
  value: string
  placeholder?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  /** 하단 메시지 (에러/헬퍼) */
  message?: React.ReactNode
  /** 비밀번호 눈 토글 */
  showToggle?: boolean
  visible?: boolean
  onToggle?: () => void
  /** 닉네임 등 글자수 카운터 */
  showCount?: boolean
  maxLength?: number
  /** 에러 상태 여부 (테두리/문구 빨간색) */
  invalid?: boolean
  className?: string
  autoComplete?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  minLength?: number
  pattern?: string
  disabled?: boolean
  readOnly?: boolean
}

export default function TextField({
  id,
  label,
  required,
  type = 'text',
  value,
  placeholder = '',
  onChange,
  onBlur,
  message,
  showToggle = false,
  visible = false,
  onToggle,
  showCount = false,
  maxLength,
  invalid = false,
  className = '',
  autoComplete,
  inputMode,
  minLength,
  pattern,
}: Props) {
  // 비밀번호 보이기/가리기
  const inputType = showToggle ? (visible ? 'text' : 'password') : type
  const isPasswordMasked =
    inputType === 'password' || (type === 'password' && !visible)

  // 오른쪽 아이콘/카운트 있을 때 padding 조절
  const hasRightAdornment = (showToggle && value) || showCount
  const rightPadClass = hasRightAdornment ? 'pr-14' : 'pr-11'
  const count = typeof value === 'string' ? value.length : 0

  // ✅ border 클래스 (항상 border 보이게 수정)
  const borderClasses = invalid
    ? 'border border-line-negative focus:border-line-negative '
    : 'border border-line-normal '

  // 비밀번호 입력 시 ● 크게 표시
  const passwordSizeClasses =
    inputType === 'password' ? 'text-[18px] tracking-[1px]' : 'text-body-2'

  return (
    <div className={`mb-4 ${className}`}>
      {/* 라벨 */}
      {label && (
        <label htmlFor={id} className="block mb-2 text-body-2sb">
          <span className="text-label-normal">{label}</span>{' '}
          {required && <span className="text-system-red">*</span>}
        </label>
      )}
      <div className="relative">
        {/* 입력창 */}
        <input
          id={id}
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          aria-invalid={invalid || undefined}
          className={[
            'w-full h-12 px-[14px] rounded-xl transition outline-none',
            passwordSizeClasses,
            'text-label-normal font-sans',
            'placeholder:text-body-1 placeholder:font-normal placeholder:text-label-assistive',
            'bg-white',
            borderClasses, // ✅ 수정된 부분 (border 항상 포함)
            rightPadClass,
            isPasswordMasked ? 'password-mask' : '',
          ].join(' ')}
        />

        {/* 비밀번호 눈 아이콘 */}
        {showToggle && value && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute p-0 -translate-y-1/2 bg-transparent border-0 cursor-pointer right-3 top-1/2 text-label-neutral"
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {visible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}

        {/* 글자수 카운트 */}
        {showCount && (
          <div className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-caption text-label-neutral">
            {count}/{maxLength ?? 0}
          </div>
        )}
      </div>

      {/* 하단 메시지 (에러/헬퍼) */}
      {message && (
        <div
          className={`mt-1.5 text-caption ${
            invalid ? 'text-line-negative' : 'text-label-neutral'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
