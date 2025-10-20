// src/api/notify.ts
import api from './api'
import type { NotificationItem } from '../types/notification'
import type { AxiosRequestConfig } from 'axios' // ← 추가

export async function fetchNotifications(
  config?: AxiosRequestConfig // ← 선택 인자 추가
): Promise<NotificationItem[]> {
  const { data } = await api.get<NotificationItem[]>('/api/notify', config) // ← 전달
  return data
}

export async function markNotificationRead(id: number) {
  await api.post(`/api/notify/${id}/read`)
}

export async function markAllNotificationsRead() {
  await api.post('/api/notify/read-all')
}

export async function deleteNotification(id: number) {
  await api.delete(`/api/notify/${id}`)
}
