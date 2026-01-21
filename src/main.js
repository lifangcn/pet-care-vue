import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { sseService } from './services/sse'

// Element Plus 样式（按需导入时仍需要基础样式）
import 'element-plus/dist/index.css'
import './styles/variables.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
// Element Plus 已通过 unplugin-vue-components 按需导入，无需手动注册

app.mount('#app')

const token = localStorage.getItem('accessToken')
if (token) {
  sseService.connect()
}
