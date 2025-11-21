import apiClient from './api'
import type { CommunityPost, CreatePostPayload, PostFilter, PostComment } from '@/types/community'

/**
 * [API调用] GET /community/posts
 * 获取社区动态列表
 * @param {PostFilter} params - 筛选参数（分页等）
 * @returns {Promise} 返回动态列表数据和分页信息
 */
export const fetchPosts = (params?: PostFilter) => {
  return apiClient.get<{ data: CommunityPost[]; total: number; page: number; pageSize: number }>(
    '/community/posts',
    { params },
  )
}

/**
 * [API调用] POST /community/posts
 * 发布新动态
 * @param {CreatePostPayload} payload - 动态创建数据
 * @returns {Promise} 返回创建的动态数据
 */
export const createPost = (payload: CreatePostPayload) => {
  return apiClient.post<CommunityPost>('/community/posts', payload)
}

/**
 * [API调用] POST /community/posts/:id/like
 * 点赞/取消点赞动态
 * @param {string} id - 动态ID
 * @returns {Promise} 返回点赞结果
 */
export const toggleLike = (id: string) => {
  return apiClient.post<{ isLiked: boolean; likes: number }>(`/community/posts/${id}/like`)
}

/**
 * [API调用] GET /community/posts/:id/comments
 * 获取动态评论列表
 * @param {string} id - 动态ID
 * @param {Object} params - 查询参数（分页等）
 * @returns {Promise} 返回评论列表数据
 */
export const fetchPostComments = (id: string, params?: { page?: number; pageSize?: number }) => {
  return apiClient.get<{ data: PostComment[]; total: number }>(`/community/posts/${id}/comments`, { params })
}

/**
 * [API调用] POST /community/posts/:id/comments
 * 发表评论
 * @param {string} id - 动态ID
 * @param {Object} payload - 评论数据
 * @returns {Promise} 返回创建的评论数据
 */
export const createComment = (id: string, payload: { content: string; replyTo?: string }) => {
  return apiClient.post<PostComment>(`/community/posts/${id}/comments`, payload)
}

