// RichTextEditor.tsx
import React, { useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './RichTextEditor.css'

const icons = Quill.import('ui/icons')
icons['link'] = '<img src="/icons/link.svg" style="width:18px;height:18px" />'
icons['image'] = '<img src="/icons/image.svg" style="width:18px;height:18px" />'

type Variant = 'post' | 'comment'

export type RichTextEditorHandle = {
  insertImage: (url: string) => void
  focus: () => void
}

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  /** 파일 업로드 → 공개 URL 반환 */
  uploadImage?: (file: File) => Promise<string>
  variant?: Variant
}

function InternalEditor(
  {
    value,
    onChange,
    placeholder = '',
    minHeight = 300,
    disabled = false,
    className = '',
    uploadImage,
    variant = 'post',
  }: Props,
  ref: React.Ref<RichTextEditorHandle>
) {
  const quillRef = useRef<ReactQuill | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useImperativeHandle(ref, () => ({
    insertImage: (url: string) => {
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true) || {
        index: quill.getLength(),
        length: 0,
      }
      quill.insertEmbed(range.index, 'image', url, 'user')
      quill.setSelection(range.index + 1, 0, 'user')
    },
    focus: () => quillRef.current?.focus(),
  }))

  const pickImage = () => {
    if (variant === 'comment') return
    fileInputRef.current?.click()
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return

    try {
      // 업로드 함수가 있으면 서버 업로드 → URL, 없으면 base64
      const url = uploadImage ? await uploadImage(file) : await toBase64(file)
      const quill = quillRef.current?.getEditor()
      if (!quill) return
      const range = quill.getSelection(true) || {
        index: quill.getLength(),
        length: 0,
      }
      quill.insertEmbed(range.index, 'image', url, 'user')
      quill.setSelection(range.index + 1, 0, 'user')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const modules = useMemo(() => {
    const handlers = {
      link: () => {
        const quill = quillRef.current?.getEditor()
        if (!quill) return
        const range = quill.getSelection(true)
        const url = window.prompt('링크 URL을 입력하세요.')
        if (!url) return
        if (!range || range.length === 0) {
          const at = range?.index ?? quill.getLength()
          quill.insertText(at, url, 'link', url)
          quill.setSelection(at + url.length, 0)
        } else {
          quill.format('link', url)
        }
      },
      image: pickImage,
    }

    const toolbarForPost = [
      [{ header: 1 }, { header: 2 }, { header: 3 }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
    ]
    const toolbarForComment = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
    ]

    return {
      toolbar: {
        container: variant === 'post' ? toolbarForPost : toolbarForComment,
        handlers,
      },
    }
  }, [variant])

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
      : ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link']

  return (
    <div
      className={`write-editor ${className}`}
      style={{ ['--min-height' as any]: `${minHeight}px` }}
    >
      {/* 숨겨진 파일 입력: 툴바 이미지 버튼이 이걸 연다 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <ReactQuill
        key={variant}
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

export default forwardRef(InternalEditor)
