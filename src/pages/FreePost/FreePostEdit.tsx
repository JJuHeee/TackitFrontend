// src/pages/free/FreePostEdit.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import './FreePostWrite.css' // 작성 페이지 스타일 재사용
import RichTextEditor, {
  RichTextEditorHandle,
} from '../../components/editor/RichTextEditor'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'

type Tag = { id: number; tagName: string }

// 서버 상세 응답 (본문만 사용하지만 타입은 참고용)
type PostDetailResp = {
  id: number
  writer: string
  title: string
  content: string // HTML
  tags: string[] // 태그명 배열
  createdAt: string
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

  // ✅ 백엔드 스펙 준수: dto에 항상 포함 (본문 이미지만 쓸 거면 기본 false)
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

  // 본문 내 이미지 업로드 (에디터 툴바 이미지 버튼에서 사용)
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('image', file)
    const { data } = await api.post<{ url: string }>(
      '/api/uploads/images',
      form
    )
    return data.url // 이 URL이 content에 <img src="...">로 삽입됨
  }

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

  const handleSave: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!id) return
    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    try {
      setSaving(true)

      // ✅ 서버 요구사항: multipart + dto(JSON) (+ 필요한 경우만 파일)
      // 본문 이미지만 사용하므로 파일 첨부는 없음
      const dto = {
        title: title.trim(),
        content, // HTML (본문 이미지 포함)
        tagIds: selectedTagIds,
        removeImage, // 항상 포함 (기본 false)
      }

      const form = new FormData()
      form.append(
        'dto',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      )

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

          {/* 내용(본문): 이미지 업로드는 툴바 이미지를 통해 삽입 */}
          <p className="mt-6 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="자유롭게 생각이나 이야기를 나눠주세요."
            minHeight={300}
            uploadImage={uploadImage}
            imageOptions={{
              maxWidth: 800,
              maxHeight: 800,
              quality: 0.85,
              mime: 'image/webp',
              compressOver: 300 * 1024,
            }}
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
