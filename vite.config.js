import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
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
})
