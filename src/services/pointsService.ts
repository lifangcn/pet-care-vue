import apiClient from './api'
import type { PointsRecordQuery, PointsCouponQuery } from '@/types/points'

/**
 * 查询当前用户积分账户
 * GET /points/account
 */
export const fetchPointsAccount = () => {
  return apiClient.get('/points/account')
}

/**
 * 分页查询积分流水记录
 * POST /points/records/page
 * pageNumber/pageSize 走 query params，筛选字段走 body
 */
export const fetchPointsRecords = (params: PointsRecordQuery) => {
  const { pageNumber, pageSize, ...requestBody } = params
  const queryParams: Record<string, number> = {}
  if (pageNumber !== undefined) queryParams.pageNumber = Number(pageNumber)
  if (pageSize !== undefined) queryParams.pageSize = Number(pageSize)

  return apiClient.post('/points/records/page', requestBody, {
    params: queryParams,
  })
}

/**
 * 分页查询用户代金券
 * POST /points/coupons/page
 * pageNumber/pageSize 走 query params，筛选字段走 body
 */
export const fetchPointsCoupons = (params: PointsCouponQuery) => {
  const { pageNumber, pageSize, ...requestBody } = params
  const queryParams: Record<string, number> = {}
  if (pageNumber !== undefined) queryParams.pageNumber = Number(pageNumber)
  if (pageSize !== undefined) queryParams.pageSize = Number(pageSize)

  return apiClient.post('/points/coupons/page', requestBody, {
    params: queryParams,
  })
}

/**
 * 查询可抢劵的券模板列表
 * GET /points/coupon/templates
 */
export const fetchCouponTemplates = () => {
  return apiClient.get('/points/coupon/templates')
}

/**
 * 领取代金券（充值积分到账户）
 * POST /points/coupon/redeem
 */
export const redeemCoupon = (couponId: number) => {
  return apiClient.post('/points/coupon/redeem', null, { params: { couponId } })
}

/**
 * 抢劵（发放未使用券）
 * POST /points/coupon/grab
 */
export const grabCoupon = (templateId: number) => {
  return apiClient.post('/points/coupon/grab', null, { params: { templateId } })
}
