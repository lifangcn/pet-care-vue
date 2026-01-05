export type PetGender = 0 | 1

export interface Pet {
  id: string | number
  userId?: string | number
  name: string
  type?: string | null
  breed?: string | null
  gender?: PetGender | null
  birthday?: string | null
  weight?: number | null
  avatar?: string | null
  healthNotes?: string | null
  createdAt?: string
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
  healthNotes?: string | null
}

export type HealthRecordType = 'WEIGHT' | 'TEMPERATURE' | 'MEDICAL'
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'
export type ReminderSourceType = 'MANUAL' | 'HEALTH_RECORD' | 'SYSTEM'
export type ReminderExecutionStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE'

export interface HealthRecord {
  id: string | number
  petId: string | number
  userId?: string | number
  recordType: HealthRecordType
  title?: string | null
  description?: string | null
  recordTime: string
  value?: number | null
  symptom?: string | null
  medicationInfo?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateHealthRecordPayload {
  petId: string | number
  recordType: HealthRecordType
  title?: string
  description?: string
  recordTime: string
  value?: number
  symptom?: string
  medicationInfo?: string
}

export interface Reminder {
  id: string | number
  petId: string | number
  userId?: string | number
  sourceType: ReminderSourceType
  sourceId: string | number
  title?: string | null
  description?: string | null
  recordTime: string
  scheduleTime?: string | null
  remindBeforeMinutes?: number
  repeatType?: RepeatType
  repeatConfig?: any
  isActive?: boolean
  totalOccurrences?: number
  completedCount?: number
  completedTime?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateReminderPayload {
  petId: string | number
  sourceType: ReminderSourceType
  sourceId?: string | number
  title?: string
  description?: string
  recordTime: string
  scheduleTime?: string
  remindBeforeMinutes?: number
  repeatType?: RepeatType
  repeatConfig?: any
}

export interface ReminderExecution {
  id: string | number
  reminderId: string | number
  petId: string | number
  userId?: string | number
  scheduleTime: string
  actualTime?: string | null
  status: ReminderExecutionStatus
  completionNotes?: string | null
  notificationTime: string
  isRead?: boolean
  isSent?: boolean
  sentAt?: string | null
  readAt?: string | null
  createdAt?: string
}

