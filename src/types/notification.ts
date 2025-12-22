/**
 * 알림(Notification) 도메인 모델 타입 정의
 * - 서버에서 내려오는 알림 데이터 구조를 명시
 */

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
