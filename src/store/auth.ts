import { defineStore } from 'pinia'
import { login, logout, sendSmsCode, refreshToken } from '@/services/authService'
import { getCurrentUser } from '@/services/userService'
import type { LoginForm, UserInfo } from '@/types/auth'
import { ElMessage } from 'element-plus'

const getStoredUser = (): UserInfo | null => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserInfo | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: getStoredUser(),
    isAuthenticated: !!localStorage.getItem('accessToken'),
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.accessToken,
  },

  actions: {
    /**
     * [API调用] POST /auth/login
     * 用户登录（手机号+验证码）
     */
    async login(payload: LoginForm) {
      try {
        const { data } = await login(payload)
        
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        this.isAuthenticated = true

        this.user = {
          phone: payload.phone,
          nickname: data.nickname || data.username || payload.phone,
          avatar: data.avatar || undefined,
        }
        
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('user', JSON.stringify(this.user))

        ElMessage.success('登录成功')
        return data
      } catch (error: any) {
        const errorMsg = error.response?.data?.errorMsg || error.response?.data?.message || '登录失败，请检查手机号和验证码'
        ElMessage.error(errorMsg)
        throw error
      }
    },

    /**
     * [API调用] POST /auth/logout
     * 用户登出
     */
    async logout() {
      try {
        await logout()
      } catch (error) {
        console.error('[Auth Store] 退出登录失败:', error)
      } finally {
        this.accessToken = null
        this.refreshToken = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    },

    async refreshAccessToken() {
      try {
        if (!this.refreshToken) {
          throw new Error('没有refreshToken')
        }
        const { data } = await refreshToken(this.refreshToken)
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        return data.accessToken
      } catch (error) {
        console.error('[Auth Store] 刷新token失败:', error)
        this.logout()
        throw error
      }
    },

    /**
     * [API调用] GET /user/me
     * 获取当前用户信息
     */
    async fetchUserInfo() {
      try {
        // [API调用] GET /user/me - 获取当前用户信息
        const { data } = await getCurrentUser()
        this.user = data
        localStorage.setItem('user', JSON.stringify(data))
        return data
      } catch (error) {
        console.error('[Auth Store] 获取用户信息失败:', error)
        // 如果获取失败，清除认证状态
        this.logout()
        throw error
      }
    },

    /**
     * [API调用] POST /auth/code
     * 发送短信验证码
     */
    async sendCode(phone: string) {
      try {
        // [API调用] POST /auth/code - 发送短信验证码
        await sendSmsCode(phone)
        ElMessage.success('验证码已发送')
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || '发送验证码失败'
        console.error('[Auth Store] 发送验证码失败:', {
          phone,
          message: errorMsg,
          response: error.response?.data,
        })
        ElMessage.error(errorMsg)
        throw error
      }
    },

  },
})

