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
  const [uploadingImage, setUploadingImage] = useState(false)

  const editorRef = useRef<RichTextEditorHandle | null>(null)

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

  // ✅ 태그 선택 토글
  const handleTagToggle = (id: number | string) => {
    const numId = Number(id)
    setSelectedTagIds((prev) =>
      prev.includes(numId)
        ? prev.filter((tagId) => tagId !== numId)
        : [...prev, numId]
    )
  }

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

  // ✅ 이미지 업로드 (에디터 → 서버)
  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const meta = {
        type: 'EDITOR_IMAGE',
        originalName: file.name,
        size: file.size,
        mime: file.type,
      }
      form.append(
        'dto',
        new Blob([JSON.stringify(meta)], { type: 'application/json' })
      )

      // 🟢 서버에서 이미지 업로드를 /api/free-posts로 처리하는 경우
      // 백엔드가 업로드 후 url 반환하도록 구현되어 있어야 함
      const { data } = await api.post('/api/free-posts', form)
      const url = data?.url || data?.imageUrl || data?.location
      if (!url) throw new Error('이미지 업로드 응답에 URL이 없습니다.')
      return url
    } catch (err) {
      console.error(err)
      toastError('이미지 업로드 실패')
      throw err
    } finally {
      setUploadingImage(false)
    }
  }

  // ✅ 글 제출
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || uploadingImage) return

    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      const payload: PostCreateReq = {
        title: title.trim(),
        content, // 서버에서 이미지 URL이 포함된 HTML 저장
        tagIds: selectedTagIds,
      }

      const form = new FormData()
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
            uploadImage={uploadImage} // 🟢 커서에 이미지 삽입 시 서버 업로드
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
