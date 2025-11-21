export type PetHealthStatus = 'good' | 'warn' | 'bad'

export interface Pet {
  id: string
  name: string
  breed: string
  gender: 'male' | 'female'
  birthday: string
  weight: number
  neutered: boolean
  avatar: string
  healthStatus: PetHealthStatus
  age: string
  lastCheck: string
  allergies?: string
  vaccineRecord?: string
}

export interface CreatePetPayload {
  name: string
  breed: string
  gender: 'male' | 'female'
  birthday: string
  weight: number | null
  neutered: boolean
  avatar: string
  healthStatus: PetHealthStatus
  allergies?: string
  vaccineRecord?: string
}

export interface HealthRecord {
  id: string
  petId: string
  date: string
  weight?: number
  temperature?: number
  symptoms?: string
  notes?: string
  createdAt: string
}

export interface CreateHealthRecordPayload {
  petId: string
  date: string
  weight?: number
  temperature?: number
  symptoms?: string
  notes?: string
}

export interface Diary {
  id: string
  petId: string
  title: string
  content: string
  images: string[]
  date: string
  createdAt: string
}

export interface CreateDiaryPayload {
  petId: string
  title: string
  content: string
  images: string[]
  date: string
}

