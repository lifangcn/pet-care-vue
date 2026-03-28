# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

宠物关怀系统（Pet Care Vue）是一个基于 Vue 3 的前端应用，提供宠物管理、健康提醒、社区互动、AI助手等功能。

### 技术栈
- **框架**: Vue 3.5.22 (Composition API)
- **构建工具**: Vite 7.1.11
- **UI组件库**: Element Plus 2.11.8 (按需导入)
- **状态管理**: Pinia 2.3.1
- **路由**: Vue Router 4.6.3 (history模式)
- **HTTP客户端**: Axios 1.7.9 (带JWT自动刷新)
- **样式**: Sass
- **特殊依赖**: ECharts 5.5.1 + Vue-ECharts 6.6.9

## 常用命令

### 开发
```bash
vite                    # 启动开发服务器（默认 http://localhost:5173）
```

### 构建
```bash
npm run build           # 开发环境构建
npm run prod            # 生产环境构建
npm run preview         # 预览构建结果
```

## 核心架构

### SSE 实时通知系统
项目使用 Server-Sent Events (SSE) 实现提醒通知：
- **服务**: `src/services/sse.ts` - 单例 SSE 服务
- **连接端点**: `/reminder/sse-connect?token={accessToken}`
- **事件类型**: `reminder` - 提醒通知
- **自动重连**: 最多5次重试，3秒延迟
- **生命周期**: 登录时自动连接，登出时断开，token刷新时重连

**重要**: Nginx 部署时 SSE 端点需禁用缓冲：
```nginx
location /api/reminder/sse/ {
    proxy_buffering off;
    proxy_cache off;
    add_header X-Accel-Buffering no;
}
```

### JWT 认证流程
- **认证Store**: `src/store/auth.ts`
- **API客户端**: `src/services/api.ts`
- **Token存储**: localStorage (`accessToken`, `refreshToken`)
- **自动刷新**: 401响应时自动使用refreshToken获取新token
- **公开接口**: `/auth/code`, `/auth/login`, `/auth/refresh`, `/auth/wechat`（不需要token）

### API版本管理
- **环境变量**: `VITE_API_BASE_URL` - 后端API地址
- **版本头**: `Accept-Version: v1`（可通过 `VITE_API_VERSION` 覆盖）

### 代码分割策略
`vite.config.js` 中配置的chunk划分：
- `element-icons` - Element Plus图标
- `element-plus` - Element Plus主体
- `echarts` - ECharts + Vue-ECharts
- `vue-vendor` - Vue Router + Pinia
- `vue` - Vue核心库
- `axios` - HTTP客户端
- `vendor` - 其他依赖

### 移动端适配
- **检测逻辑**: 触摸设备 + 屏幕宽度 < 1024px
- **响应式Store**: `src/store/layout.ts` - `isMobile` 状态
- **导航切换**: 桌面端侧边栏 → 移动端底部导航

## 目录结构要点

```
src/
├── components/
│   └── layout/
│       └── AppLayout.vue        # 主布局（侧边栏/底部导航切换）
├── services/
│   ├── api.ts                   # Axios实例 + 拦截器 + 自动刷新
│   ├── sse.ts                   # SSE单例服务
│   ├── authService.ts           # 认证相关API
│   ├── userService.ts           # 用户相关API
│   ├── petService.ts            # 宠物相关API
│   └── ...                      # 其他业务API
├── store/
│   ├── auth.ts                  # 认证状态 + 登录/登出
│   ├── layout.ts                # 布局状态（isMobile, sidebarWidth）
│   ├── pet.ts                   # 宠物状态
│   └── points.ts                # 积分状态
├── styles/
│   ├── variables.scss           # SCSS变量
│   ├── pet-theme.scss           # 主题色/半径等
│   ├── animations.scss          # 动画mixin
│   └── decorations.scss         # 装饰性样式
├── types/                       # TypeScript类型定义
├── utils/
│   ├── avatarUtils.ts           # 头像处理工具
│   └── defaultAvatars.ts        # 默认头像配置
├── router/index.js              # 路由配置（menu meta控制菜单显示）
└── views/                       # 页面组件（按模块分组）
```

## 路由与菜单系统

路由通过 `meta.menu` 控制侧边栏/底部导航显示：
```javascript
meta: {
  title: '页面标题',
  menu: {
    title: '菜单标题',   // 显示的文本
    icon: 'IconName',   // Element Plus图标名
    order: 1,           // 排序
    hidden: true        // 隐藏（不显示在菜单中）
  }
}
```

## 样式约定

- **主题色**: `$pet-primary: #E07A5F`（暖橙色调）
- **边框色**: `$pet-border-color: #E8E0D5`
- **圆角**: `$pet-radius-md: 12px`
- **动画**: 使用 `@include anim.anim-standard` 实现标准过渡
- **单位**: 优先使用 `px`（移动端适配通过媒体查询处理）

## 部署注意事项

1. **生产构建**: 使用 `npm run prod`（而非 `npm run build`）
2. **Nginx配置**: Vue Router history模式需要 `try_files $uri $uri/ /index.html`
3. **SSE支持**: 确保 `/api/reminder/sse/` 和 `/api/ai/chat/` 禁用缓冲
4. **环境变量**: 确保 `VITE_API_BASE_URL` 正确配置后端地址
