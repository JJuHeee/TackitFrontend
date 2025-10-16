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

// ✅ 추가: 클라 리사이즈/압축 옵션 타입
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
  /** ✅ 추가: 리사이즈/압축 옵션 */
  imageOptions?: ImageOptions
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
    imageOptions,
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

  // ✅ 변경: 파일 선택 → (리사이즈/압축) → 업로드 시도 → 실패 시 base64 폴백 → 커서 삽입
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    try {
      const url = await processImageAndGetURL(file, {
        uploadImage,
        imageOptions,
      })
      insertAtCursor(url)
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

/* ===== 아래 유틸 함수들 추가 ===== */

// ✅ 핵심: 리사이즈/압축 후 업로드 시도, 실패하면 base64로 폴백
async function processImageAndGetURL(
  file: File,
  opts: {
    uploadImage?: (file: File) => Promise<string>
    imageOptions?: ImageOptions
  }
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.85,
    mime = 'image/webp',
    compressOver = 300 * 1024,
  } = opts.imageOptions || {}

  const needCompress = file.size >= compressOver
  const processedBlob = needCompress
    ? await downscaleImage(file, { maxWidth, maxHeight, quality, mime })
    : file

  if (opts.uploadImage) {
    try {
      const asFile = blobToFile(processedBlob, guessName(file.name, mime))
      return await opts.uploadImage(asFile) // 서버 URL
    } catch {
      // 업로드 실패하면 base64로 폴백
      return await blobToDataURL(processedBlob)
    }
  }

  // 업로드 함수가 없으면(로컬) base64로 삽입
  return await blobToDataURL(processedBlob)
}

function guessName(original: string, mime: string) {
  const base = original.replace(/\.[^.]+$/, '')
  const ext = mime.split('/')[1] || 'jpg'
  return `${base}.${ext}`
}

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, {
    type: blob.type || 'application/octet-stream',
  })
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result))
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })
}

function downscaleImage(
  file: File,
  opts: { maxWidth: number; maxHeight: number; quality: number; mime: string }
): Promise<Blob> {
  const { maxWidth, maxHeight, quality, mime } = opts
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl)
    }

    img.addEventListener('load', () => {
      try {
        let { width, height } = img
        const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
        const w = Math.round(width * ratio)
        const h = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          cleanup()
          return reject(new Error('Canvas not supported'))
        }
        ctx.clearRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)

        canvas.toBlob(
          (blob) => {
            cleanup()
            if (!blob) return reject(new Error('toBlob failed'))
            resolve(blob)
          },
          mime,
          quality
        )
      } catch (err) {
        cleanup()
        reject(err)
      }
    })

    img.addEventListener('error', (e) => {
      cleanup()
      reject(new Error('Image load error'))
    })

    img.src = objectUrl
  })
}
