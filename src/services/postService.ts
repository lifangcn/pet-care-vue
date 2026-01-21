import apiClient from './api'
import type { CreatePostPayload, PageResult, Post, PostRating } from '@/types/club'

/**
 * 俱乐部-动态相关接口
 * 文档：/api/post...
 */

export const createPost = (payload: CreatePostPayload) => {
  return apiClient.post<Post>('/post', payload)
}

export const fetchPosts = (params?: {
  postType?: number
  labelId?: string | number
  city?: string
  sort?: 'latest' | 'hot' | 'rating'
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
  
  if (requestBody.labelId) {
    requestBody.labelId = Number(requestBody.labelId)
  }
  
  return apiClient.post<PageResult<Post>>('/post/page', requestBody, {
    params: queryParams
  })
}

export const fetchPostById = (id: string | number) => {
  return apiClient.get<Post>(`/post/${id}`)
}

export const updatePost = (id: string | number, payload: Partial<CreatePostPayload>) => {
  return apiClient.put<Post>(`/post/${id}`, payload)
}

export const deletePost = (id: string | number) => {
  return apiClient.delete(`/post/${id}`)
}

export const likePost = (id: string | number) => {
  return apiClient.post(`/post/${id}/like`)
}

export const ratePost = (id: string | number, payload: { ratingValue: 1 | 2 | 3 | 4 | 5 }) => {
  return apiClient.post<PostRating>(`/post/${id}/rate`, null, {
    params: { ratingValue: payload.ratingValue }
  })
}

export const fetchPostRatings = (id: string | number) => {
  return apiClient.get<PostRating>(`/post/${id}/ratings`)
}


