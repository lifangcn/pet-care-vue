import apiClient from './api'
import type { KnowledgeDocumentResponse } from '@/types/admin'

/**
 * 上传文档（仅支持 Markdown）
 * POST /admin/ai/document/upload
 * @author Michael Li
 * @date 2026-03-28
 */
export const adminUploadDocument = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<KnowledgeDocumentResponse>('/admin/ai/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 查询文档列表
 * GET /admin/ai/document/list
 * @author Michael Li
 * @date 2026-03-28
 */
export const adminFetchDocuments = () => {
  return apiClient.get<KnowledgeDocumentResponse[]>('/admin/ai/document/list')
}

/**
 * 删除文档
 * DELETE /admin/ai/document/{id}
 * @author Michael Li
 * @date 2026-03-28
 */
export const adminDeleteDocument = (id: number) => {
  return apiClient.delete(`/admin/ai/document/${id}`)
}

/**
 * 重新索引文档
 * POST /admin/ai/document/{id}/reindex
 * @author Michael Li
 * @date 2026-03-28
 */
export const adminReindexDocument = (id: number) => {
  return apiClient.post(`/admin/ai/document/${id}/reindex`)
}

/**
 * 全量同步 Post 数据到 ES
 * POST /admin/ai/sync/posts/full
 * @author Michael Li
 * @date 2026-03-28
 */
export const syncPostsFull = () => {
  return apiClient.post('/admin/ai/sync/posts/full')
}

/**
 * 增量同步 Post 数据
 * POST /admin/ai/sync/posts/incremental
 * @author Michael Li
 * @date 2026-03-28
 */
export const syncPostsIncremental = () => {
  return apiClient.post('/admin/ai/sync/posts/incremental')
}

/**
 * 查询索引状态
 * GET /admin/ai/sync/index/status
 * @author Michael Li
 * @date 2026-03-28
 */
export const fetchIndexStatus = () => {
  return apiClient.get('/admin/ai/sync/index/status')
}

/**
 * 重建索引
 * POST /admin/ai/sync/index/rebuild
 * @author Michael Li
 * @date 2026-03-28
 */
export const rebuildIndex = () => {
  return apiClient.post('/admin/ai/sync/index/rebuild')
}
