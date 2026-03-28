import apiClient from './api'
import type { PointsCouponTemplateRequest, PointsCouponTemplate, CouponIssueRequest } from '@/types/admin'

/**
 * 创建积分券模板
 * POST /admin/points/coupon/template
 * @author Michael Li
 * @date 2026-03-28
 */
export const createCouponTemplate = (payload: PointsCouponTemplateRequest) => {
  return apiClient.post<PointsCouponTemplate>('/admin/points/coupon/template', payload)
}

/**
 * 查询积分券模板列表（分页）
 * GET /admin/points/coupon/templates
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchCouponTemplates = (params: { pageNumber: number; pageSize: number }) => {
  return apiClient.get<{ records: PointsCouponTemplate[]; total: number }>('/admin/points/coupon/templates', { params })
}

/**
 * 编辑积分券模板
 * PUT /admin/points/coupon/template/{id}
 * @author Michael Li
 * @date 2026-03-28
 */
export const updateCouponTemplate = (id: number, payload: PointsCouponTemplateRequest) => {
  return apiClient.put(`/admin/points/coupon/template/${id}`, payload)
}

/**
 * 批量发放积分券
 * POST /admin/points/coupon/template/{id}/issue
 * @author Michael Li
 * @date 2026-03-28
 */
export const issueCoupon = (id: number, payload: CouponIssueRequest) => {
  return apiClient.post(`/admin/points/coupon/template/${id}/issue`, payload)
}

/**
 * 查询积分流水（分页）
 * GET /admin/points/coupon/records
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchAdminPointsRecords = (params: { pageNumber: number; pageSize: number; userId?: number }) => {
  return apiClient.get<{ records: any[]; total: number }>('/admin/points/coupon/records', { params })
}
