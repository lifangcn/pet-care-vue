# 宠物关怀系统前端

一个基于 Vue 3 的现代化宠物关怀管理平台，提供宠物管理、商城购物、服务预约、社区互动和 AI 健康检查等功能。

## ✨ 功能特性

### 🔐 用户认证
- **登录页面**：手机号登录，支持记住密码
- **注册页面**：多步骤注册流程（账户信息 → 基本信息 → 宠物信息），包含短信验证码、密码强度检测

### 📊 仪表盘
- 数据概览卡片（宠物数量、待办事项、健康提醒等）
- 快捷操作入口
- 宠物状态卡片展示
- 待办事项时间线

### 🐾 宠物管理
- **宠物列表**：卡片式展示，支持搜索、批量操作、添加/编辑宠物
- **宠物详情**：
  - 基本信息（可编辑）
  - 健康记录（时间线展示，支持添加新记录）
  - 健康图表（使用 ECharts 展示体重、体温趋势）

### 🛒 商城
- **商品列表**：分类筛选、排序、价格区间、品牌筛选，商品卡片悬停效果
- **商品详情**：图片放大预览、规格选择、数量输入、立即购买/加入购物车/收藏，商品详情/参数/用户评价标签页
- **购物车**：使用 Pinia 管理购物车状态

### 📅 服务预约
- 服务分类筛选
- 服务提供商列表（支持列表/地图模式切换）
- 预约表单（服务项目、日期时间、宠物选择、备注）
- 预约确认对话框

### 💬 社区
- 动态发布（文本、图片上传）
- 无限滚动动态列表
- 点赞、评论、分享功能
- 评论展开/收起，加载更多

### 🤖 AI 健康检查
- 四步骤健康检查流程：
  1. 选择宠物
  2. 输入症状（常见症状复选框 + 详细描述）
  3. AI 分析（进度条、加载动画）
  4. 结果报告（可能原因、建议、紧急程度）

## 🛠️ 技术栈

- **框架**：Vue 3.5+ (Composition API)
- **语言**：TypeScript (严格模式)
- **UI 组件库**：Element Plus 2.11+
- **状态管理**：Pinia 2.3+
- **路由**：Vue Router 4.6+
- **HTTP 客户端**：Axios 1.7+
- **图表库**：ECharts 5.5+ / vue-echarts 6.6+
- **样式**：Sass/SCSS (sass-embedded)
- **构建工具**：Vite 7.1+
- **代码规范**：ESLint + Prettier

## 📁 项目结构

```
pet-care-vue/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   ├── components/        # 组件
│   │   ├── layout/        # 布局组件
│   │   │   └── AppLayout.vue          # 响应式布局组件
│   │   └── shared/        # 共享组件
│   │       └── DynamicForm.vue        # 通用表单组件
│   ├── views/             # 页面视图
│   │   ├── auth/          # 认证页面
│   │   │   ├── Login.vue              # 登录页
│   │   │   └── Register.vue           # 注册页
│   │   ├── dashboard/     # 仪表盘
│   │   │   └── Dashboard.vue
│   │   ├── pet/           # 宠物管理
│   │   │   ├── PetList.vue
│   │   │   └── PetDetail.vue
│   │   ├── mall/          # 商城
│   │   │   ├── ProductList.vue
│   │   │   └── ProductDetail.vue
│   │   ├── service/       # 服务预约
│   │   │   └── ServiceBooking.vue
│   │   ├── community/     # 社区
│   │   │   └── CommunityHome.vue
│   │   └── ai/            # AI 健康检查
│   │       └── HealthCheck.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── store/             # Pinia 状态管理
│   │   ├── pet.ts         # 宠物状态
│   │   ├── cart.ts        # 购物车状态
│   │   ├── community.ts   # 社区状态
│   │   └── layout.ts      # 布局状态
│   ├── services/          # API 服务
│   │   ├── api.ts         # Axios 实例配置
│   │   ├── petService.ts
│   │   ├── mallService.ts
│   │   ├── serviceService.ts
│   │   ├── communityService.ts
│   │   └── aiService.ts
│   ├── types/             # TypeScript 类型定义
│   │   ├── pet.ts
│   │   ├── mall.ts
│   │   ├── service.ts
│   │   ├── community.ts
│   │   ├── ai.ts
│   │   └── form.ts
│   ├── utils/            # 工具函数
│   ├── constants/        # 常量
│   ├── styles/           # 全局样式
│   │   └── variables.scss # Sass 变量
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js: `^20.19.0 || >=22.12.0`
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 `http://localhost:5173`（或 Vite 显示的地址）

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🎨 核心组件

### AppLayout - 响应式布局组件

提供统一的页面布局，包括：
- 响应式侧边栏（桌面端可折叠，移动端汉堡菜单）
- 动态菜单生成（基于路由配置）
- 使用 Pinia 管理布局状态

**使用示例：**

```vue
<template>
  <AppLayout>
    <router-view />
  </AppLayout>
</template>
```

### DynamicForm - 通用表单组件

基于 JSON 配置动态生成表单，支持：
- 多种字段类型（input、select、date、number、switch、radio-group、checkbox-group、upload、textarea 等）
- 表单验证规则
- 自定义插槽
- 条件显示字段

**使用示例：**

```vue
<template>
  <DynamicForm
    ref="formRef"
    :config="formConfig"
    v-model="formData"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import DynamicForm from '@/components/shared/DynamicForm.vue'
import type { DynamicFormConfig } from '@/types/form'

const formConfig: DynamicFormConfig = {
  labelWidth: '120px',
  fields: [
    {
      type: 'input',
      label: '姓名',
      prop: 'name',
      placeholder: '请输入姓名',
      rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    },
    // ... 更多字段配置
  ],
}
</script>
```

## 🔌 API 配置

所有 API 调用都通过 `src/services/api.ts` 中的 Axios 实例进行。

**配置说明：**
- 开发/预览环境：使用相对路径 `/api`（通过 Vite 代理）
- 生产环境：使用相对路径 `/api`（通过 Nginx 代理到 `localhost:18080`）
- 可通过环境变量 `VITE_API_BASE_URL` 自定义

**环境变量配置：**

创建 `.env` 或 `.env.production` 文件：

```env
VITE_API_BASE_URL=/api
```

所有服务函数都包含 `[API调用]` 注释，便于后续后端代码生成。详细说明请查看 [API 注释指南](./docs/API_COMMENT_GUIDE.md)。

## 🎨 样式系统

### 颜色变量

在 `src/styles/variables.scss` 中定义了主题颜色：

- **Element Plus 标准色**：primary、success、warning、danger、info
- **宠物关怀系统扩展色**：
  - `$pet-color-orange` (#FF9F43) - 用于宠物相关、温暖
  - `$pet-color-green` (#1DD1A1) - 用于健康、自然
  - `$pet-color-blue` (#54A0FF) - 用于服务、清洁
  - `$pet-color-pink` (#FF6B9C) - 用于社区、活泼

### 字体

- **基础字体**：Helvetica Neue, PingFang SC, Microsoft YaHei 等
- **宠物字体**：Comic Neue（用于 Logo 或宠物名称）

## 📱 响应式设计

- 使用 Element Plus 栅格系统
- 移动端适配（侧边栏自动隐藏，汉堡菜单）
- 媒体查询优化移动端体验

## 🔒 代码规范

- **TypeScript**：严格模式
- **组合式 API**：使用 `<script setup lang="ts">`
- **ESLint + Prettier**：代码格式化和检查
- **命名规范**：组件使用 PascalCase，文件使用 kebab-case

## 📝 路由配置

路由配置在 `src/router/index.js` 中，支持：

- 动态页面标题（通过 `meta.title`）
- 菜单配置（通过 `meta.menu`）：
  - `title`: 菜单显示名称
  - `icon`: Element Plus 图标名称
  - `order`: 排序顺序
  - `hidden`: 是否在菜单中隐藏

## 🧪 开发建议

### IDE 设置

推荐使用 [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（禁用 Vetur）

### 浏览器扩展

- Chrome/Edge: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 📚 文档

详细的技术文档和指南请查看 [docs/](./docs/) 目录：

- **[文档索引](./docs/README.md)** - 所有文档的索引和导航
- **[部署指南](./docs/DEPLOYMENT.md)** - Nginx 部署配置和步骤
- **[部署检查清单](./docs/DEPLOYMENT_CHECKLIST.md)** - 快速部署检查清单
- **[环境变量说明](./docs/ENV_VARIABLES.md)** - 环境变量配置说明
- **[CORS 配置](./docs/CORS_CONFIG.md)** - CORS 问题解决方案
- **[API 注释指南](./docs/API_COMMENT_GUIDE.md)** - API 调用注释规范
- **[性能优化](./docs/PERFORMANCE_OPTIMIZATION.md)** - 性能优化总结

## 📄 许可证

MIT

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**：本项目为前端项目，所有 API 调用都需要后端服务支持。开发时如遇到网络错误，部分模块（如社区）已实现模拟数据回退，便于前端开发和测试。
