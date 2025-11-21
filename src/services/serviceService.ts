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
  return apiClient.get<{ data: BookingRecord[]; total: number; page: number; pageSize: number }>(
    '/services/bookings',
    { params },
  )
}

