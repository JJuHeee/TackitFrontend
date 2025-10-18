import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

type Tag = { id: number; tagName: string }

// 서버 상세 응답 (참고용)
type PostDetailResp = {
  id: number
  writer: string
  title: string
  content: string // HTML
  tags: string[] // 태그명 배열
  createdAt: string
  // imageUrl?: string  // 백엔드가 내려주면 사용 가능
}

function FreePostEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // 단일 이미지 파일(새로 고른 경우만 서버에 보냄)
  const [pickedImage, setPickedImage] = useState<File | null>(null)
  const [pickedPreviewUrl, setPickedPreviewUrl] = useState<string | null>(null)

  // removeImage는 서버 스펙상 필요하면 유지 (현재는 삭제 기능 없음 → 기본 false)
  const [removeImage] = useState<boolean>(false)

  const editorRef = useRef<RichTextEditorHandle | null>(null)

  // 본문 의미 있는지 검사
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

  // 태그/게시글 불러오기
  useEffect(() => {
    if (!id) return
    const fetchAll = async () => {
      setLoading(true)
      try {
        // 1) 태그 목록
        const tagRes = await api.get('/api/free_tags')
        const tagNormalized: Tag[] = (tagRes.data ?? []).map((t: any) => ({
          id: Number(t.id),
          tagName: String(t.tagName ?? t.name ?? ''),
        }))
        setTagList(tagNormalized)

        // 2) 게시글 상세
        const postRes = await api.get<PostDetailResp>(`/api/free-posts/${id}`)
        const p = postRes.data
        setTitle(p.title ?? '')
        setContent(String(p.content ?? ''))

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
  }, [id])

  const handleTagToggle = (tid: number | string) => {
    const numId = Number(tid)
    setSelectedTagIds((prev) =>
      prev.includes(numId) ? prev.filter((v) => v !== numId) : [...prev, numId]
    )
  }

  // 에디터 → 부모: 파일 수신 (Write와 동일)
  const handlePickImageFile = useCallback(
    (file: File, previewUrl: string) => {
      if (pickedPreviewUrl) URL.revokeObjectURL(pickedPreviewUrl)
      setPickedImage(file)
      setPickedPreviewUrl(previewUrl)
    },
    [pickedPreviewUrl]
  )

  // 전송 전 본문에서 모든 <img ...> 제거 (서버는 imageUrl로 관리하므로 혼선 방지)
  const stripImages = (html: string) => html.replace(/<img[^>]*>/gi, '')

  const handleSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!id) return
    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    try {
      setSaving(true)

      // Write와 동일: multipart(FormData)로 dto + (선택) image
      const dto = {
        title: title.trim(),
        content: stripImages(content), // 본문 내 <img> 제거
        tagIds: selectedTagIds,
        removeImage, // 스펙에 맞춰 항상 포함(여기서는 false)
      }

      const form = new FormData()
      if (pickedImage) {
        form.append('image', pickedImage) // 새 이미지 선택시에만
      }
      form.append(
        'dto',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      )
      // 서버가 'request' 키를 요구하면 위 라인을 다음처럼 변경:
      // form.append('request', new Blob([JSON.stringify(dto)], { type: 'application/json' }))

      await api.put(`/api/free-posts/${id}`, form)

      toastSuccess('게시글이 수정되었습니다.')
      navigate(`/free/${id}`)
    } catch (err: any) {
      const msg = err?.response?.data?.message || '게시글 수정에 실패했습니다.'
      toastError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate(`/free/${id}`)

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container max-w-[1200px] pt-2">
        <h1 className="mb-5 font-bold text-title-1 text-label-normal">
          글 수정
        </h1>

        <form className="write-form" onSubmit={handleSave}>
          {/* 제목 */}
          <p className="mt-4 text-label-normal text-body-1sb">
            제목 <span className="text-system-red">*</span>
          </p>
          <input
            type="text"
            placeholder="내용을 대표할 수 있는 제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
            disabled={loading}
          />

          {/* 분류(태그) */}
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
                  disabled={loading}
                >
                  #{tag.tagName}
                </Button>
              )
            })}
          </div>

          {/* 내용(본문): 업로드는 제출 시 한 번에 */}
          <p className="mt-6 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="자유롭게 생각이나 이야기를 나눠주세요."
            minHeight={300}
            // ✅ Write와 동일: 즉시 업로드 안 하고 파일만 수집
            onPickImageFile={handlePickImageFile}
          />

          {/* 하단 버튼 */}
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

export default FreePostEdit
