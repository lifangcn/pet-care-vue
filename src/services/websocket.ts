import { ElMessage } from 'element-plus'

export interface ReminderNotification {
  id?: string | number
  reminderId?: string | number
  petId?: string | number
  petName?: string
  title?: string
  description?: string
  scheduleTime?: string
  notificationTime?: string
  type?: 'REMINDER'
}

class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false

  private getWebSocketURL(): string {
    const env = import.meta.env
    const baseURL = env.VITE_API_BASE_URL || window.location.origin
    const wsProtocol = baseURL.startsWith('https') ? 'wss' : 'ws'
    const wsHost = baseURL.replace(/^https?:\/\//, '').replace(/\/api$/, '')
    return `${wsProtocol}://${wsHost}/ws/reminders`
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      return
    }

    this.isConnecting = true
    const wsUrl = `${this.getWebSocketURL()}?token=${token}`

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage(data)
        } catch (error) {
          // 消息解析错误，静默处理
        }
      }

      this.ws.onerror = () => {
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        this.isConnecting = false
        this.ws = null
        this.scheduleReconnect()
      }
    } catch (error) {
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return
    }

    this.reconnectAttempts++
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      const token = localStorage.getItem('accessToken')
      if (token) {
        this.connect()
      }
    }, this.reconnectDelay)
  }

  private handleMessage(data: any): void {
    // 如果没有 type 字段，或者 type 是 REMINDER，都作为提醒处理
    if (!data.type || data.type === 'REMINDER') {
      this.emit('reminder', data)
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

export const wsService = new WebSocketService()

