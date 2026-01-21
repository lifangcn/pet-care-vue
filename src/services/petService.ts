import apiClient from './api'
import type {
  CreatePetPayload,
  Pet,
  HealthRecord,
  CreateHealthRecordPayload,
  Reminder,
  CreateReminderPayload,
  ReminderExecution,
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
 * [API调用] GET /pet/info
 * 根据ID获取宠物详情
 * @param {string} id - 宠物ID
 * @returns {Promise} 返回宠物详情数据
 */
export const fetchPetById = (id: string) => {
  return apiClient.get<Pet>(`/pet/info/${id}`)
}

/**
 * [API调用] POST /pet/save
 * 保存宠物信息（新增或更新）
 * @param {CreatePetPayload} payload - 宠物数据（包含id则为更新，不包含则为新增）
 * @returns {Promise} 返回保存后的宠物数据
 */
export const savePet = (payload: CreatePetPayload & { id?: string | number }) => {
  const requestPayload = {
    ...payload,
    id: payload.id ? Number(payload.id) : undefined,
  }
  return apiClient.post<Pet>('/pet/save', requestPayload)
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
 * [API调用] POST /pet/{petId}/health-record/page
 * 获取宠物的健康记录列表
 * @param {string | number} petId - 宠物ID
 * @param {object} params - 查询参数（分页参数通过URL传递，其他参数通过请求体传递）
 * @returns {Promise} 返回健康记录列表数据
 */
export const fetchHealthRecords = (petId: string | number, params?: {
  recordType?: string
  pageNumber?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<{ records: HealthRecord[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>(`/pet/${petId}/health-record/page`, requestBody, {
    params: queryParams
  })
}

/**
 * [API调用] POST /pet/{petId}/health-record
 * 创建健康记录
 * @param {string | number} petId - 宠物ID
 * @param {CreateHealthRecordPayload} payload - 健康记录创建数据
 * @returns {Promise} 返回创建的健康记录数据
 */
export const createHealthRecord = (petId: string | number, payload: CreateHealthRecordPayload) => {
  const requestPayload = {
    ...payload,
    petId: Number(payload.petId),
  }
  return apiClient.post<HealthRecord>(`/pet/${petId}/health-record`, requestPayload)
}

/**
 * [API调用] PUT /pet/{petId}/health-record/{id}
 * 更新健康记录
 * @param {string | number} petId - 宠物ID
 * @param {string | number} id - 健康记录ID
 * @param {Partial<CreateHealthRecordPayload>} payload - 健康记录更新数据
 * @returns {Promise} 返回更新后的健康记录数据
 */
export const updateHealthRecord = (petId: string | number, id: string | number, payload: Partial<CreateHealthRecordPayload>) => {
  const requestPayload: any = { ...payload }
  if (requestPayload.petId) {
    requestPayload.petId = Number(requestPayload.petId)
  }
  return apiClient.put<HealthRecord>(`/pet/${petId}/health-record/${id}`, requestPayload)
}

/**
 * [API调用] DELETE /pet/{petId}/health-record/{id}
 * 删除健康记录
 * @param {string | number} petId - 宠物ID
 * @param {string | number} id - 健康记录ID
 * @returns {Promise} 返回删除结果
 */
export const deleteHealthRecord = (petId: string | number, id: string | number) => {
  return apiClient.delete(`/pet/${petId}/health-record/${id}`)
}

/**
 * 提醒相关接口
 */

/**
 * [API调用] POST /reminder/page
 * 获取提醒列表
 * @param {object} params - 查询参数（分页参数通过URL传递，其他参数通过请求体传递）
 * @returns {Promise} 返回提醒列表数据
 */
export const fetchReminders = (params?: {
  petId?: string | number
  sourceType?: string
  startTime?: string
  endTime?: string
  pageNumber?: number
  pageSize?: number
}) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  if (requestBody.petId) {
    requestBody.petId = Number(requestBody.petId)
  }
  
  return apiClient.post<{ records: Reminder[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/reminder/page', requestBody, {
    params: queryParams
  })
}

/**
 * [API调用] POST /reminder
 * 创建提醒
 * @param {CreateReminderPayload} payload - 提醒创建数据
 * @returns {Promise} 返回创建的提醒数据
 */
export const createReminder = (payload: CreateReminderPayload) => {
  const requestPayload = {
    ...payload,
    petId: Number(payload.petId),
    sourceId: payload.sourceId ? Number(payload.sourceId) : undefined,
  }
  return apiClient.post<Reminder>('/reminder', requestPayload)
}

/**
 * [API调用] PUT /reminder/{id}
 * 更新提醒
 * @param {string | number} id - 提醒ID
 * @param {Partial<CreateReminderPayload>} payload - 提醒更新数据
 * @returns {Promise} 返回更新后的提醒数据
 */
export const updateReminder = (id: string | number, payload: Partial<CreateReminderPayload>) => {
  const requestPayload: any = { ...payload }
  requestPayload.id = Number(id)
  if (requestPayload.petId) {
    requestPayload.petId = Number(requestPayload.petId)
  }
  if (requestPayload.sourceId) {
    requestPayload.sourceId = Number(requestPayload.sourceId)
  }
  return apiClient.put<Reminder>(`/reminder/${id}`, requestPayload)
}

/**
 * [API调用] DELETE /reminder/{id}
 * 删除提醒
 * @param {string | number} id - 提醒ID
 * @returns {Promise} 返回删除结果
 */
export const deleteReminder = (id: string | number) => {
  return apiClient.delete(`/reminder/${id}`)
}

/**
 * [API调用] PUT /reminder/{id}/activate
 * 激活提醒
 * @param {string | number} id - 提醒ID
 * @returns {Promise} 返回更新后的提醒数据
 */
export const activateReminder = (id: string | number) => {
  return apiClient.put<Reminder>(`/reminder/${id}/activate`)
}

/**
 * [API调用] PUT /reminder/{id}/deactivate
 * 停用提醒
 * @param {string | number} id - 提醒ID
 * @returns {Promise} 返回更新后的提醒数据
 */
export const deactivateReminder = (id: string | number) => {
  return apiClient.put<Reminder>(`/reminder/${id}/deactivate`)
}

/**
 * [API调用] POST /reminder/execution/page
 * 获取提醒执行记录列表
 * @param {object} params - 查询参数（分页参数通过URL传递，其他参数通过请求体传递）
 * @returns {Promise} 返回执行记录列表数据
 */
export const fetchReminderExecutions = (params?: {
  petId?: string | number
  status?: 'PENDING' | 'COMPLETED' | 'OVERDUE'
  startTime?: string
  endTime?: string
  pageNumber?: number
  pageSize?: number
}) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  if (requestBody.petId) {
    requestBody.petId = Number(requestBody.petId)
  }
  
  return apiClient.post<{ records: ReminderExecution[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/reminder/execution/page', requestBody, {
    params: queryParams
  })
}

/**
 * [API调用] PUT /reminder/execution/{id}/complete
 * 完成提醒执行记录
 * @param {string | number} id - 执行记录ID
 * @param {object} payload - 完成数据
 * @returns {Promise} 返回更新后的执行记录数据
 */
export const completeReminderExecution = (id: string | number, payload?: { completionNotes?: string }) => {
  return apiClient.put<ReminderExecution>(`/reminder/execution/${id}/complete`, payload)
}

/**
 * [API调用] PUT /reminder/execution/{id}/read
 * 标记提醒执行记录为已读
 * @param {string | number} id - 执行记录ID
 * @returns {Promise} 返回结果
 */
export const markExecutionAsRead = (id: string | number) => {
  return apiClient.put(`/reminder/execution/${id}/read`)
}

/**
 * [API调用] POST /reminder/notifications/page
 * 获取提醒通知列表
 * @param {object} params - 查询参数（分页参数通过URL传递，其他参数通过请求体传递）
 * @returns {Promise} 返回通知列表数据
 */
export const fetchReminderNotifications = (params?: {
  isRead?: boolean
  pageNumber?: number
  pageSize?: number
}) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<{ records: ReminderExecution[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/reminder/notifications/page', requestBody, {
    params: queryParams
  })
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

