export type PetGender = 0 | 1

export interface Pet {
  id: string | number
  user_id?: string | number
  name: string
  type?: string | null
  breed?: string | null
  gender?: PetGender | null
  birthday?: string | null
  weight?: number | null
  avatar?: string | null
  health_notes?: string | null
  created_at?: string
}

export interface CreatePetPayload {
  id?: string | number
  name: string
  type?: string | null
  breed?: string | null
  gender?: PetGender | null
  birthday?: string | null
  weight?: number | null
  avatar?: string | null
  health_notes?: string | null
}

export type HealthRecordType = 'weight' | 'temperature' | 'reminder' | 'medical'
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom'

export interface HealthRecord {
  id: string | number
  pet_id: string | number
  record_type: HealthRecordType
  title?: string | null
  description?: string | null
  record_time: string
  schedule_time?: string | null
  remind_before_minutes?: number | null
  repeat_type?: RepeatType | null
  repeat_config?: any
  value?: number | null
  medication_info?: string | null
  is_completed?: boolean
  completed_time?: string | null
  created_at?: string
}

export interface CreateHealthRecordPayload {
  pet_id: string | number
  record_type: HealthRecordType
  title?: string
  description?: string
  record_time: string
  schedule_time?: string
  remind_before_minutes?: number
  repeat_type?: RepeatType
  repeat_config?: any
  value?: number
  medication_info?: string
}

