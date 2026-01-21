import apiClient from './api'
import type { LoginForm, LoginResponse, WechatQRCodeResponse, WechatScanStatus } from '@/types/auth'

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
  // 后端接口地址 /auth/code
  // 返回值: {code: "200", message: "success", data: "901668", timestamp: 1768867169311}
  // 经过拦截器处理后，直接返回验证码字符串
  return apiClient.post<string>('/auth/code', null, {
    params: { phone }
  })
}

/**
 * [API调用] POST /auth/logout
 * 用户登出
 * 根据JWT规范，logout应发送refreshToken给后端以便加入黑名单，防止token被盗用后继续使用
 * @param {string} refreshToken - 刷新令牌（用于后端黑名单机制）
 * @returns {Promise} 返回登出结果
 */
export const logout = (refreshToken?: string) => {
  return apiClient.post('/auth/logout', refreshToken ? { refreshToken } : undefined)
}

/**
 * [API调用] POST /auth/refresh
 * 刷新访问令牌
 * 根据JWT规范，refreshToken通过请求体传递（更安全，不会出现在URL或日志中）
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise} 返回新的accessToken和refreshToken
 */
export const refreshToken = (refreshToken: string) => {
  return apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
}

/**
 * [API调用] POST /auth/wechat/qrcode
 * 获取微信登录二维码
 * @returns {Promise} 返回二维码URL和ticket
 */
export const getWechatQRCode = () => {
  return apiClient.post<WechatQRCodeResponse>('/auth/wechat/qrcode')
}

/**
 * [API调用] GET /auth/wechat/scan-status
 * 检查微信扫码状态
 * @param {string} ticket - 二维码ticket
 * @returns {Promise} 返回扫码状态
 */
export const checkWechatScanStatus = (ticket: string) => {
  return apiClient.get<WechatScanStatus>('/auth/wechat/scan-status', {
    params: { ticket }
  })
}

