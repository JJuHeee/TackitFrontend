// FreePostWrite.tsx (변경분만)
import React, { useState, useEffect, useMemo, useRef } from 'react'
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

function FreePostWrite() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<{ id: number; tagName: string }[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const editorRef = useRef<RichTextEditorHandle | null>(null)

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

  const handleTagToggle = (id: number | string) => {
    const numId = Number(id)
    setSelectedTagIds((prev) =>
      prev.includes(numId)
        ? prev.filter((tagId) => tagId !== numId)
        : [...prev, numId]
    )
  }

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

  // ✅ 서버에 이미지 업로드하고 공개 URL을 반환
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('image', file)
    // 백엔드에 맞게 엔드포인트/응답 키 수정
    const { data } = await api.post<{ url: string }>(
      '/api/uploads/images',
      form
    )
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const payload: PostCreateReq = {
        title: title.trim(),
        content, // ← 본문 안에 <img src="..."> 포함됨
        tagIds: selectedTagIds,
      }

      const form = new FormData()
      form.append(
        'dto',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )

      // ✅ 더 이상 별도 대표이미지(form.append('image', ...)) 없음
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
            placeholder="내용을 대표할 수 있는 제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
          />

          {/* 분류 */}
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

          {/* 내용 */}
          <p className="mt-4 text-label-normal text-body-1sb">
            내용 <span className="text-system-red">*</span>
          </p>

          {/* ✅ 에디터에 업로드 함수만 전달 */}
          <RichTextEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            placeholder="자유롭게 생각이나 이야기를 나눠주세요."
            minHeight={300}
            uploadImage={uploadImage}
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
