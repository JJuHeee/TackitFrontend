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

const icons = Quill.import('ui/icons')
icons['link'] = '<img src="/icons/link.svg" style="width:18px;height:18px" />'
icons['image'] = '<img src="/icons/image.svg" style="width:18px;height:18px" />'

type Variant = 'post' | 'comment'

export type RichTextEditorHandle = {
  insertImage: (url: string) => void
  focus: () => void
}

// 클라 리사이즈/압축 옵션 (현재 파일에서는 사용하지 않지만, Props용으로 유지)
type ImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0~1
  mime?: string // 'image/jpeg' | 'image/webp' 등
  compressOver?: number // 바이트: 이 크기 이상이면 압축 시도
}

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
  className?: string
  /** 파일 업로드 → 공개 URL 반환 (없으면 base64로 삽입) */
  uploadImage?: (file: File) => Promise<string>
  /** 리사이즈/압축 옵션 */
  imageOptions?: ImageOptions
  variant?: Variant
  /** 에디터에서 고른 원본 파일을 부모로 올려보낼 때 사용 */
  onPickImageFile?: (file: File) => void
}

function InternalEditor(
  {
    value,
    onChange,
    placeholder = '',
    minHeight = 300,
    disabled = false,
    className = '',
    // uploadImage,      // 현재 사용하지 않으므로 구조분해에서 제외
    // imageOptions,     // 현재 사용하지 않으므로 구조분해에서 제외
    variant = 'post',
    onPickImageFile,
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

  // ✅ pickImage를 useCallback으로 메모이즈
  const pickImage = useCallback(() => {
    if (variant === 'comment') return
    fileInputRef.current?.click()
  }, [variant])

  // 파일 선택 → 부모에 파일 전달 + 미리보기 URL을 에디터에 삽입
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return

    try {
      // 부모로 파일 전달 (submit 시 FormData에 넣을 수 있게)
      onPickImageFile?.(file)

      // 미리보기: object URL로 즉시 삽입
      const previewUrl = URL.createObjectURL(file)
      insertAtCursor(previewUrl)
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const insertAtCursor = (url: string) => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return
    const range = quill.getSelection(true) || {
      index: quill.getLength(),
      length: 0,
    }
    quill.insertEmbed(range.index, 'image', url, 'user')
    quill.setSelection(range.index + 1, 0, 'user')
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
  }, [variant, pickImage]) // ✅ pickImage 의존성 추가

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
