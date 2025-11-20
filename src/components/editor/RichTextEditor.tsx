import React, {
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './RichTextEditor.css'

// 툴바 아이콘 교체 (옵션)
const icons = Quill.import('ui/icons')
icons['link'] = '<img src="/icons/link.svg" style="width:18px;height:18px" />'
icons['image'] = '<img src="/icons/image.svg" style="width:18px;height:18px" />'

type Variant = 'post' | 'comment'

export type RichTextEditorHandle = {
  insertImage: (url: string) => void
  focus: () => void
}

// 클라 이미지 옵션(현재 미사용, 확장 여지)
type ImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mime?: string
  compressOver?: number
}

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  imageOptions?: ImageOptions
  variant?: Variant
  onPickImageFile?: (file: File, previewUrl: string) => void
  onUploadImage?: (file: File) => Promise<string>
}

function InternalEditor(
  {
    value,
    onChange,
    placeholder = '',
    minHeight = 300,
    disabled = false,
    className = '',
    variant = 'post',
    onPickImageFile,
    onUploadImage,
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

  // 이미지 버튼 → 파일 선택
  const pickImage = useCallback(() => {
    if (variant === 'comment') return
    fileInputRef.current?.click()
  }, [variant])

  // 파일 선택 처리 (단일)
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const quill = quillRef.current?.getEditor()
    if (!quill) return

    try {
      const sel = quill.getSelection()
      const reader = new FileReader()
      reader.onload = async () => {
        const previewUrl = String(reader.result)

        const index = sel ? sel.index : Math.max(0, quill.getLength() - 1)
        quill.insertEmbed(index, 'image', previewUrl, 'user')
        quill.setSelection(index + 1, 0, 'user')

        onPickImageFile?.(file, previewUrl)

        if (onUploadImage) {
          try {
            const uploadedUrl = await onUploadImage(file)
            const imgs = quill.root.querySelectorAll<HTMLImageElement>('img')
            imgs.forEach((img) => {
              if (img.src === previewUrl) img.src = uploadedUrl
            })
            onChange(quill.root.innerHTML)
          } catch {}
        } else {
          onChange(quill.root.innerHTML)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
      [{ header: 1 }, { header: 2 }, { header: 3 }],
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
  }, [variant, pickImage])

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
      : [
          'header',
          'bold',
          'italic',
          'underline',
          'strike',
          'list',
          'bullet',
          'link',
        ]

  return (
    <div
      className={`write-editor ${className}`}
      style={{ ['--min-height' as any]: `${minHeight}px` }}
    >
      {/* 숨겨진 파일 입력: 단일 파일만 */}
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
