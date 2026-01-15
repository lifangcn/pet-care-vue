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

