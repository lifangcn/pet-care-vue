import apiClient from './api'
import type { ServiceProvider, ServiceItem, BookingForm, BookingRecord } from '@/types/service'

/**
 * [API调用] GET /services/providers
 * 获取服务商列表
 * @param {Object} params - 查询参数（分类、位置等）
 * @returns {Promise} 返回服务商列表数据
 */
export const fetchProviders = (params?: { category?: string; latitude?: number; longitude?: number }) => {
  return apiClient.get<ServiceProvider[]>('/services/providers', { params })
}

/**
 * [API调用] GET /services/providers/:id
 * 根据ID获取服务商详情
 * @param {string} id - 服务商ID
 * @returns {Promise} 返回服务商详情数据
 */
export const fetchProviderById = (id: string) => {
  return apiClient.get<ServiceProvider>(`/services/providers/${id}`)
}

/**
 * [API调用] GET /services/items
 * 获取服务项目列表
 * @param {Object} params - 查询参数（分类等）
 * @returns {Promise} 返回服务项目列表数据
 */
export const fetchServiceItems = (params?: { category?: string }) => {
  return apiClient.get<ServiceItem[]>('/services/items', { params })
}

/**
 * [API调用] POST /services/bookings
 * 创建服务预约
 * @param {BookingForm} payload - 预约表单数据
 * @returns {Promise} 返回创建的预约记录数据
 */
export const createBooking = (payload: BookingForm) => {
  return apiClient.post<BookingRecord>('/services/bookings', payload)
}

/**
 * [API调用] GET /services/bookings
 * 获取预约记录列表
 * @param {Object} params - 查询参数
 * @returns {Promise} 返回预约记录列表数据
 */
export const fetchBookings = (params?: { status?: string; page?: number; pageSize?: number }) => {
  const { page, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (page !== undefined) {
    queryParams.pageNumber = Number(page)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<{ records: BookingRecord[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>(
    '/services/bookings/page',
    requestBody,
    { params: queryParams }
  )
}

export interface Consultation {
  id: string
  type: 'text' | 'video'
  expertId: string
  expertName: string
  expertAvatar: string
  petId: string
  petName: string
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED'
  messages: ConsultationMessage[]
  createdAt: string
  completedAt?: string
}

export interface ConsultationMessage {
  id: string
  senderId: string
  senderType: 'user' | 'expert'
  content: string
  images?: string[]
  createdAt: string
}

export const createConsultation = (payload: { expertId: string; petId: string; type: 'text' | 'video'; initialMessage?: string }) => {
  // 后端接口地址 POST /consultations
  return apiClient.post<Consultation>('/consultations', payload)
}

export const fetchConsultations = (params?: { status?: string; page?: number; pageSize?: number }) => {
  const { page, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (page !== undefined) {
    queryParams.pageNumber = Number(page)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<{ records: Consultation[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/consultations/page', requestBody, {
    params: queryParams
  })
}

export const fetchConsultationById = (id: string) => {
  // 后端接口地址 GET /consultations/:id
  return apiClient.get<Consultation>(`/consultations/${id}`)
}

export const sendMessage = (consultationId: string, payload: { content: string; images?: string[] }) => {
  // 后端接口地址 POST /consultations/:id/messages
  return apiClient.post<ConsultationMessage>(`/consultations/${consultationId}/messages`, payload)
}

export const endConsultation = (id: string) => {
  // 后端接口地址 PUT /consultations/:id/end
  return apiClient.put(`/consultations/${id}/end`)
}

export interface Expert {
  id: string
  name: string
  avatar: string
  title: string
  specialties: string[]
  description: string
  rating: number
  consultationCount: number
  price: number
  available: boolean
}

export const fetchExperts = (params?: { category?: string; keyword?: string; page?: number; pageSize?: number }) => {
  const { page, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (page !== undefined) {
    queryParams.pageNumber = Number(page)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<{ records: Expert[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/experts/page', requestBody, {
    params: queryParams
  })
}

export const fetchExpertById = (id: string) => {
  // 后端接口地址 GET /experts/:id
  return apiClient.get<Expert>(`/experts/${id}`)
}

