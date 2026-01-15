import axios from 'axios'

const env = import.meta.env
const getBaseURL = () => {
  if (!env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL 环境变量未配置，请设置后端API地址')
  }
  return env.VITE_API_BASE_URL
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const publicEndpoints = ['/auth/code', '/auth/login', '/auth/refresh']
  const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint))
  
  if (!isPublicEndpoint) {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }
  
  const apiVersion = env.VITE_API_VERSION || 'v1'
  config.headers['Accept-Version'] = apiVersion
  
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      if (response.data.code === '200' || response.data.code === 200) {
        return { ...response, data: response.data.data }
      } else {
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401) {
      const publicEndpoints = ['/auth/code', '/auth/login', '/auth/logout', '/auth/refresh']
      const isPublicEndpoint = publicEndpoints.some(endpoint => originalRequest?.url?.includes(endpoint))
      
      if (isPublicEndpoint) {
        return Promise.reject(error)
      }

      if (!isRefreshing) {
        isRefreshing = true
        const refreshTokenValue = localStorage.getItem('refreshToken')
        
        if (!refreshTokenValue) {
          isRefreshing = false
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          processQueue(error, null)
          return Promise.reject(error)
        }

        try {
          const response = await apiClient.post('/auth/refresh', { refreshToken: refreshTokenValue })
          const responseData = response.data
          const newAccessToken = responseData?.accessToken
          const newRefreshToken = responseData?.refreshToken
          
          if (newAccessToken && newRefreshToken) {
            localStorage.setItem('accessToken', newAccessToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            processQueue(null, newAccessToken)
            return apiClient(originalRequest)
          } else {
            throw new Error('刷新token失败')
          }
        } catch (refreshError) {
          processQueue(refreshError, null)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }
    }

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

