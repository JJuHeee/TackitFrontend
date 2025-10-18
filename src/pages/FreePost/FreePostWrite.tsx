import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import './FreePostWrite.css'
import RichTextEditor, {
  RichTextEditorHandle,
} from '../../components/editor/RichTextEditor'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import { PostCreateReq, PostCreateRes } from '../../types/post'

type Tag = { id: number; tagName: string }

function FreePostWrite() {
  const navigate = useNavigate()
  const editorRef = useRef<RichTextEditorHandle | null>(null)

  // 제목/본문/태그
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('') // HTML
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])

  // 태그 목록 및 로딩
  const [tagList, setTagList] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)

  // 제출/업로딩 상태
  const [submitting, setSubmitting] = useState(false)

  // ✅ 단일 이미지 전용 상태
  const [pickedImage, setPickedImage] = useState<File | null>(null)
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null)

  // unmount 시 blob URL 정리
  useEffect(() => {
    return () => {
      if (pickedPreviewUrl) URL.revokeObjectURL(pickedPreviewUrl)
    }
  }, [pickedPreviewUrl])

  // ✅ 태그 목록 불러오기
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const res = await api.get('/api/free_tags')
        const normalized = (res.data ?? []).map((t: any) => ({
          id: Number(t.id),
          tagName: String(t.tagName ?? t.name ?? ''),
        }))
        setTagList(normalized)
      } catch {
        // 실패 시 더미
        setTagList([
          { id: 2, tagName: '태그2' },
          { id: 3, tagName: '태그3' },
        ])
      } finally {
        setLoadingTags(false)
      }
    }
    fetchTags()
  }, [])

  // ✅ 태그 토글
  const handleTagToggle = (id: number | string) => {
    const numId = Number(id)
    setSelectedTagIds((prev) =>
      prev.includes(numId) ? prev.filter((v) => v !== numId) : [...prev, numId]
    )
  }

  // ✅ 에디터 → 부모: 단일 이미지 파일 수신 (교체 시 기존 blob URL 해제)
  const handlePickImageFile = useCallback(
    (file: File, previewUrl: string) => {
      if (pickedPreviewUrl) URL.revokeObjectURL(pickedPreviewUrl)
      setPickedImage(file)
      setPickedPreviewUrl(previewUrl)
    },
    [pickedPreviewUrl]
  )

  // ✅ 내용 유효성 검사
  const hasMeaningfulContent = (html: string) => {
    if (!html) return false
    if (/<img|<video|<iframe/i.test(html)) return true
    const text = html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
    return text.length > 0
  }

  const isReadyToSubmit = useMemo(
    () => title.trim().length > 0 && hasMeaningfulContent(content),
    [title, content]
  )

  // ✅ 전송 전 본문에서 모든 <img ...> 제거
  const stripImages = (html: string) => html.replace(/<img[^>]*>/gi, '')

  // ✅ 제출
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || loadingTags) return

    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      // ❗본문의 <img> 태그 제거 후 전송
      const contentForServer = stripImages(content)

      const payload: PostCreateReq = {
        title: title.trim(),
        content: contentForServer,
        tagIds: selectedTagIds,
      }

      const form = new FormData()
      if (pickedImage) {
        form.append('image', pickedImage) // ✅ 단일 이미지
      }
      form.append(
        'dto',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )

      const { data } = await api.post<PostCreateRes>('/api/free-posts', form)

      toastSuccess('작성이 완료되었습니다.')
      navigate(`/free/${data.id}`, { state: { post: data } })
    } catch (err: any) {
      const msg = err?.response?.data?.message || '글 작성에 실패했습니다.'
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container max-w-[1200px] pt-2">
        <h1 className="mb-5 font-bold text-title-1 text-label-normal">
          글쓰기
        </h1>

        <form className="write-form" onSubmit={handleSubmit}>
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
          />

          {/* 태그 선택 */}
          <p className="mt-4 write-label">
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
                >
                  #{tag.tagName}
                </Button>
              )
            })}
          </div>

          {/* 본문 */}
          <p className="mt-4 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="자유롭게 작성해 주세요."
            minHeight={300}
            variant="post"
            // ✅ 업로드는 제출 시 한 번에: 여기서는 파일만 수집
            onPickImageFile={handlePickImageFile}
          />

          {/* 등록 버튼 */}
          <div className="flex justify-center mb-4">
            <Button
              type="submit"
              variant="primary"
              size="m"
              disabled={submitting || loadingTags || !isReadyToSubmit}
              className={clsx(
                'w-[120px] h-11',
                (!isReadyToSubmit || submitting || loadingTags) &&
                  'opacity-50 cursor-not-allowed'
              )}
            >
              {submitting ? '등록 중…' : '등록'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default FreePostWrite
