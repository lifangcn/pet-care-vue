export interface LoginForm {
  phone: string // 手机号
  code: string // 验证码
}

export interface LoginResponse {
  token: string
  refreshToken?: string | null
  username: string
  nickname?: string | null
  avatarUrl?: string | null
}

export interface UserInfo {
  id?: string | number
  phone: string
  nickname: string
  avatar?: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
}


