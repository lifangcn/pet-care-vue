import apiClient from './api'
import type {
  CreatePetPayload,
  Pet,
  HealthRecord,
  CreateHealthRecordPayload,
} from '@/types/pet'

/**
 * 宠物管理相关接口
 */

/**
 * [API调用] GET /pet/list
 * 获取当前用户的宠物列表（后端通过token获取用户信息）
 * @returns {Promise} 返回宠物列表数据
 */
export const fetchPets = () => {
  return apiClient.post<Pet[]>('/pet/list')
}

/**
 * [API调用] GET /pet/:id
 * 根据ID获取宠物详情
 * @param {string} id - 宠物ID
 * @returns {Promise} 返回宠物详情数据
 */
export const fetchPetById = (id: string) => {
  return apiClient.get<Pet>(`/pet/${id}`)
}

/**
 * [API调用] POST /pet/save
 * 保存宠物信息（新增或更新）
 * @param {CreatePetPayload} payload - 宠物数据（包含id则为更新，不包含则为新增）
 * @returns {Promise} 返回保存后的宠物数据
 */
export const savePet = (payload: CreatePetPayload & { id?: string | number }) => {
  return apiClient.post<Pet>('/pet/save', payload)
}

/**
 * [API调用] POST /pet/remove/{id}
 * 删除宠物
 * @param {string | number} id - 宠物ID
 * @returns {Promise} 返回删除结果
 */
export const removePet = (id: string | number) => {
  return apiClient.post(`/pet/remove/${id}`)
}

/**
 * [API调用] POST /pet/{petId}/avatar
 * 上传宠物头像
 * @param {string | number} petId - 宠物ID
 * @param {File} file - 头像文件
 * @returns {Promise} 返回上传后的头像URL
 */
export const uploadPetAvatar = (petId: string | number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<{ url?: string; avatar?: string } | string>(`/pet/${petId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 健康记录相关接口
 */

/**
 * [API调用] GET /healthRecord/:petId
 * 获取宠物的健康记录列表
 * @param {string} petId - 宠物ID
 * @param {object} params - 查询参数
 * @returns {Promise} 返回健康记录列表数据
 */
export const fetchHealthRecords = (petId: string, params?: {
  record_type?: string
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) => {
  return apiClient.get<{ list: HealthRecord[]; total: number; page: number; pageSize: number }>(`/healthRecord/${petId}`, { params })
}

/**
 * [API调用] POST /healthRecord/save
 * 创建健康记录
 * @param {CreateHealthRecordPayload} payload - 健康记录创建数据
 * @returns {Promise} 返回创建的健康记录数据
 */
export const createHealthRecord = (payload: CreateHealthRecordPayload) => {
  return apiClient.post<HealthRecord>('/healthRecord/save', payload)
}

/**
 * [API调用] PUT /healthRecord/update/:id
 * 更新健康记录
 * @param {string | number} id - 健康记录ID
 * @param {CreateHealthRecordPayload} payload - 健康记录更新数据
 * @returns {Promise} 返回更新后的健康记录数据
 */
export const updateHealthRecord = (id: string | number, payload: Partial<CreateHealthRecordPayload>) => {
  return apiClient.put<HealthRecord>(`/healthRecord/update/${id}`, payload)
}

/**
 * [API调用] DELETE /healthRecord/remove/:id
 * 删除健康记录
 * @param {string | number} id - 健康记录ID
 * @returns {Promise} 返回删除结果
 */
export const deleteHealthRecord = (id: string | number) => {
  return apiClient.delete(`/healthRecord/remove/${id}`)
}

/**
 * [API调用] PUT /healthRecord/complete/:id
 * 标记提醒为已完成
 * @param {string | number} id - 健康记录ID
 * @returns {Promise} 返回更新后的健康记录数据
 */
export const completeHealthRecord = (id: string | number) => {
  return apiClient.put<HealthRecord>(`/healthRecord/complete/${id}`)
}

/**
 * 提醒相关接口
 */

/**
 * [API调用] GET /reminder
 * 获取用户待办提醒列表
 * @param {object} params - 查询参数
 * @returns {Promise} 返回提醒列表数据
 */
export const fetchReminder = (params?: {
  petId?: string | number
  status?: 'pending' | 'completed' | 'all'
  page?: number
  pageSize?: number
}) => {
  return apiClient.get<{ list: HealthRecord[]; total: number; page: number; pageSize: number }>('/reminder', { params })
}

/**
 * [API调用] GET /reminder/notifications
 * 获取提醒通知列表
 * @param {object} params - 查询参数
 * @returns {Promise} 返回通知列表数据
 */
export const fetchReminderNotifications = (params?: {
  isRead?: boolean
  page?: number
  pageSize?: number
}) => {
  return apiClient.get<{ list: any[]; total: number; page: number; pageSize: number }>('/reminder/notifications', { params })
}

/**
 * [API调用] PUT /reminder/notifications/:id/read
 * 标记通知为已读
 * @param {string | number} id - 通知ID
 * @returns {Promise} 返回结果
 */
export const markNotificationAsRead = (id: string | number) => {
  return apiClient.put(`/reminder/notifications/${id}/read`)
}

/**
 * [API调用] PUT /reminder/notifications/read-all
 * 批量标记通知为已读
 * @returns {Promise} 返回结果
 */
export const markAllNotificationsAsRead = () => {
  return apiClient.put('/reminder/notifications/read-all')
}
