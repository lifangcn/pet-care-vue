# AGENTS.md
# 宠物关怀系统 (Pet Care Vue) - 智能开发代理规则
# 本文件供 AI 编码代理使用，包含项目规范、命令、编码约定

---

## 🚀 基础命令
### 开发命令
```bash
vite                    # 启动开发服务器，默认端口 http://localhost:5173
npm run dev             # 同上，开发模式启动
```

### 构建命令
```bash
npm run build           # 开发环境构建（不压缩，保留调试信息）
npm run prod            # 生产环境构建（压缩、优化，用于部署）
npm run preview         # 预览构建结果
```

### 验证命令
本项目当前无内置 lint/typecheck/test 命令，提交代码前请确保：
1. 无语法错误，页面可正常访问
2. 功能符合需求描述
3. 遵循现有代码风格

---

## 🎯 技术栈与核心规则
### 核心依赖版本
- Vue 3.5.22 (Composition API 优先)
- Vite 7.1.11
- Element Plus 2.11.8 (按需自动导入)
- Pinia 2.3.1 (状态管理)
- Vue Router 4.6.3 (路由)
- Axios 1.7.9 (HTTP 客户端)
- Sass (样式预处理器)
- ECharts 5.5.1 + Vue-ECharts 6.6.9 (图表)

### 环境要求
- Node.js: ^20.19.0 || >=22.12.0
- 包管理: npm (优先使用项目锁文件)

---

## 📝 代码风格指南
### 1. 导入规范
```javascript
// 导入顺序：外部库 → 内部模块 → 样式
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '@/store/auth'
import { getPetList } from '@/services/petService'
import AppLayout from '@/components/layout/AppLayout.vue'

import '@/styles/variables.scss'
```
- 使用 `@` 别名指向 `src/` 目录，禁止使用相对路径超过 2 层
- 外部库导入在前，内部模块在后，按依赖层级排序
- Element Plus 组件自动导入，无需手动 import

### 2. 命名规范
- **文件命名**: 小写短横线分隔，如 `pet-list.vue`, `authService.ts`
- **组件命名**: PascalCase，如 `PetCard.vue`, `AppHeader.vue`，组件名与文件名保持一致
- **变量/函数**: 小驼峰命名，如 `petList`, `getUserInfo()`
- **常量**: 全大写下划线分隔，如 `MAX_PET_COUNT = 10`
- **Store**: useXxxStore 命名，如 `useAuthStore`, `useLayoutStore`
- **API 服务**: xxxService 命名，如 `petService.ts`, `userService.ts`

### 3. Vue 组件规范
- 优先使用 `<script setup>` 语法，Composition API
- 响应式变量使用 `ref`/`reactive`，避免过度使用 `any` 类型
- Props 必须定义类型和默认值（可选）
```vue
<script setup>
const props = defineProps({
  pet: {
    type: Object,
    required: true,
    default: () => ({})
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['delete', 'edit'])
</script>
```
- 模板中使用短横线组件名：`<pet-card :pet="pet" />` 而非 `<PetCard />`

### 4. 样式规范
- 优先使用 Scoped 样式 `<style scoped>`
- 复用项目 SCSS 变量：
  - 主题色: `$pet-primary: #E07A5F`
  - 边框色: `$pet-border-color: #E8E0D5`
  - 圆角: `$pet-radius-md: 12px`
- 单位优先使用 `px`，移动端适配通过媒体查询处理
- 动画使用 `@include anim.anim-standard` 实现标准过渡

### 5. 类型与注释
- 复杂类型定义在 `src/types/` 目录下，统一导出
- 函数必须注明参数和返回值类型
- 核心业务逻辑需添加注释说明用途，避免冗余注释
- 禁止使用 `// @ts-ignore` 除非特殊情况并注明原因

### 6. 错误处理
- API 请求必须捕获错误，使用 `ElMessage` 提示用户
```javascript
try {
  const res = await getPetList()
  petList.value = res.data
} catch (err) {
  ElMessage.error('获取宠物列表失败：' + err.message)
  console.error('getPetList error:', err)
}
```
- 路由守卫中未授权用户重定向到登录页
- 异步操作必须处理 loading 状态，避免界面无响应

### 7. 状态管理规范
- 全局状态使用 Pinia Store 管理，组件内部状态使用 `ref`/`reactive`
- Store 中必须定义 `state`/`getters`/`actions` 三层结构
- 异步逻辑放在 actions 中，禁止在组件中直接修改 state
- 登录状态、布局状态、用户信息等全局状态必须通过 Store 访问

---

## 🗂️ 项目结构约定
```
src/
├── components/  # 公共组件，按功能分组
├── services/    # API 服务层，每个模块对应一个 service 文件
├── store/       # Pinia 状态管理
├── styles/      # 全局样式、变量、主题
├── types/       # TypeScript 类型定义
├── utils/       # 工具函数
├── router/      # 路由配置
└── views/       # 页面组件，按业务模块分组
```
- 新增功能优先遵循现有结构，不要随意创建新的顶层目录
- 公共组件放在 `src/components/`，页面级私有组件放在对应页面目录下的 `components/` 文件夹

---

## 🔑 核心业务规范
### 1. 路由与菜单
- 路由 `meta.menu` 配置控制菜单显示：
```javascript
meta: {
  title: '页面标题',
  menu: {
    title: '菜单标题',
    icon: 'IconName', // Element Plus 图标名
    order: 1, // 排序
    hidden: true // 隐藏不显示在菜单
  }
}
```
- 移动端自动切换到底部导航，桌面端使用侧边栏

### 2. 认证与 SSE
- Token 存储在 localStorage，API 请求自动携带
- 401 响应自动刷新 Token，刷新失败跳转到登录页
- SSE 服务登录时自动连接，登出时断开，无需手动管理

### 3. API 规范
- 基础 URL 通过环境变量 `VITE_API_BASE_URL` 配置
- API 版本头自动携带 `Accept-Version: v1`
- 公开接口：`/auth/*` 无需 Token，其他接口必须携带

---

## ⚠️ 注意事项
1. 生产部署必须使用 `npm run prod` 命令，禁止使用 `npm run build`
2. Nginx 部署时 SSE 端点需禁用缓冲：
```nginx
location /api/reminder/sse/ {
    proxy_buffering off;
    proxy_cache off;
    add_header X-Accel-Buffering no;
}
```
3. 不要修改 `vite.config.js` 中的代码分割配置，除非明确需求
4. 保留现有代码风格，不要随意格式化整个文件
5. 提交代码前确保功能测试通过，无 console 调试信息（除错误日志）