import api from './api'
import type { NotificationItem } from '../types/notification'
import type { AxiosRequestConfig } from 'axios'

export async function fetchNotifications(
  config?: AxiosRequestConfig
): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationItem[]>('/api/notify', config)
  return data
}
//개별 알림 읽음
export async function markNotificationRead(id: number) {
  await api.patch(`/api/notify/${id}/read`)
}
