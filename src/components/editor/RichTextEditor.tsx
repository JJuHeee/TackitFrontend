// RichTextEditor.tsx
import React, { useMemo, useRef } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './RichTextEditor.css'

const icons = Quill.import('ui/icons')
icons['link'] = '<img src="/icons/link.svg" style="width:18px;height:18px" />'
icons['image'] = '<img src="/icons/image.svg" style="width:18px;height:18px" />'

type Variant = 'post' | 'comment' // post: 이미지/헤더 포함, comment: 텍스트 위주

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  onImageButtonClick?: () => void
  variant?: Variant
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = 300,
  disabled = false,
  className = '',
  onImageButtonClick,
  variant = 'post',
}: Props) {
  const quillRef = useRef<ReactQuill | null>(null)

  const modules = useMemo(() => {
    const handlers = {
      link: () => {
        const quill = quillRef.current?.getEditor()
        if (!quill) return
        const range = quill.getSelection(true)
        const url = window.prompt('링크 URL을 입력하세요.')
        if (!url) return
        if (!range || range.length === 0) {
          quill.insertText(range?.index ?? quill.getLength(), url, 'link', url)
          quill.setSelection(
            (range?.index ?? quill.getLength()) + url.length,
            0
          )
        } else {
          quill.format('link', url)
        }
      },
      image: () => {
        if (variant === 'comment') return // 댓글 모드: 이미지 비활성
        if (onImageButtonClick) onImageButtonClick()
      },
    }

    // 툴바 구성: variant에 따라 다르게
    const toolbarForPost = [
      [{ header: 1 }, { header: 2 }, { header: 3 }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
    ]

    const toolbarForComment = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'], // 이미지/헤더 없음
    ]

    return {
      toolbar: {
        container: variant === 'post' ? toolbarForPost : toolbarForComment,
        handlers,
      },
    }
  }, [onImageButtonClick, variant])

  const formats =
    variant === 'post'
      ? [
          'header',
          'bold',
          'italic',
          'underline',
          'strike',
          'list',
          'bullet',
          'link',
          'image',
        ]
      : ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'] // 댓글 포맷 제한

  return (
    <div
      className={`write-editor ${className}`}
      style={{ ['--min-height' as any]: `${minHeight}px` }}
    >
      <ReactQuill
        key={variant} // 툴바 변경 시 안전하게 리렌더
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  )
}
