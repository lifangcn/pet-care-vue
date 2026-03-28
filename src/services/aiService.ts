import apiClient from './api'
import type {
  HealthCheckForm,
  HealthCheckResult,
  CommonSymptom,
  KnowledgeDocument,
  ChatSession,
  ChatMessage,
  ClearHistoryResponse
} from '@/types/ai'

/**
 * [API调用] GET /ai/symptoms
 * 获取常见症状列表
 * @returns {Promise} 返回常见症状列表数据
 */
export const fetchCommonSymptoms = () => {
  return apiClient.get<CommonSymptom[]>('/ai/symptoms')
}

/**
 * [API调用] POST /ai/health-check
 * 提交AI健康检查
 * @param {HealthCheckForm} payload - 健康检查表单数据
 * @returns {Promise} 返回AI分析结果数据
 */
export const submitHealthCheck = (payload: HealthCheckForm) => {
  return apiClient.post<HealthCheckResult>('/ai/health-check', payload)
}

/**
 * [API调用] GET /ai/health-check/:id
 * 获取健康检查结果详情
 * @param {string} id - 检查结果ID
 * @returns {Promise} 返回健康检查结果数据
 */
export const fetchHealthCheckResult = (id: string) => {
  return apiClient.get<HealthCheckResult>(`/ai/health-check/${id}`)
}

/**
 * 文档管理相关接口
 */

/**
 * [API调用] POST /ai/document/upload
 * 上传文档
 * @param {File} file - 文档文件
 * @returns {Promise} 返回上传后的文档信息
 */
export const uploadDocument = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return apiClient.post<KnowledgeDocument>('/ai/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * [API调用] GET /ai/document/list
 * 查询文档列表
 * @returns {Promise} 返回文档列表数据
 */
export const fetchDocuments = () => {
  return apiClient.get<KnowledgeDocument[]>('/ai/document/list')
}

/**
 * [API调用] GET /ai/document/{id}
 * 查询单个文档
 * @param {number} id - 文档ID
 * @returns {Promise} 返回文档详情数据
 */
export const fetchDocumentById = (id: number) => {
  return apiClient.get<KnowledgeDocument>(`/ai/document/${id}`)
}

/**
 * [API调用] DELETE /ai/document/{id}
 * 删除文档
 * @param {number} id - 文档ID
 * @returns {Promise} 返回删除结果
 */
export const deleteDocument = (id: number) => {
  return apiClient.delete(`/ai/document/${id}`)
}

/**
 * [API调用] GET /ai/document/{id}/preview
 * 获取文档预览地址（MinIO预签名URL）
 * @param {number} id - 文档ID
 * @returns {Promise} 返回预览URL
 */
export const getDocumentPreviewUrl = (id: number) => {
  return apiClient.get<{ url: string }>(`/ai/document/${id}/preview`)
}

/**
 * 同步调试接口
 */

/**
 * [API调用] POST /ai/sync/posts/migrate
 * 同步动态到知识库
 */
export const syncPostsMigrate = () => {
  return apiClient.post('/ai/sync/posts/migrate')
}

/**
 * [API调用] POST /ai/sync/activities/migrate
 * 同步活动到知识库
 */
export const syncActivitiesMigrate = () => {
  return apiClient.post('/ai/sync/activities/migrate')
}

/**
 * RAG对话相关接口
 */

/**
 * [API调用] GET /ai/chat/rag
 * RAG对话（基于知识库）
 * @param {string} message - 用户问题
 * @param {string} sessionId - 会话ID（可选）
 * @param {Function} onMessage - 消息回调函数
 * @param {Function} onError - 错误回调函数
 * @param {Function} onClose - 关闭回调函数
 * @returns {Function} 返回关闭连接的函数
 * @author Michael
 * @date 2026-03-18
 */
export const ragChat = (
  message: string,
  sessionId: string | undefined,
  onMessage: (data: string) => void,
  onError: (error: Error) => void,
  onClose: () => void
): (() => void) => {
  return chatRequest('/ai/chat/rag', message, sessionId, onMessage, onError, onClose)
}

/**
 * [API调用] GET /ai/chat/agent
 * Agent对话（多步推理工具调用）
 * @param {string} message - 用户问题
 * @param {string} sessionId - 会话ID（可选）
 * @param {Function} onMessage - 消息回调函数
 * @param {Function} onError - 错误回调函数
 * @param {Function} onClose - 关闭回调函数
 * @returns {Function} 返回关闭连接的函数
 * @author Michael
 * @date 2026-03-18
 */
export const agentChat = (
  message: string,
  sessionId: string | undefined,
  onMessage: (data: string) => void,
  onError: (error: Error) => void,
  onClose: () => void
): (() => void) => {
  return chatRequest('/ai/chat/agent', message, sessionId, onMessage, onError, onClose)
}

/**
 * @description 聊天请求通用函数（SSE流式响应）
 * @author Michael
 * @date 2026-03-18
 */
const chatRequest = (
  endpoint: string,
  message: string,
  sessionId: string | undefined,
  onMessage: (data: string) => void,
  onError: (error: Error) => void,
  onClose: () => void
): (() => void) => {
  const params = new URLSearchParams({ message })
  if (sessionId !== undefined) {
    params.append('sessionId', sessionId)
  }
  const baseURL = apiClient.defaults.baseURL
  if (!baseURL) {
    onError(new Error('VITE_API_BASE_URL 环境变量未配置，请设置后端API地址'))
    return () => {}
  }
  const url = `${baseURL}${endpoint}?${params.toString()}`
  const token = localStorage.getItem('accessToken')
  
  const controller = new AbortController()
  
  fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/html, text/event-stream, */*',
      'Cache-Control': 'no-cache',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const contentType = response.headers.get('content-type') || ''
      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      
      if (!reader) {
        throw new Error('No reader available')
      }
      
      let buffer = ''
      // 检测是否为 SSE 格式
      const isSSE = contentType.includes('text/event-stream') || contentType.includes('text/eventstream')
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          // 处理剩余的 buffer
          if (buffer.trim()) {
            if (isSSE) {
              // 处理 SSE 格式的剩余数据
              const lines = buffer.split('\n')
              for (const line of lines) {
                const trimmedLine = line.trim()
                if (trimmedLine && trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6).trim()
                  if (data && data !== '[DONE]') {
                    onMessage(data)
                  }
                }
              }
            } else {
              // 非 SSE 格式，但可能包含 "data:" 前缀，需要按 SSE 格式解析
              if (buffer.includes('data:') || buffer.includes('data: ')) {
                const lines = buffer.split('\n')
                for (const line of lines) {
                  const trimmedLine = line.trim()
                  if (trimmedLine) {
                    if (trimmedLine.startsWith('data: ')) {
                      const data = trimmedLine.slice(6).trim()
                      if (data && data !== '[DONE]') {
                        onMessage(data)
                      }
                    } else if (trimmedLine.startsWith('data:')) {
                      const data = trimmedLine.slice(5).trim()
                      if (data && data !== '[DONE]') {
                        onMessage(data)
                      }
                    }
                  }
                }
              } else if (buffer.trim()) {
                onMessage(buffer.trim())
              }
            }
          }
          onClose()
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        if (!chunk) continue
        
        buffer += chunk
        
        if (isSSE) {
          // SSE 格式：按行解析
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue
            
            if (trimmedLine.startsWith('data: ')) {
              // 标准 SSE 格式：data: <content>
              const data = trimmedLine.slice(6).trim()
              if (data === '[DONE]') {
                onClose()
                return
              }
              if (data) {
                onMessage(data)
              }
            } else if (trimmedLine.startsWith('data:')) {
              // 处理没有空格的情况：data:<content>
              const data = trimmedLine.slice(5).trim()
              if (data && data !== '[DONE]') {
                onMessage(data)
              }
            } else if (trimmedLine.startsWith(':')) {
              // 注释行，忽略
              continue
            } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith('id:') || trimmedLine.startsWith('retry:')) {
              // 其他 SSE 字段，忽略
              continue
            }
          }
        } else {
          // 非 SSE 格式，但检查是否包含 "data:" 前缀
          // 如果包含，说明可能是 SSE 格式但 Content-Type 不正确，需要按 SSE 格式解析
          if (buffer.includes('data:') || buffer.includes('data: ')) {
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            
            for (const line of lines) {
              const trimmedLine = line.trim()
              if (!trimmedLine) continue
              
              if (trimmedLine.startsWith('data: ')) {
                const data = trimmedLine.slice(6).trim()
                if (data && data !== '[DONE]') {
                  onMessage(data)
                }
              } else if (trimmedLine.startsWith('data:')) {
                const data = trimmedLine.slice(5).trim()
                if (data && data !== '[DONE]') {
                  onMessage(data)
                }
              } else if (!trimmedLine.startsWith(':') && !trimmedLine.startsWith('event:') && !trimmedLine.startsWith('id:') && !trimmedLine.startsWith('retry:')) {
                // 纯文本内容，直接传递（但这种情况应该很少）
                onMessage(trimmedLine)
              }
            }
          } else {
            // 纯文本，直接传递
            onMessage(chunk)
          }
        }
      }
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error)
      }
    })
  
  return () => {
    controller.abort()
  }
}

/**
 * 会话管理相关接口
 */

/**
 * [API调用] POST /ai/chat/session
 * 创建新会话
 * @author Michael
 * @date 2026-03-02
 */
export const createSession = (name?: string) => {
  return apiClient.post<ChatSession>('/ai/chat/session', name ? { name } : {})
}

/**
 * [API调用] GET /ai/chat/sessions
 * 获取会话列表
 * @author Michael
 * @date 2026-03-02
 */
export const fetchSessions = (pageNumber?: number, pageSize?: number) => {
  return apiClient.get<{ total: number; items: ChatSession[] }>('/ai/chat/sessions', {
    params: { pageNumber, pageSize }
  })
}

/**
 * [API调用] GET /ai/chat/session/{id}/messages
 * 获取会话历史消息
 * @author Michael
 * @date 2026-03-02
 */
export const fetchSessionMessages = (sessionId: string) => {
  return apiClient.get<ChatMessage[]>(`/ai/chat/session/${sessionId}/messages`)
}

/**
 * [API调用] DELETE /ai/chat/session/{id}
 * 删除会话
 * @author Michael
 * @date 2026-03-02
 */
export const deleteSession = (sessionId: string) => {
  return apiClient.delete(`/ai/chat/session/${sessionId}`)
}

/**
 * [API调用] DELETE /ai/chat/history
 * 清除所有历史记录
 * @author Michael
 * @date 2026-03-02
 */
export const clearChatHistory = () => {
  return apiClient.delete<ClearHistoryResponse>('/ai/chat/history')
}
