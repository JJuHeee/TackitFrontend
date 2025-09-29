import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './TipPostEdit.css'
import HomeBar from '../../components/HomeBar'
import { toast } from 'react-toastify'
import api from '../../api/api'

const fallbackTags = [
  { id: 1, tagName: '태그1' },
  { id: 2, tagName: '태그2' },
  { id: 3, tagName: '태그3' },
]
const fallbackPost = {
  writer: '',
  title: '본문1 제목',
  content: '내용4',
  tags: ['태그1', '태그3', '태그2'],
  createdAt: '2025-05-13T19:34:53.52603',
}

function TipPostEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagIds, setTagIds] = useState([])
  const [tagOptions, setTagOptions] = useState(fallbackTags)

  const toggleTag = (id) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    const fetchTagsAndPost = async () => {
      let tagsData = fallbackTags

      try {
        const tagResp = await api.get('/api/tip-tags/list')
        tagsData = tagResp.data
        setTagOptions(tagsData)
      } catch (tagError) {
        setTagOptions(fallbackTags)
      }

      try {
        const postResp = await api.get(`/api/tip-posts/${id}`)
        const { title, content, tags: postTags } = postResp.data

        setTitle(title)
        setContent(content)

        const matchedTags = tagsData.filter((tag) =>
          postTags.includes(tag.tagName)
        )
        setTagIds(matchedTags.map((tag) => tag.id))
      } catch (postError) {
        toast.warn(
          '게시글 정보가 서버에서 불러와지지 않아 더미 데이터를 사용합니다.'
        )

        setTitle(fallbackPost.title)
        setContent(fallbackPost.content)

        const matchedTags = tagsData.filter((tag) =>
          fallbackPost.tags.includes(tag.tagName)
        )
        setTagIds(matchedTags.map((tag) => tag.id))
      }
    }

    fetchTagsAndPost()
  }, [id])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.warn('제목과 내용을 모두 입력해주세요!')
      return
    }

    try {
      const payload = { title, content }
      await api.put(`/api/tip-posts/${id}`, payload)
      toast.success('게시글이 수정되었습니다.')
      navigate(`/tip/${id}`)
    } catch (err) {
      toast.error('수정에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    navigate(`/tip/${id}`)
  }

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container">
        <h1 className="board-title" onClick={() => navigate('/tip')}>
          선임자의 Tip 게시판
        </h1>

        <form className="write-form" onSubmit={handleSave}>
          <div className="button-group">
            <button
              type="button"
              className="button-common button-gray"
              onClick={handleCancel}
            >
              취소
            </button>
            <button type="submit" className="button-common">
              저장
            </button>
          </div>

          <p className="write-label">글 제목</p>
          <input
            type="text"
            className="write-title-input"
            placeholder="글 제목은 내용을 대표할 수 있도록 간결하게 작성해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              >
                #{tag.tagName}
              </button>
            ))}
          </div>

          <p className="write-label">내용</p>
          <textarea
            className="write-textarea"
            placeholder="신입사원에게 도움이 될 회사 생활 팁이나 조언을 작성해 주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </form>
      </div>
    </>
  )
}

export default TipPostEdit
