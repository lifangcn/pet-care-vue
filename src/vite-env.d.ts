/// <reference types="vite/client" />



interface ImportMetaEnv {
  /**
   * API 基础 URL
   * 在 .env 或 .env.production 文件中设置
   * 示例：VITE_API_BASE_URL=http://api.example.com/api
   */
  readonly VITE_API_BASE_URL?: string

  /**
   * 应用基础路径
   * Vite 自动注入
   */
  readonly BASE_URL: string

  /**
   * 运行模式
   * 'development' | 'production'
   */
  readonly MODE: string

  /**
   * 是否为开发模式
   */
  readonly DEV: boolean

  /**
   * 是否为生产模式
   */
  readonly PROD: boolean

  /**
   * 是否为 SSR 模式
   */
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

