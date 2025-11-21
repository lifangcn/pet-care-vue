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
 * [API调用] GET /pets
 * 获取宠物列表
 * @returns {Promise} 返回宠物列表数据
 */
export const fetchPets = () => {
  return apiClient.get<Pet[]>('/pets')
}

/**
 * [API调用] GET /pets/:id
 * 根据ID获取宠物详情
 * @param {string} id - 宠物ID
 * @returns {Promise} 返回宠物详情数据
 */
export const fetchPetById = (id: string) => {
  return apiClient.get<Pet>(`/pets/${id}`)
}

/**
 * [API调用] POST /pets
 * 创建新宠物
 * @param {CreatePetPayload} payload - 宠物创建数据
 * @returns {Promise} 返回创建的宠物数据
 */
export const createPet = (payload: CreatePetPayload) => {
  return apiClient.post<Pet>('/pets', payload)
}

/**
 * [API调用] PUT /pets/:id
 * 更新宠物信息
 * @param {string} id - 宠物ID
 * @param {Partial<CreatePetPayload>} payload - 要更新的宠物数据
 * @returns {Promise} 返回更新后的宠物数据
 */
export const updatePet = (id: string, payload: Partial<CreatePetPayload>) => {
  return apiClient.put<Pet>(`/pets/${id}`, payload)
}

/**
 * [API调用] DELETE /pets/:id
 * 删除宠物
 * @param {string} id - 宠物ID
 * @returns {Promise} 返回删除结果
 */
export const removePet = (id: string) => {
  return apiClient.delete(`/pets/${id}`)
}

/**
 * [API调用] GET /pets/:petId/health-records
 * 获取宠物的健康记录列表
 * @param {string} petId - 宠物ID
 * @returns {Promise} 返回健康记录列表数据
 */
export const fetchHealthRecords = (petId: string) => {
  return apiClient.get<HealthRecord[]>(`/pets/${petId}/health-records`)
}

/**
 * [API调用] POST /health-records
 * 创建健康记录
 * @param {CreateHealthRecordPayload} payload - 健康记录创建数据
 * @returns {Promise} 返回创建的健康记录数据
 */
export const createHealthRecord = (payload: CreateHealthRecordPayload) => {
  return apiClient.post<HealthRecord>('/health-records', payload)
}

/**
 * [API调用] GET /pets/:petId/diaries
 * 获取宠物的成长日记列表
 * @param {string} petId - 宠物ID
 * @returns {Promise} 返回成长日记列表数据
 */
export const fetchDiaries = (petId: string) => {
  return apiClient.get<Diary[]>(`/pets/${petId}/diaries`)
}

/**
 * [API调用] POST /diaries
 * 创建成长日记
 * @param {CreateDiaryPayload} payload - 成长日记创建数据
 * @returns {Promise} 返回创建的成长日记数据
 */
export const createDiary = (payload: CreateDiaryPayload) => {
  return apiClient.post<Diary>('/diaries', payload)
}

