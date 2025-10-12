// RichTextEditor.tsx
import React, { useMemo, useRef } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './RichTextEditor.css'

const icons = Quill.import('ui/icons')
icons['link'] = '<img src="/icons/link.svg" style="width:18px;height:18px" />'
icons['image'] = '<img src="/icons/image.svg" style="width:18px;height:18px" />'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  onImageButtonClick?: () => void
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = 300,
  disabled = false,
  className = '',
  onImageButtonClick,
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
        if (onImageButtonClick) {
          onImageButtonClick()
          return
        }
      },
    }

    return {
      toolbar: {
        container: [
          [{ header: 1 }, { header: 2 }, { header: 3 }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
        ],
        handlers,
      },
    }
  }, [onImageButtonClick])

  const formats = [
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

  return (
    <div
      className={`write-editor ${className}`}
      style={{ ['--min-height' as any]: `${minHeight}px` }}
    >
      <ReactQuill
        key={onImageButtonClick ? 'rte-cover-proxy' : 'rte-default'}
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
