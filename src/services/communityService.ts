import apiClient from './api'
import type { CommunityPost, CreatePostPayload, PostFilter, PostComment } from '@/types/community'

/**
 * [API调用] GET /community/posts
 * 获取社区动态列表
 * @param {PostFilter} params - 筛选参数（分页等）
 * @returns {Promise} 返回动态列表数据和分页信息
 */
export const fetchPosts = (params?: PostFilter) => {
  // TODO: 后端接口地址 GET /community/posts
  return apiClient.get<{ records: CommunityPost[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>(
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
  // TODO: 后端接口地址 POST /community/posts
  return apiClient.post<CommunityPost>('/community/posts', payload)
}

/**
 * [API调用] POST /community/posts/:id/like
 * 点赞/取消点赞动态
 * @param {string} id - 动态ID
 * @returns {Promise} 返回点赞结果
 */
export const toggleLike = (id: string) => {
  // TODO: 后端接口地址 POST /community/posts/:id/like
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
  // TODO: 后端接口地址 GET /community/posts/:id/comments
  return apiClient.get<{ records: PostComment[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>(`/community/posts/${id}/comments`, { params })
}

/**
 * [API调用] POST /community/posts/:id/comments
 * 发表评论
 * @param {string} id - 动态ID
 * @param {Object} payload - 评论数据
 * @returns {Promise} 返回创建的评论数据
 */
export const createComment = (id: string, payload: { content: string; replyTo?: string }) => {
  // TODO: 后端接口地址 POST /community/posts/:id/comments
  return apiClient.post<PostComment>(`/community/posts/${id}/comments`, payload)
}

export interface Circle {
  id: string
  name: string
  description: string
  cover: string
  memberCount: number
  postCount: number
  joined: boolean
}

export const fetchCircles = (params?: { keyword?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /community/circles
  return apiClient.get<{ records: Circle[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/community/circles', { params })
}

export const joinCircle = (id: string) => {
  // TODO: 后端接口地址 POST /community/circles/:id/join
  return apiClient.post(`/community/circles/${id}/join`)
}

export const leaveCircle = (id: string) => {
  // TODO: 后端接口地址 POST /community/circles/:id/leave
  return apiClient.post(`/community/circles/${id}/leave`)
}

export interface Question {
  id: string
  title: string
  content: string
  images?: string[]
  authorId: string
  authorName: string
  authorAvatar: string
  category: string
  tags: string[]
  viewCount: number
  answerCount: number
  bestAnswerId?: string
  createdAt: string
  answers: Answer[]
}

export interface Answer {
  id: string
  content: string
  images?: string[]
  authorId: string
  authorName: string
  authorAvatar: string
  isExpert: boolean
  isBest: boolean
  likeCount: number
  createdAt: string
}

export const fetchQuestions = (params?: { category?: string; keyword?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /community/questions
  return apiClient.get<{ records: Question[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/community/questions', { params })
}

export const fetchQuestionById = (id: string) => {
  // TODO: 后端接口地址 GET /community/questions/:id
  return apiClient.get<Question>(`/community/questions/${id}`)
}

export const createQuestion = (payload: { title: string; content: string; images?: string[]; category: string; tags?: string[] }) => {
  // TODO: 后端接口地址 POST /community/questions
  return apiClient.post<Question>('/community/questions', payload)
}

export const createAnswer = (questionId: string, payload: { content: string; images?: string[] }) => {
  // TODO: 后端接口地址 POST /community/questions/:id/answers
  return apiClient.post<Answer>(`/community/questions/${questionId}/answers`, payload)
}

export const likeAnswer = (answerId: string) => {
  // TODO: 后端接口地址 POST /community/answers/:id/like
  return apiClient.post(`/community/answers/${answerId}/like`)
}

export const setBestAnswer = (questionId: string, answerId: string) => {
  // TODO: 后端接口地址 PUT /community/questions/:questionId/best-answer/:answerId
  return apiClient.put(`/community/questions/${questionId}/best-answer/${answerId}`)
}

export interface Activity {
  id: string
  title: string
  description: string
  cover: string
  type: 'online' | 'offline'
  startTime: string
  endTime: string
  location?: string
  participantCount: number
  joined: boolean
  status: 'upcoming' | 'ongoing' | 'ended'
}

export interface CheckIn {
  id: string
  type: string
  title: string
  description: string
  icon: string
  currentStreak: number
  totalDays: number
  todayChecked: boolean
}

export const fetchActivities = (params?: { type?: string; status?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /community/activities
  return apiClient.get<{ records: Activity[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/community/activities', { params })
}

export const fetchActivityById = (id: string) => {
  // TODO: 后端接口地址 GET /community/activities/:id
  return apiClient.get<Activity>(`/community/activities/${id}`)
}

export const joinActivity = (id: string) => {
  // TODO: 后端接口地址 POST /community/activities/:id/join
  return apiClient.post(`/community/activities/${id}/join`)
}

export const fetchCheckIns = () => {
  // TODO: 后端接口地址 GET /community/checkins
  return apiClient.get<CheckIn[]>('/community/checkins')
}

export const checkIn = (type: string) => {
  // TODO: 后端接口地址 POST /community/checkins/:type
  return apiClient.post(`/community/checkins/${type}`)
}

