// QnaPostWrite.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './QnaPostWrite.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import 'react-toastify/dist/ReactToastify.css'
import RichTextEditor from '../../components/editor/RichTextEditor'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'
import { PostCreateReq, PostCreateRes } from '../../types/post'

function QnaPostWrite() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [tagList, setTagList] = useState<{ id: number; tagName: string }[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const res = await api.get('/api/qna-tags/list')
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
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
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

  // ✅ 이미지 업로드 → 공개 URL 반환 (엔드포인트/응답 키는 백엔드에 맞게 수정)
  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData()

    // 1) 파일 파트 (키: image)  ← 서버가 'file'이면 'file'로 바꾸세요
    form.append('image', file)

    // 2) JSON 파트 (키: dto, Content-Type: application/json)
    const meta = {
      type: 'EDITOR_IMAGE', // 필요 없다면 제거
      originalName: file.name,
      size: file.size,
      mime: file.type,
    }
    form.append(
      'dto',
      new Blob([JSON.stringify(meta)], { type: 'application/json' })
    )

    const { data } = await api.post('/api/uploads/images', form)
    const url = data?.url ?? data?.location ?? data?.data?.url
    if (!url) throw new Error('Upload response has no url')
    return url
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

      // ✅ 대표이미지/미리보기 제거 → 별도 form.append('image', ...) 없음
      const { data } = await api.post<PostCreateRes>(
        '/api/qna-post/create',
        form
      )

      toastSuccess('작성이 완료되었습니다.')
      navigate(`/qna/${data.id}`, { state: { post: data } })
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
      <div className="qnapost-write-container max-w-[1200px] pt-2">
        <h1 className="mb-5 font-bold text-title-1 text-label-normal">
          글쓰기
        </h1>

        <form className="write-form" onSubmit={handleSubmit}>
          {/* 제목 */}
          <p className="write-label">
            제목 <span className="text-system-red">*</span>
          </p>
          <input
            type="text"
            placeholder="글 제목은 내용을 대표할 수 있도록 간결하게 작성해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border outline-none border-line-normal rounded-xl text-label-normal text-body-1"
          />

          {/* 분류(태그) */}
          <p className="mt-4 write-label">
            분류 <span className="text-system-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => {
              const selected = selectedTagIds.includes(Number(tag.id))
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
          <p className="mt-4 write-label">
            내용 <span className="text-system-red">*</span>
          </p>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="궁금한 점을 자유롭게 질문해 주세요."
            minHeight={300}
            uploadImage={uploadImage} // ✅ 툴바 이미지 → 업로드 → 커서삽입
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

export default QnaPostWrite
