export type PetHealthStatus = 'good' | 'warn' | 'bad'

// 宠物类型：1-狗 2-猫 3-其他
export type PetType = 1 | 2 | 3

// 性别：0-未知 1-雄性 2-雌性
export type PetGender = 0 | 1 | 2

export interface Pet {
  id: string | number
  name: string
  type: PetType // 1-狗 2-猫 3-其他
  breed: string
  gender: PetGender // 0-未知 1-雄性 2-雌性
  birthday: string
  weight: number | null
  avatarUrl?: string
  avatar?: string // 兼容旧字段
  isSterilized: boolean // 是否绝育
  neutered?: boolean // 兼容旧字段
  healthNotes?: string // 健康备注
  allergyInfo?: string // 过敏信息
  allergies?: string // 兼容旧字段
  healthStatus?: PetHealthStatus
  age?: string
  lastCheck?: string
  status?: number // 0-删除 1-正常
  createdAt?: string
  updatedAt?: string
}

export interface CreatePetPayload {
  id?: string | number // 有id则为更新，无id则为新增
  name: string
  type: PetType // 1-狗 2-猫 3-其他
  breed: string
  gender: PetGender // 0-未知 1-雄性 2-雌性
  birthday: string
  weight: number | null
  avatarUrl?: string
  avatar?: string // 兼容旧字段
  isSterilized: boolean // 是否绝育
  neutered?: boolean // 兼容旧字段
  healthNotes?: string // 健康备注
  allergyInfo?: string // 过敏信息
  allergies?: string // 兼容旧字段
  healthStatus?: PetHealthStatus
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

