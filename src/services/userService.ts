import apiClient from './api'
import type { UserInfo } from '@/types/auth'

export const getCurrentUser = () => {
  // TODO: 后端接口地址 GET /user/me
  return apiClient.get<UserInfo>('/user/me')
}

export const updateUserProfile = (payload: { nickname?: string; avatar?: string; address?: string; status?: 0 | 1 }) => {
  // TODO: 后端接口地址 PUT /user/update
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
  type: 'system' | 'order' | 'community'
  title: string
  content: string
  read: boolean
  createdAt: string
  link?: string
}

export const fetchMessages = (params?: { type?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /messages
  return apiClient.get<{ data: Message[]; total: number; page: number; pageSize: number }>('/messages', { params })
}

export const markMessageAsRead = (id: string) => {
  // TODO: 后端接口地址 PUT /messages/:id/read
  return apiClient.put(`/messages/${id}/read`)
}

export const markAllAsRead = () => {
  // TODO: 后端接口地址 PUT /messages/read-all
  return apiClient.put('/messages/read-all')
}

export const deleteMessage = (id: string) => {
  // TODO: 后端接口地址 DELETE /messages/:id
  return apiClient.delete(`/messages/${id}`)
}

export interface Wallet {
  balance: number
  points: number
}

export interface Transaction {
  id: string
  type: 'recharge' | 'consume' | 'refund' | 'points_earn' | 'points_consume'
  amount: number
  description: string
  createdAt: string
}

export const getWallet = () => {
  // TODO: 后端接口地址 GET /wallet
  return apiClient.get<Wallet>('/wallet')
}

export const recharge = (payload: { amount: number; paymentMethod: string }) => {
  // TODO: 后端接口地址 POST /wallet/recharge
  return apiClient.post<Transaction>('/wallet/recharge', payload)
}

export const fetchTransactions = (params?: { type?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /wallet/transactions
  return apiClient.get<{ data: Transaction[]; total: number; page: number; pageSize: number }>('/wallet/transactions', { params })
}

export const fetchPointsHistory = (params?: { page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /wallet/points/history
  return apiClient.get<{ data: Transaction[]; total: number; page: number; pageSize: number }>('/wallet/points/history', { params })
}

