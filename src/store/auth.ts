import { defineStore } from 'pinia'
import { login, logout, sendSmsCode } from '@/services/authService'
import { getCurrentUser } from '@/services/userService'
import type { LoginForm, UserInfo } from '@/types/auth'
import { ElMessage } from 'element-plus'

interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token') || null,
    user: null,
    isAuthenticated: !!localStorage.getItem('token'),
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
  },

  actions: {
    /**
     * [API调用] POST /auth/login
     * 用户登录（手机号+验证码）
     */
    async login(payload: LoginForm) {
      try {
        // [API调用] POST /auth/login - 用户登录
        const { data } = await login(payload)
        
        // 保存 token
        this.token = data.token
        this.isAuthenticated = true
        
        // 保存用户信息（如果后端返回了用户信息）
        // 注意：不保存 userId 等敏感信息，后端通过 token 获取用户信息
        if (data.username) {
          this.user = {
            phone: payload.phone, // 使用登录时的手机号
            nickname: data.nickname || '',
            avatar: data.avatarUrl || undefined,
          }
        }
        
        // 保存token到localStorage
        if (data.token) {
          localStorage.setItem('token', data.token)
        }

        ElMessage.success('登录成功')
        return data
      } catch (error: any) {
        // 处理后端错误响应格式 { success: false, errorMsg: "错误信息" }
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
        // [API调用] POST /auth/logout - 用户登出
        await logout()
      } catch (error) {
        console.error('[Auth Store] 退出登录失败:', error)
        // 即使接口调用失败，也清除本地状态
      } finally {
        // 清除本地状态
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
      }
    },

    /**
     * [API调用] GET /users/me
     * 获取当前用户信息
     */
    async fetchUserInfo() {
      try {
        // [API调用] GET /users/me - 获取当前用户信息
        const { data } = await getCurrentUser()
        this.user = data
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

