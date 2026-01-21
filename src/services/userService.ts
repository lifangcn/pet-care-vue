import apiClient from './api'
import type { UserInfo } from '@/types/auth'

export const getCurrentUser = () => {
  // 后端接口地址 GET /user/me
  return apiClient.get<UserInfo>('/user/me')
}

export const updateUserProfile = (payload: { nickname?: string; avatar?: string; address?: string; status?: 0 | 1 }) => {
  // 后端接口地址 PUT /user/update
  return apiClient.put<UserInfo>('/user/update', payload)
}

export const uploadUserAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<{ url?: string; avatar?: string } | string>('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export interface Message {
  id: string
  type: 'system' | 'order' | 'community' | 'reminder'
  title: string
  content: string
  read: boolean
  createdAt: string
  link?: string
  reminderId?: string | number
  petId?: string | number
  petName?: string
}

export const fetchMessages = (params?: { type?: string; page?: number; pageSize?: number }) => {
  // 后端接口地址 GET /messages
  return apiClient.get<{ records: Message[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/reminder/execution/page', { params })
}

export const markMessageAsRead = (id: string) => {
  // 后端接口地址 PUT /reminder/execution/:id/read
  return apiClient.put(`/reminder/execution/${id}/read`)
}

export const markAllAsRead = () => {
  // 后端接口地址 PUT /reminder/execution/read-all
  return apiClient.put('/reminder/execution/read-all')
}

export const deleteMessage = (id: string) => {
  // 后端接口地址 DELETE /messages/:id
  return apiClient.delete(`/messages/${id}`)
}

/**
 * 打卡相关接口
 */

export interface CheckInPayload {
  checkInDate?: string
}

export interface CheckInStats {
  monthCheckInCount: number
  continuousDays: number
  lastCheckInDate: string | null
  checkInDates: string[]
}

/**
 * [API调用] POST /user/checkin
 * 用户签到
 * @param {CheckInPayload} payload - 打卡数据
 * @returns {Promise} 返回结果
 */
export const userCheckIn = (payload?: CheckInPayload) => {
  return apiClient.post('/user/checkIn', payload || {})
}

/**
 * [API调用] GET /user/checkIn/stats
 * 查询签到记录
 * @param {object} params - 查询参数（年、月等）
 * @returns {Promise} 返回签到统计信息
 */
export const fetchCheckInStats = (params?: {
  year?: number
  month?: number
}) => {
  return apiClient.get<CheckInStats>('/user/checkIn/stats', { params })
}

