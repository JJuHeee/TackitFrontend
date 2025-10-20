export type NotifyType = 'COMMENT' | 'SCRAP' | 'LIKE' | 'SYSTEM'

export interface NotificationItem {
  id: number
  from: string
  message: string
  relatedUrl: string
  type: NotifyType
  createdAt: string
  read: boolean
}
