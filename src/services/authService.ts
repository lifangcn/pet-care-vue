import apiClient from './api'
import type { LoginForm, LoginResponse } from '@/types/auth'

/**
 * [API调用] POST /auth/login
 * 用户登录
 * @param {LoginForm} payload - 登录表单数据（手机号、验证码）
 * @returns {Promise} 返回登录响应（token、用户信息）
 */
export const login = (payload: LoginForm) => {
  // TODO: 后端接口地址 /auth/login
  return apiClient.post<LoginResponse>('/auth/login', payload)
}

/**
 * [API调用] POST /auth/code
 * 发送短信验证码
 * @param {string} phone - 手机号（通过 query 参数传递，后端使用 @RequestParam 接收）
 * @returns {Promise} 返回验证码
 */
export const sendSmsCode = (phone: string) => {
  // TODO: 后端接口地址 /auth/code
  return apiClient.post<{ code: string }>('/auth/code', null, {
    params: { phone }
  })
}

/**
 * [API调用] POST /auth/logout
 * 用户登出
 * @returns {Promise} 返回登出结果
 */
export const logout = () => {
  // TODO: 后端接口地址 /auth/logout
  return apiClient.post('/auth/logout')
}

