import apiClient from './api'
import type {
  CreatePetPayload,
  Pet,
  HealthRecord,
  CreateHealthRecordPayload,
  Diary,
  CreateDiaryPayload,
} from '@/types/pet'

/**
 * [API调用] GET /pets/list
 * 获取当前用户的宠物列表（后端通过token获取用户信息）
 * @returns {Promise} 返回宠物列表数据
 */
export const fetchPets = () => {
  // TODO: 后端接口地址 POST /pets/listMyPets
  return apiClient.post<Pet[]>('/pets/listMyPets')
}

/**
 * [API调用] GET /pets/:id
 * 根据ID获取宠物详情
 * @param {string} id - 宠物ID
 * @returns {Promise} 返回宠物详情数据
 */
export const fetchPetById = (id: string) => {
  // TODO: 后端接口地址 GET /pets/:id
  return apiClient.get<Pet>(`/pets/${id}`)
}

/**
 * [API调用] POST /pets/save
 * 保存宠物信息（新增或更新）
 * @param {CreatePetPayload} payload - 宠物数据（包含id则为更新，不包含则为新增）
 * @returns {Promise} 返回保存后的宠物数据
 */
export const savePet = (payload: CreatePetPayload & { id?: string | number }) => {
  // TODO: 后端接口地址 POST /pets/save
  return apiClient.post<Pet>('/pets/save', payload)
}

/**
 * [API调用] POST /pets/remove/{id}
 * 删除宠物
 * @param {string | number} id - 宠物ID
 * @returns {Promise} 返回删除结果
 */
export const removePet = (id: string | number) => {
  // TODO: 后端接口地址 POST /pets/remove/:id
  return apiClient.post(`/pets/remove/${id}`)
}

/**
 * [API调用] GET /pets/:petId/health-records
 * 获取宠物的健康记录列表
 * @param {string} petId - 宠物ID
 * @returns {Promise} 返回健康记录列表数据
 */
export const fetchHealthRecords = (petId: string) => {
  // TODO: 后端接口地址 GET /pets/:petId/health-records
  return apiClient.get<HealthRecord[]>(`/pets/${petId}/health-records`)
}

/**
 * [API调用] POST /health-records
 * 创建健康记录
 * @param {CreateHealthRecordPayload} payload - 健康记录创建数据
 * @returns {Promise} 返回创建的健康记录数据
 */
export const createHealthRecord = (payload: CreateHealthRecordPayload) => {
  // TODO: 后端接口地址 POST /health-records
  return apiClient.post<HealthRecord>('/health-records', payload)
}

/**
 * [API调用] GET /pets/:petId/diaries
 * 获取宠物的成长日记列表
 * @param {string} petId - 宠物ID
 * @returns {Promise} 返回成长日记列表数据
 */
export const fetchDiaries = (petId: string) => {
  // TODO: 后端接口地址 GET /pets/:petId/diaries
  return apiClient.get<Diary[]>(`/pets/${petId}/diaries`)
}

/**
 * [API调用] POST /diaries
 * 创建成长日记
 * @param {CreateDiaryPayload} payload - 成长日记创建数据
 * @returns {Promise} 返回创建的成长日记数据
 */
export const createDiary = (payload: CreateDiaryPayload) => {
  // TODO: 后端接口地址 POST /diaries
  return apiClient.post<Diary>('/diaries', payload)
}

export interface Reminder {
  id: string
  petId: string
  type: 'feeding' | 'vaccine' | 'medication' | 'grooming' | 'exercise' | 'custom'
  title: string
  description?: string
  scheduledTime: string
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly'
  enabled: boolean
  completed: boolean
  completedAt?: string
}

export const fetchReminders = (params?: { petId?: string; type?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /reminders
  return apiClient.get<{ data: Reminder[]; total: number; page: number; pageSize: number }>('/reminders', { params })
}

export const createReminder = (payload: { petId: string; type: string; title: string; description?: string; scheduledTime: string; repeatType: string }) => {
  // TODO: 后端接口地址 POST /reminders
  return apiClient.post<Reminder>('/reminders', payload)
}

export const updateReminder = (id: string, payload: Partial<Reminder>) => {
  // TODO: 后端接口地址 PUT /reminders/:id
  return apiClient.put<Reminder>(`/reminders/${id}`, payload)
}

export const deleteReminder = (id: string) => {
  // TODO: 后端接口地址 DELETE /reminders/:id
  return apiClient.delete(`/reminders/${id}`)
}

export const completeReminder = (id: string) => {
  // TODO: 后端接口地址 PUT /reminders/:id/complete
  return apiClient.put(`/reminders/${id}/complete`)
}

