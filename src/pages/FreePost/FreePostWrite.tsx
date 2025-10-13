import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import 'react-toastify/dist/ReactToastify.css'
import Button from '../../components/ui/Button'
import clsx from 'clsx'
import './FreePostWrite.css'
import RichTextEditor from '../../components/editor/RichTextEditor'
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
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const openCoverDialog = useCallback(() => {
    coverInputRef.current?.click()
  }, [])

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const removeCover = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(null)
    setCoverFile(null)
    if (coverInputRef.current) coverInputRef.current.value = ''
  }
  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true)
      try {
        const res = await api.get('/api/free_tags')
        setTagList(res.data)
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

  const handleTagToggle = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
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

  const isReadyToSubmit = useMemo(() => {
    return title.trim().length > 0 && hasMeaningfulContent(content)
  }, [title, content])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!isReadyToSubmit) {
      toastWarn('제목과 내용을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    try {
      // ✅ FormData 구성 (request: application/json, image: file)
      const form = new FormData()
      const payload: PostCreateReq = {
        title: title.trim(),
        content,
        tagIds: selectedTagIds,
      }

      // request 파트를 반드시 application/json 으로!
      form.append(
        'request',
        new Blob([JSON.stringify(payload)], { type: 'application/json' })
      )

      // 이미지 선택된 경우에만 파일 파트 추가 (선택 사항)
      if (coverFile) {
        form.append('image', coverFile)
      }

      const { data } = await api.post<PostCreateRes>('/api/free-posts', form, {
        headers: {},
      })

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
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          style={{ display: 'none' }}
        />
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
                      ? 'border-[1px] border-[#4D77FF] text-[#4D77FF] bg-background-blue'
                      : 'border-line-normal text-label-normal bg-transparent'
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
          {/* 미리보기: 에디터 “안처럼” 보이게 위에 렌더링 (하지만 본문 데이터는 아님) */}
          {coverPreview && (
            <div className="mt-3">
              <p className="mb-2 text-sm text-label-assistive">
                대표 이미지 미리보기
              </p>
              <div className="relative inline-block w-fit">
                <img
                  src={coverPreview}
                  alt="대표 이미지 미리보기"
                  className="block max-w-[360px] h-auto rounded-xl border border-line-normal"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute flex items-center justify-center text-sm text-white rounded-full top-2 right-2 bg-black/60 w-7 h-7 hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="자유롭게 생각이나 이야기를 나눠주세요."
            minHeight={300}
            // ✅ 이미지 아이콘 클릭 시 대표이미지 선택창 열리게 연결
            onImageButtonClick={openCoverDialog}
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
