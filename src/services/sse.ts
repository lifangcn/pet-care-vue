/// <reference types="vite/client" />
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

class SSEService {
  private eventSource: EventSource | null = null
  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private isConnecting = false

  private getSSEURL(): string {
    const env = import.meta.env
    if (!env.VITE_API_BASE_URL) {
      throw new Error('VITE_API_BASE_URL 环境变量未配置，请设置后端地址')
    }
    return `${env.VITE_API_BASE_URL}/reminder/sse-connect`
  }

  connect(): void {
    if (this.eventSource?.readyState === EventSource.OPEN || this.isConnecting) {
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      return
    }

    this.isConnecting = true
    const sseUrl = `${this.getSSEURL()}?token=${token}`

    try {
      this.eventSource = new EventSource(sseUrl)

      this.eventSource.onopen = () => {
        this.isConnecting = false
        this.reconnectAttempts = 0
      }

      this.eventSource.addEventListener('reminder', (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage('reminder', data)
        } catch (error) {
          // 消息解析错误，静默处理
        }
      })

      this.eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleMessage('message', data)
        } catch (error) {
          // 消息解析错误，静默处理
        }
      })

      this.eventSource.onerror = () => {
        this.isConnecting = false
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.scheduleReconnect()
        }
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
        this.disconnect()
        this.connect()
      }
    }, this.reconnectDelay)
  }

  private handleMessage(eventType: string, data: any): void {
    this.emit(eventType, data)
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
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

export const sseService = new SSEService()

