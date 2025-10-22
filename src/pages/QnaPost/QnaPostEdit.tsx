// src/pages/qna/QnaPostEdit.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import './QnaPostWrite.css'
import RichTextEditor, {
  type RichTextEditorHandle,
} from '../../components/editor/RichTextEditor'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import {
  hydrateCoverToken,
  replaceFirstDataUrlImgWithToken,
} from '../../utils/coverToken'

type Tag = { id: number; tagName: string }

// QnA 상세 응답(예시)용 타입
type QnaPostDetail = {
  postId: number
  writer: string
  title: string
  content: string
  tags: string[] // 태그명 배열
  createdAt: string
  imageUrl?: string | null
}

type QnaUpdateReq = {
  title: string
  content: string
  tagIds: number[]
  removeImage: boolean
}

function QnaPostEdit() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pickedImage, setPickedImage] = useState<File | null>(null)
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null)
  const [removeImage] = useState<boolean>(false)

  const editorRef = useRef<RichTextEditorHandle | null>(null)

  const hasMeaningfulContent = (html: string) => {
    if (!html) return false
    const text = html
      .replace(/<img[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
    return text.length > 0
  }

  const isReadyToSubmit = useMemo(
    () => title.trim().length > 0 && hasMeaningfulContent(content),
    [title, content]
  )

  useEffect(() => {
    if (!postId) return
    const fetchAll = async () => {
      setLoading(true)
      try {
        // 1) 태그 목록
        const tagRes = await api.get('/api/qna-tags/list')
        const tagNormalized: Tag[] = (tagRes.data ?? []).map((t: any) => ({
          id: Number(t.id),
          tagName: String(t.tagName ?? t.name ?? ''),
        }))
        setTagList(tagNormalized)

        // 2) 게시글 상세
        const postRes = await api.get<QnaPostDetail>(`/api/qna-post/${postId}`)
        const p = postRes.data

        setTitle(p.title ?? '')
        setContent(
          hydrateCoverToken(String(p.content ?? ''), p.imageUrl ?? null)
        )

        // 태그명 → 태그ID 매핑
        const matched = tagNormalized.filter((t) =>
          (p.tags ?? []).includes(t.tagName)
        )
        setSelectedTagIds(matched.map((t) => t.id))
      } catch {
        toastError('게시글 또는 태그 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [postId])

  const handleTagToggle = (tid: number | string) => {
    const numId = Number(tid)
    setSelectedTagIds((prev) =>
      prev.includes(numId) ? prev.filter((v) => v !== numId) : [...prev, numId]
    )
  }

  const handlePickImageFile = useCallback(
    (file: File, previewUrl: string) => {
      if (pickedPreviewUrl && pickedPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pickedPreviewUrl)
      }
      setPickedImage(file)
      setPickedPreviewUrl(previewUrl)
    },
    [pickedPreviewUrl]
  )

  const handleSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!postId) return
    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    try {
      setSaving(true)

      const contentForServer = replaceFirstDataUrlImgWithToken(content)

      const reqPayload: QnaUpdateReq = {
        title: title.trim(),
        content: contentForServer,
        tagIds: selectedTagIds,
        removeImage,
      }

      const form = new FormData()
      form.append(
        'request',
        new Blob([JSON.stringify(reqPayload)], { type: 'application/json' })
      )
      if (pickedImage) {
        form.append('image', pickedImage)
      }

      await api.put(`/api/qna-post/${postId}`, form)

      toastSuccess('게시글이 수정되었습니다.')
      navigate(`/qna/${postId}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || '게시글 수정에 실패했습니다.'
      toastError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate(`/qna/${postId}`)

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container max-w-[1200px] pt-2">
        <h1
          className="mb-5 font-bold cursor-pointer text-title-1 text-label-normal"
          onClick={() => navigate('/qna')}
        >
          글 수정
        </h1>

        <form className="write-form" onSubmit={handleSave}>
          {/* 제목 */}
          <p className="mt-4 text-label-normal text-body-1sb">
            제목 <span className="text-system-red">*</span>
          </p>
          <input
            type="text"
            placeholder="제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
            disabled={loading}
          />

          {/* 분류(태그) */}
          <p className="mt-4 text-label-normal text-body-1sb">
            분류 <span className="text-system-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => {
              const selected = selectedTagIds.includes(tag.id)
              return (
                <Button
                  key={tag.id}
                  type="button"
                  variant="outlined"
                  size="outlinedS"
                  aria-pressed={selected}
                  onClick={() => handleTagToggle(tag.id)}
                  className={clsx(
                    selected
                      ? '!border-line-active text-label-primary bg-background-blue'
                      : 'border-line-normal text-label-normal'
                  )}
                  disabled={loading}
                >
                  #{tag.tagName}
                </Button>
              )
            })}
          </div>

          {/* 내용 */}
          <p className="mt-6 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="궁금한 점을 자유롭게 질문해 주세요."
            minHeight={300}
            onPickImageFile={handlePickImageFile}
          />

          {/* 하단 버튼 영역 */}
          <div className="flex justify-center mb-4">
            <Button
              type="submit"
              variant="primary"
              size="m"
              disabled={saving || loading || !isReadyToSubmit}
              className={clsx(
                'w-[120px] h-11',
                (!isReadyToSubmit || saving || loading) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default QnaPostEdit
