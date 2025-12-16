import axios from 'axios'

const env = import.meta.env
const getBaseURL = () => {
  if (env.VITE_API_BASE_URL) {
    return env.VITE_API_BASE_URL
  }
  return '/api'
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  // 不需要认证的接口列表
  const publicEndpoints = ['/auth/code', '/auth/login']
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint))
  
  // 只有非公开接口才需要添加 token
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  
  const apiVersion = env.VITE_API_VERSION || 'v1'
  config.headers['Accept-Version'] = apiVersion
  
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // 处理后端统一响应格式 {code:"200", data:{}, message:"success", timestamp:1765869973006}
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      if (response.data.code === '200' || response.data.code === 200) {
        return { ...response, data: response.data.data }
      } else {
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
    }
    return response
  },
  (error) => {
    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      // 不需要认证的接口和退出登录接口，401 错误不自动跳转登录页
      const publicEndpoints = ['/auth/code', '/auth/login', '/auth/logout']
      const isPublicEndpoint = publicEndpoints.some(endpoint => error.config?.url?.includes(endpoint))
      
      if (!isPublicEndpoint) {
        console.error('[API Error] 401 未授权错误:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
        })
        // 清除 token，跳转到登录页（使用 router 而不是 window.location 避免刷新）
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        // 注意：这里不自动跳转，由组件自己处理路由跳转
        // 避免在响应拦截器中直接操作 window.location，会导致页面刷新
      }
    }
    // 记录其他服务器错误（500, 502等）
    if (error.response?.status >= 500) {
      console.error('[API Error] 服务器错误:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      })
    }
    return Promise.reject(error)
  },
)

export default apiClient

