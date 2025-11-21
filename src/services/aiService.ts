import apiClient from './api'
import type { HealthCheckForm, HealthCheckResult, CommonSymptom } from '@/types/ai'

/**
 * [API调用] GET /ai/symptoms
 * 获取常见症状列表
 * @returns {Promise} 返回常见症状列表数据
 */
export const fetchCommonSymptoms = () => {
  return apiClient.get<CommonSymptom[]>('/ai/symptoms')
}

/**
 * [API调用] POST /ai/health-check
 * 提交AI健康检查
 * @param {HealthCheckForm} payload - 健康检查表单数据
 * @returns {Promise} 返回AI分析结果数据
 */
export const submitHealthCheck = (payload: HealthCheckForm) => {
  return apiClient.post<HealthCheckResult>('/ai/health-check', payload)
}

/**
 * [API调用] GET /ai/health-check/:id
 * 获取健康检查结果详情
 * @param {string} id - 检查结果ID
 * @returns {Promise} 返回健康检查结果数据
 */
export const fetchHealthCheckResult = (id: string) => {
  return apiClient.get<HealthCheckResult>(`/ai/health-check/${id}`)
}

