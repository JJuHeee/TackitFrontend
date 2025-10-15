import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import ModalButton from '../ui/ModalButton'

type TargetType = 'POST' | 'COMMENT'
type Reason =
  | 'ADVERTISEMENT'
  | 'DUPLICATE'
  | 'FALSE_INFO'
  | 'IRRELEVANT'
  | 'ETC'

const REASON_OPTIONS: { value: Reason; label: string }[] = [
  { value: 'ADVERTISEMENT', label: '광고 및 홍보성 내용' },
  { value: 'DUPLICATE', label: '중복 또는 도배성 내용' },
  { value: 'FALSE_INFO', label: '허위 정보 또는 사실 왜곡' },
  { value: 'IRRELEVANT', label: '게시판 주제와 관련 없는 내용' },
  { value: 'ETC', label: '기타' },
]

export type ReportPayload = {
  targetId: number
  targetType: TargetType
  reason: Reason
}

type Props = {
  isOpen: boolean
  targetId: number
  targetType: TargetType
  onClose: () => void
  onSubmit: (payload: ReportPayload) => Promise<void> | void
  submitting?: boolean
  withOverlay?: boolean
}

export default function ReportModal({
  isOpen,
  targetId,
  targetType,
  onClose,
  onSubmit,
  submitting = false,
  withOverlay = true,
}: Props) {
  const [reason, setReason] = useState<Reason | ''>('')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setDetail('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const title = targetType === 'POST' ? '게시물 신고' : '댓글 신고'
  const showDetail = reason === 'ETC'
  const canSubmit = !!reason && (!showDetail || detail.trim().length > 0)

  const modalHeightClass = showDetail ? 'h-[424px]' : 'h-[364px]' // ← 가변 높이
  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit({ targetId, targetType, reason: reason as Reason })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {withOverlay && (
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* 모달 박스: 너비/둥근모서리 + 높이 가변 + 부드러운 트랜지션 */}
      <div
        className={clsx(
          'relative bg-white rounded-[16px] shadow-xl w-[327px]',
          modalHeightClass,
          'p-6',
          'transition-[height] duration-200 ease-out'
        )}
      >
        {/* 제목/부제: 기본 margin 제거 + gap으로 정확 제어 */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="m-0 text-title-2b text-label-normal">{title}</h2>
          <p className="m-0 text-body-1 text-label-neutral">
            신고 사유를 선택해주세요.
          </p>
        </div>

        {/* 라디오 리스트 */}
        <fieldset className="mt-4 space-y-3">
          {REASON_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <input
                type="radio"
                name="report-reason"
                value={opt.value}
                checked={reason === opt.value}
                onChange={(e) => setReason(e.target.value as Reason)}
                className="sr-only peer"
                aria-label={opt.label}
              />
              <span
                className={clsx(
                  'inline-flex items-center justify-center',
                  'w-6 h-6 rounded-full border',
                  'border-line-normal bg-background-common',
                  'peer-checked:border-interaction-normal peer-checked:border-[6px]'
                )}
              />
              <span className="text-body-1 text-label-normal">{opt.label}</span>
            </label>
          ))}
        </fieldset>

        {/* ETC 입력칸 (한 줄 높이) */}
        {showDetail && (
          <div className="mt-4">
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="신고 사유를 구체적으로 작성해주세요."
              className={clsx(
                'w-full h-12 resize-none rounded-xl',
                'border border-line-normal bg-white px-4 py-2',
                'text-body-1 text-label-normal placeholder:text-label-assistive',
                'focus:outline-none'
              )}
              maxLength={200}
            />
          </div>
        )}

        {/* ETC일 때 버튼 위 간격 32px 확보용 스페이서 */}
        {showDetail && <div className="h-8" />}

        {/* 하단 버튼: 항상 아래 고정 + 버튼 간 간격 8px */}
        <div className="absolute flex justify-between gap-2 bottom-6 left-6 right-6">
          <ModalButton variant="ghost" size="m" onClick={onClose}>
            취소
          </ModalButton>
          <ModalButton
            variant="primary"
            size="m"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
          >
            신고하기
          </ModalButton>
        </div>
      </div>
    </div>
  )
}
