// src/pages/free/FreePostEdit.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './FreePostEdit.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { toast } from 'react-toastify'

type Tag = { id: number; tagName: string }

type PostDetailResp = {
  writer: string
  title: string
  content: string
  tags: string[] // 서버에서 태그명을 배열로 내려주는 형태에 맞춤
  createdAt: string
}

const fallbackTags: Tag[] = [
  { id: 1, tagName: '태그1' },
  { id: 2, tagName: '태그2' },
  { id: 3, tagName: '태그3' },
]

const fallbackPost: PostDetailResp = {
  writer: '',
  title: '본문1 제목',
  content: '내용4',
  tags: ['태그1', '태그3', '태그2'],
  createdAt: '2025-05-13T19:34:53.52603',
}

function FreePostEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [tagOptions, setTagOptions] = useState<Tag[]>(fallbackTags)
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  const toggleTag = (tagId: number) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((v) => v !== tagId) : [...prev, tagId]
    )
  }

  useEffect(() => {
    if (!id) return
    const fetchTagsAndPost = async () => {
      setLoading(true)
      let tagsData: Tag[] = fallbackTags

      try {
        const tagResp = await api.get<Tag[]>('/api/free_tags')
        tagsData = tagResp.data
        setTagOptions(tagsData)
      } catch {
        setTagOptions(fallbackTags)
      }

      try {
        const postResp = await api.get<PostDetailResp>(`/api/free-posts/${id}`)
        const { title, content, tags: postTags } = postResp.data

        setTitle(title)
        setContent(content)

        const matchedTags = tagsData.filter((t) => postTags.includes(t.tagName))
        setTagIds(matchedTags.map((t) => t.id))
      } catch {
        toast.warn(
          '게시글 정보를 서버에서 불러오지 못해 더미 데이터를 사용합니다.'
        )
        setTitle(fallbackPost.title)
        setContent(fallbackPost.content)
        const matchedTags = tagsData.filter((t) =>
          fallbackPost.tags.includes(t.tagName)
        )
        setTagIds(matchedTags.map((t) => t.id))
      } finally {
        setLoading(false)
      }
    }

    fetchTagsAndPost()
  }, [id])

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!id) return
    if (!title.trim() || !content.trim()) {
      toast.warn('제목과 내용을 모두 입력해주세요!')
      return
    }

    try {
      setSaving(true)
      await api.put(`/api/free-posts/${id}`, {
        title: title.trim(),
        content, // 길이 제한 제거. HTML/텍스트 그대로 전송
        tagIds: tagIds,
      })
      toast.success('게시글이 수정되었습니다.')
      navigate(`/free/${id}`)
    } catch (err) {
      console.error('게시글 수정 실패:', err)
      toast.error('게시글 수정에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => navigate(`/free/${id}`)

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container">
        <h1 className="board-title" onClick={() => navigate('/free')}>
          자유 게시판
        </h1>

        <form className="write-form" onSubmit={handleSave}>
          <div className="button-group">
            <button
              type="button"
              className="button-common button-gray"
              onClick={handleCancel}
              disabled={saving}
            >
              취소
            </button>
            <button
              type="submit"
              className="button-common"
              disabled={saving || loading}
            >
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>

          <p className="write-label">글 제목</p>
          <input
            type="text"
            className="write-title-input"
            placeholder="글 제목은 내용을 대표할 수 있도록 간결하게 작성해 주세요."
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
          />

          <div className="tag-buttons">
            {tagOptions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`tag-button ${
                  tagIds.includes(tag.id) ? 'selected' : ''
                }`}
                onClick={() => toggleTag(tag.id)}
                aria-pressed={tagIds.includes(tag.id)}
                disabled={saving}
              >
                #{tag.tagName}
              </button>
            ))}
          </div>

          <p className="write-label">내용</p>
          <textarea
            className="write-textarea"
            placeholder="자유롭게 의견을 남겨주세요."
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
          />
        </form>
      </div>
    </>
  )
}

export default FreePostEdit
