export type PostCreateReq = {
  title: string
  content: string
  tagIds: number[]
}

export type PostCreateRes = {
  id: number
  writer: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  imageUrl?: string | null
}
