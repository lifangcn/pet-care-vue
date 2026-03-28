import apiClient from './api'
import type { AuditStatusOfContent } from '@/types/admin'

/** 帖子列表项（管理后台用） */
export interface AdminPostItem {
  id: number
  title: string
  content: string
  authorName: string
  auditStatus: AuditStatusOfContent
  createdAt: string
}

/** 活动列表项（管理后台用） */
export interface AdminActivityItem {
  id: number
  title: string
  description: string
  authorName: string
  auditStatus: AuditStatusOfContent
  createdAt: string
}

/**
 * 查询帖子列表（带审核状态筛选）
 * GET /admin/post/list
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchAdminPostList = (params: { pageNumber: number; pageSize: number; auditStatus?: AuditStatusOfContent }) => {
  return apiClient.get<{ records: AdminPostItem[]; total: number }>('/admin/post/list', { params })
}

/**
 * 审核帖子
 * PUT /admin/post/{id}/audit
 * @author Michael Li
 * @date 2026-03-28
 */
export const auditPost = (id: number, auditStatus: AuditStatusOfContent) => {
  return apiClient.put(`/admin/post/${id}/audit`, null, { params: { auditStatus } })
}

/**
 * 查询活动列表（带审核状态筛选）
 * GET /admin/activity/list
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchAdminActivityList = (params: { pageNumber: number; pageSize: number; auditStatus?: AuditStatusOfContent }) => {
  return apiClient.get<{ records: AdminActivityItem[]; total: number }>('/admin/activity/list', { params })
}

/**
 * 审核活动
 * PUT /admin/activity/{id}/audit
 * @author Michael Li
 * @date 2026-03-28
 */
export const auditActivity = (id: number, auditStatus: AuditStatusOfContent) => {
  return apiClient.put(`/admin/activity/${id}/audit`, null, { params: { auditStatus } })
}
