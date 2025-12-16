/// <reference types="vite/client" />

/**
 * Vite 环境变量类型定义
 * 
 * import.meta.env 是 Vite 提供的特殊对象，用于访问环境变量
 * 不是导入文件，而是 Vite 在构建时注入的全局对象
 * 
 * 使用方式：
 * - 在 .env 文件中定义环境变量（必须以 VITE_ 开头）
 * - 通过 import.meta.env.VITE_XXX 访问
 * 
 * 示例：
 * .env 文件：
 *   VITE_API_BASE_URL=http://api.example.com
 * 
 * 代码中使用：
 *   const apiUrl = import.meta.env.VITE_API_BASE_URL
 */

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

