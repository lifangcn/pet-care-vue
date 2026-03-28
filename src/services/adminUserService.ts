import apiClient from './api'
import type { AdminUserResponse, AdminUserEnabledUpdateRequest, AdminUserRoleUpdateRequest } from '@/types/admin'

/**
 * 获取当前登录用户的管理员信息
 * GET /admin/user/me
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchAdminCurrentUser = () => {
  return apiClient.get<AdminUserResponse>('/admin/user/me')
}

/**
 * 查询用户列表（分页）
 * GET /admin/user/list
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchAdminUserList = (params: { pageNumber: number; pageSize: number; keyword?: string }) => {
  return apiClient.get<{ records: AdminUserResponse[]; total: number }>('/admin/user/list', { params })
}

/**
 * 启用/禁用用户
 * PUT /admin/user/{id}/enabled
 * @author Michael Li
 * @date 2026-03-28
 */
export const updateUserEnabled = (id: number, payload: AdminUserEnabledUpdateRequest) => {
  return apiClient.put(`/admin/user/${id}/enabled`, payload)
}

/**
 * 设置用户角色
 * PUT /admin/user/{id}/role
 * @author Michael Li
 * @date 2026-03-28
 */
export const updateUserRole = (id: number, payload: AdminUserRoleUpdateRequest) => {
  return apiClient.put(`/admin/user/${id}/role`, payload)
}
