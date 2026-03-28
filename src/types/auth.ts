export interface LoginForm {
  phone: string // 手机号
  code: string // 验证码
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  username: string
  nickname?: string | null
  avatar?: string | null
}

export interface UserInfo {
  id?: string | number
  username?: string | null
  phone?: string | null
  nickname?: string | null
  avatar?: string | null
  status?: 0 | 1
  address?: string | null
  createdAt?: string
  isAdmin?: boolean
}

export interface WechatQRCodeResponse {
  qrcodeUrl: string
  ticket: string
  expireTime?: number
  expireSeconds?: number
}

export interface WechatScanStatus {
  status: 'WAITING' | 'SCANNED' | 'CONFIRMED' | 'EXPIRED'
  loginData?: LoginResponse
  loginInfo?: {
    accessToken: string
    refreshToken: string
    username: string
    nickname?: string | null
    avatar?: string | null
  }
}


