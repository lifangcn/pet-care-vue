# AppLayout 布局组件使用说明

## 功能特性

- ✅ 响应式布局（桌面端和移动端自适应）
- ✅ 侧边栏折叠/展开功能
- ✅ Pinia状态管理
- ✅ 根据路由配置动态生成菜单
- ✅ 移动端汉堡菜单
- ✅ 移动端遮罩层

## 使用方法

### 1. 在 App.vue 中使用

```vue
<template>
  <AppLayout v-if="showLayout" :show-footer="true">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()

// 不需要布局的页面（如登录、注册页）
const noLayoutRoutes = ['/login', '/register']
const showLayout = computed(() => !noLayoutRoutes.includes(route.path))
</script>
```

### 2. 路由配置

在路由的 `meta` 中添加 `menu` 配置：

```typescript
{
  path: '/dashboard',
  name: 'dashboard',
  component: () => import('@/views/dashboard/Dashboard.vue'),
  meta: {
    title: '仪表盘 - 宠物关怀系统',
    menu: {
      title: '仪表盘',        // 菜单显示名称
      icon: 'DataBoard',      // 图标名称
      order: 1,               // 排序（数字越小越靠前）
      hidden: false,          // 是否隐藏（可选）
    },
  },
}
```

### 3. Props

- `showFooter?: boolean` - 是否显示底部，默认 `false`

### 4. Store 使用

```typescript
import { useLayoutStore } from '@/store/layout'

const layoutStore = useLayoutStore()

// 切换侧边栏
layoutStore.toggleSidebar()

// 设置侧边栏状态
layoutStore.setSidebarCollapsed(true)

// 获取侧边栏宽度
const width = layoutStore.sidebarWidth

// 检查是否移动端
const isMobile = layoutStore.isMobile
```

## 支持的图标

需要在 `iconMap` 中注册图标，当前支持的图标：
- DataBoard（仪表盘）
- Avatar（宠物）
- ShoppingCart（商城）
- Calendar（服务）
- ChatLineRound（社区）
- MagicStick（AI）

## 响应式断点

- 桌面端：>= 768px（侧边栏正常显示）
- 移动端：< 768px（侧边栏自动隐藏，通过汉堡菜单切换）

