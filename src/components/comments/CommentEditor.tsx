import React, { useEffect, useRef, useState } from 'react'
import RichTextEditor from '../editor/RichTextEditor'
import ModalButton from '../ui/ModalButton'

type CommentEditorProps = {
  // 댓글 내용은 HTML 문자열로 관리 (ReactQuill 규격)
  value: string
  onChange: (html: string) => void
  onSubmit: () => void
  onCancel?: () => void
  // 이미지를 누르면 실행할 업로드/선택 핸들러(선택)
  onImageButtonClick?: () => void
  isEditing: boolean
  // 접힘 상태일 때 placeholder
  collapsedPlaceholder?: string
}

export default function CommentEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  onImageButtonClick,
  isEditing,
  collapsedPlaceholder = '댓글을 입력해 주세요.',
}: CommentEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isActive, setIsActive] = useState<boolean>(isEditing || !!value)

  // 바깥 클릭 시(내용 없고, 편집중 아님) 다시 접기
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        if (!value && !isEditing) setIsActive(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [value, isEditing])

  // ① 접힘 상태 (이미지 1)
  if (!isActive) {
    return (
      <div className="comment-collapsed" onClick={() => setIsActive(true)}>
        <div className="avatar" />
        <div className="collapsed-box">{collapsedPlaceholder}</div>
      </div>
    )
  }

  // ② 펼침 상태 (이미지 2) — RichTextEditor 사용
  return (
    <div className="comment-expanded" ref={rootRef}>
      <div className="avatar" />
      <div className="editor-box">
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={
            isEditing ? '댓글을 수정하세요.' : '자유롭게 답변을 작성해주세요.'
          }
          minHeight={180} // 댓글용으로 조금 낮춤
          className="comment-rte" // 댓글 스코프의 스타일
          onImageButtonClick={onImageButtonClick}
        />

        <div className="flex justify-end gap-3 editor-actions">
          <ModalButton
            variant="ghost"
            size="l"
            onClick={() => {
              if (!isEditing) setIsActive(false)
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
