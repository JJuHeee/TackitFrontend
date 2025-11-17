import React, { useEffect, useRef, useState } from 'react'
import RichTextEditor from '../editor/RichTextEditor'
import ModalButton from '../ui/ModalButton'
import { isEditorEmpty } from '../../utils/editor'

type CommentEditorProps = {
  value: string
  onChange: (html: string) => void
  onSubmit: () => void
  onCancel?: () => void
  isEditing: boolean
  collapsedPlaceholder?: string
}

export default function CommentEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
  collapsedPlaceholder = '댓글을 입력해 주세요.',
}: CommentEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 내용이 있거나 편집중이면 펼침으로 시작
  const [isActive, setIsActive] = useState<boolean>(
    isEditing || !isEditorEmpty(value)
  )
  useEffect(() => {
    setIsActive(isEditing || !isEditorEmpty(value))
  }, [isEditing, value])

  // 바깥 클릭을 ESC처럼: 내용 비고 편집중 아니면 접기
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        if (!isEditing && isEditorEmpty(value)) {
          setIsActive(false)
          onCancel?.()
        }
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [value, isEditing, onCancel])

  // ① 접힘 상태
  if (!isActive) {
    return (
      <div
        className="flex items-center gap-3 mb-20 comment-collapsed"
        onClick={() => setIsActive(true)}
      >
        <img
          src="/icons/mypage-icon.svg"
          alt="마이페이지"
          className="object-cover rounded-full w-9 h-9"
        />

        <div
          className="
          flex-1
          h-11
          border border-line-normal
          rounded-[12px]
          flex items-center
          px-4
          text-label-assistive
          bg-white
          cursor-text
        "
        >
          {collapsedPlaceholder}
        </div>
      </div>
    )
  }

  // ② 펼침 상태
  return (
    <div className="flex gap-3 mb-20 comment-expanded" ref={rootRef}>
      <img
        src="/icons/mypage-icon.svg"
        alt="마이페이지"
        className="object-cover rounded-full w-9 h-9"
      />

      {/* 에디터 박스: 라운드 12px, 흰 배경 */}
      <div className="flex-1 overflow-hidden bg-white editor-box rounded-xl">
        <RichTextEditor
          variant="comment"
          value={value}
          onChange={onChange}
          placeholder={
            isEditing ? '댓글을 수정하세요.' : '자유롭게 답변을 작성해주세요.'
          }
          minHeight={160}
          className="comment-rte"
        />

        {/* 버튼 영역: 오른쪽 정렬, 14px 좌우 패딩, 12px 위아래 패딩 */}
        <div className="editor-actions flex justify-end gap-3 px-[14px] py-3">
          <ModalButton
            variant="ghost"
            size="l"
            onClick={() => {
              if (!isEditing) {
                onChange('')
              }
              setIsActive(false)
              onCancel?.()
            }}
          >
            취소
          </ModalButton>

          <ModalButton variant="primary" size="l" onClick={onSubmit}>
            {isEditing ? '수정 완료' : '등록'}
          </ModalButton>
        </div>
      </div>
    </div>
  )
}
