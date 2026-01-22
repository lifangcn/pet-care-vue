import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { sseService } from './services/sse'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Element Plus 样式（按需导入时仍需要基础样式）
import 'element-plus/dist/index.css'
import './styles/variables.scss'
// 手绘插画风格样式
import './styles/element-override.scss'
import './styles/decorations.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')

const token = localStorage.getItem('accessToken')
if (token) {
  sseService.connect()
}
