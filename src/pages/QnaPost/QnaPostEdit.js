import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './QnaPostEdit.css'
import HomeBar from '../../components/HomeBar'
import api from '../../api/api'
import { toast } from 'react-toastify'

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

function QnaPostEdit() {
  const { postId } = useParams()
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
        const tagResp = await api.get('/api/qna-tags/list')
        tagsData = tagResp.data
        setTagOptions(tagsData)
      } catch (tagError) {
        setTagOptions(fallbackTags)
      }

      try {
        const postResp = await api.get(`/api/qna-post/${postId}`)
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
  }, [postId])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast.warn('제목과 내용을 모두 입력해주세요!')
      return
    }

    try {
      await api.put(`/api/qna-post/${postId}`, {
        title: title.trim(),
        content: content.trim(),
        tagIds: tagIds,
      })

      toast.success('게시글이 수정되었습니다.')
      navigate(`/qna/${postId}`)
    } catch (err) {
      toast.error('게시글 수정에 실패했습니다.')
    }
  }

  const handleCancel = () => {
    navigate(`/qna/${postId}`)
  }

  return (
    <>
      <HomeBar />
      <div className="freepost-write-container">
        <h1 className="board-title" onClick={() => navigate('/qna')}>
          질문 게시판
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
            placeholder="질문에 대한 답변을 작성해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </form>
      </div>
    </>
  )
}

export default QnaPostEdit
