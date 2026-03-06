export interface HealthCheckForm {
  petId: string
  symptoms: string[]
  description: string
}

export interface HealthCheckResult {
  id: string
  petId: string
  petName: string
  symptoms: string[]
  description: string
  possibleCauses: string[]
  suggestions: string[]
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  urgencyMessage: string
  createdAt: string
}

export interface CommonSymptom {
  id: string
  name: string
  category: string
}

export interface KnowledgeDocument {
  id: number
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  version: number
  status: number
  chunkCount: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

/**
 * @description 聊天会话
 * @author Michael
 * @date 2026-03-02
 */
export interface ChatSession {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  messageCount?: number
}

/**
 * @description 清除历史记录响应
 * @author Michael
 * @date 2026-03-02
 */
export interface ClearHistoryResponse {
  success: boolean
  deletedCount: number
}

/**
 * @description Agent 思考步骤（预留，后端就绪后使用）
 * @author Michael
 * @date 2026-03-02
 */
export interface AgentThoughtStep {
  type: 'thought' | 'action' | 'answer'
  content: string
  toolName?: string
  timestamp: string
}

