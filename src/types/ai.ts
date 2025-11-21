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

