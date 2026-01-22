import apiClient from './api'
import type { Activity, CreateActivityPayload, PageResult, Post } from '@/types/club'

/**
 * 社区-活动打卡相关接口
 */

export const createActivity = (payload: CreateActivityPayload) => {
  return apiClient.post<Activity>('/activity', payload)
}

export const fetchActivities = (params?: {
  status?: number
  activityType?: number
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
  
  return apiClient.post<PageResult<Activity>>('/activity/page', requestBody, {
    params: queryParams
  })
}

export const fetchActivityById = (id: string | number) => {
  return apiClient.get<Activity>(`/activity/${id}`)
}

export const joinActivity = (id: string | number) => {
  return apiClient.post(`/activity/${id}/join`)
}

export const fetchParticipants = (id: string | number) => {
  return apiClient.get<any[]>(`/activity/${id}/participants`)
}

export const checkInActivity = (id: string | number, payload?: { content?: string; mediaUrls?: Array<{ url: string; type?: 1 | 2; thumbnail?: string }> }) => {
  return apiClient.post<Post>(`/activity/${id}/checkIn`, payload || {})
}

export const fetchCheckIns = (id: string | number, params?: { pageNumber?: number; pageSize?: number }) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<PageResult<Post>>(`/activity/${id}/checkedIn/page`, requestBody, {
    params: queryParams
  })
}


