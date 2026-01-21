import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log(`构建模式: ${mode}`)
  console.log(`API地址: ${env.VITE_API_BASE_URL || '未配置'}`)
  
  const plugins = [vue()]
  if (mode === 'development') {
    const { default: vueDevTools } = await import('vite-plugin-vue-devtools')
    plugins.push(vueDevTools())
  }
  
  return {
  plugins: [
    ...plugins,
    // Element Plus 按需导入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true, // 生成类型声明文件
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true, // 生成类型声明文件
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 手动配置代码分割，将大型库分离为独立的 chunk
        manualChunks: (id) => {
          // 先检查更具体的包，避免误匹配
          
          // Element Plus 图标库（必须在 element-plus 之前检查）
          if (id.includes('@element-plus/icons-vue')) {
            return 'element-icons'
          }
          
          // Element Plus 及其样式
          if (id.includes('element-plus')) {
            return 'element-plus'
          }
          
          // ECharts 相关（必须在 vue 之前检查，避免匹配 vue-echarts）
          if (id.includes('echarts') || id.includes('vue-echarts')) {
            return 'echarts'
          }
          
          // Vue Router
          if (id.includes('vue-router')) {
            return 'vue-vendor'
          }
          
          // Pinia
          if (id.includes('pinia')) {
            return 'vue-vendor'
          }
          
          // Vue 核心库（必须在其他 vue 相关包之后检查）
          if (id.includes('vue') && id.includes('node_modules') && !id.includes('vue-echarts')) {
            return 'vue'
          }
          
          // Axios
          if (id.includes('axios')) {
            return 'axios'
          }
          
          // 其他 node_modules 中的依赖
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
    // 调整 chunk 大小警告限制（可选，如果仍想看到警告可以保留默认值）
    chunkSizeWarningLimit: 1000,
  },
  }
})
