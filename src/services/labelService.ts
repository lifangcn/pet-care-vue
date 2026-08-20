import apiClient from './api'
import type { Label, PageResult, Post, TypeOfLabel } from '@/types/club'

/**
 * 社区-标签(label)相关接口
 */

export const fetchLabels = (params?: { type?: TypeOfLabel }) => {
  return apiClient.get<Label[]>('/label', { params })
}

export const fetchHotLabels = () => {
  return apiClient.get<Label[]>('/label/hot')
}

export const suggestLabels = (params: { keyword: string }) => {
  return apiClient.get<Label[]>('/label/suggest', { params })
}

export const fetchPostsByLabel = (labelId: string | number, params?: { pageNumber?: number; pageSize?: number }) => {
  const { pageNumber, pageSize, ...requestBody } = params || {}
  const queryParams: any = {}
  
  if (pageNumber !== undefined) {
    queryParams.pageNumber = Number(pageNumber)
  }
  if (pageSize !== undefined) {
    queryParams.pageSize = Number(pageSize)
  }
  
  return apiClient.post<PageResult<Post>>(`/post/by-label/${labelId}/page`, requestBody, {
    params: queryParams
  })
}


