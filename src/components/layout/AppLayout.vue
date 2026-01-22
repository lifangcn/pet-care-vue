<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">PetCare</span>
        </div>
      </div>
      <div class="header-right">
        <div class="user-entry">
          <el-avatar :size="32" :src="userAvatar" class="user-avatar" @click="goToProfile">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-hello text-ellipsis">{{ userName }}</span>
          <el-button type="danger" text @click="handleLogout">退出</el-button>
        </div>
      </div>
    </el-header>

    <el-container>
      <el-aside
        v-if="!shouldHideSidebar && !layoutStore.isMobile"
        :width="layoutStore.sidebarWidth"
        class="app-sidebar"
      >
        <el-menu
          :default-active="activeMenu"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <el-menu-item
            v-for="route in menuRoutes"
            :key="route.path"
            :index="route.path"
            class="custom-menu-item"
          >
            <span class="menu-icon">{{ getMenuIcon((route.meta?.menu as { icon?: string } | undefined)?.icon || '') }}</span>
            <template #title>
              {{ (route.meta?.menu as { title?: string } | undefined)?.title || route.meta?.title }}
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main" :class="{ 'full-width': shouldHideSidebar, 'with-bottom-nav': !shouldHideBottomNav && layoutStore.isMobile }">
        <div class="pet-decorations">
          <span class="pet-emoji">🐶</span>
          <span class="pet-emoji">🐱</span>
          <span class="pet-emoji">💕</span>
          <span class="pet-emoji">🐰</span>
        </div>
        <div class="notification-container">
          <ReminderNotification />
        </div>
        <slot />
      </el-main>
    </el-container>

    <el-footer v-if="showFooter" class="app-footer">
      <p>&copy; 2024 宠物关怀系统. All rights reserved.</p>
    </el-footer>

    <!-- 移动端遮罩层 -->
    <nav v-if="!shouldHideBottomNav && layoutStore.isMobile" class="bottom-nav" aria-label="底部导航">
      <button
        v-for="r in menuRoutes"
        :key="r.path"
        type="button"
        class="bottom-nav-item"
        :class="{ active: activeMenu === r.path }"
        @click="router.push(r.path)"
      >
        <span class="nav-icon">{{ getMenuIcon((r.meta?.menu as { icon?: string } | undefined)?.icon || '') }}</span>
        <span class="nav-label text-ellipsis">{{ (r.meta?.menu as { title?: string } | undefined)?.title || r.meta?.title }}</span>
      </button>
    </nav>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, User } from '@element-plus/icons-vue'
import {
  DataBoard,
  Avatar,
  MagicStick,
  Bell,
} from '@element-plus/icons-vue'
import { useLayoutStore } from '@/store/layout'
import { useAuthStore } from '@/store/auth'
import { getUserAvatar } from '@/utils/avatarUtils'
import ReminderNotification from '@/components/ReminderNotification.vue'

interface Props {
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFooter: false,
})

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()

// 获取用户头像
const userAvatar = computed(() => {
  const username = authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(authStore.user?.avatar, username)
})

const userName = computed(() => {
  return authStore.user?.nickname || authStore.user?.phone || '用户'
})

// 图标映射
const iconMap: Record<string, any> = {
  Odometer: DataBoard,
  DataBoard,
  Avatar,
  MagicStick,
  Bell,
}

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Menu
}

const getMenuIcon = (iconName: string) => {
  const iconMap: Record<string, string> = {
    DataBoard: '📊',
    Avatar: '👤',
    Bell: '🔔',
    ChatDotRound: '💬',
    MagicStick: '⭐',
  }
  return iconMap[iconName] || '📋'
}

// 获取菜单路由
const menuRoutes = computed(() => {
  return router.getRoutes().filter((route) => {
    const menu = route.meta?.menu as { hidden?: boolean; order?: number } | undefined
    return menu && !menu.hidden
  }).sort((a, b) => {
    const menuA = a.meta?.menu as { order?: number } | undefined
    const menuB = b.meta?.menu as { order?: number } | undefined
    const orderA = menuA?.order || 999
    const orderB = menuB?.order || 999
    return orderA - orderB
  })
})

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 是否隐藏侧边栏
const shouldHideSidebar = computed(() => {
  return route.meta?.hideSidebar === true
})

// 是否隐藏底部导航
const shouldHideBottomNav = computed(() => {
  return route.meta?.hideBottomNav === true
})

// 检测移动端
const checkMobile = () => {
  const isTouchDevice = window.matchMedia?.('(pointer: coarse)').matches || false
  const isMobile = isTouchDevice && window.innerWidth < 1024
  layoutStore.setMobile(isMobile)
}

const goToProfile = () => {
  router.push('/profile')
}

// 退出登录
const handleLogout = async () => {
  try {
    // 调用退出登录接口
    await authStore.logout()
    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    // 即使接口失败，也清除本地状态并跳转
    router.push('/login')
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;

.app-layout {
  height: 100vh;
  overflow: hidden;
}

.app-layout :deep(> .el-container) {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: vars.$pet-bg-paper;
  box-shadow: 0 2px 8px rgba(255, 138, 76, 0.15), 0 1px 0 rgba(255, 209, 166, 0.3);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 138, 76, 0.3), transparent);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      .logo-text {
        font-family: vars.$font-family-pet;
        font-size: clamp(18px, 4.8vw, 24px);
        font-weight: 700;
        color: pet.$pet-border-color;
        letter-spacing: 2px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.user-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  .user-avatar {
    cursor: pointer;
    flex: 0 0 auto;
  }

  .user-hello {
    max-width: 160px;
    font-size: 14px;
    color: pet.$pet-border-color;
  }
}

.app-sidebar {
  background: vars.$pet-bg-paper;
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
  box-shadow: 2px 0 12px rgba(255, 138, 76, 0.1);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, transparent, rgba(255, 138, 76, 0.25), transparent);
  }

  .sidebar-menu {
    border: none;
    height: 100%;
    overflow-y: auto;
    background: transparent;
    padding: 8px;

    :deep(.el-menu-item) {
      height: auto;
      min-height: 56px;
      line-height: 1.5;
      margin: 6px 0;
      padding: 12px 16px;
      border-radius: 12px;
      background: transparent;
      color: #606266;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;

      .menu-icon {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      }

      &:hover {
        background: rgba(255, 138, 76, 0.08);
        transform: translateX(2px);
      }

      &.is-active {
        background: linear-gradient(135deg, rgba(255, 138, 76, 0.2), rgba(255, 209, 166, 0.15));
        color: #2C3E50;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(255, 138, 76, 0.15);

        .menu-icon {
          transform: scale(1.1);
        }
      }
    }
  }
}

.app-main {
  padding: 20px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Cg fill='none' stroke='%23FF8A4C' stroke-opacity='.12' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M40 64c28-22 58-22 86 0s58 22 86 0 58-22 86 0 58 22 86 0 58-22 86 0 58 22 86 0'/%3E%3Cpath d='M30 168c30-24 62-24 92 0s62 24 92 0 62-24 92 0 62 24 92 0 62-24 92 0 62 24 92 0'/%3E%3Cpath d='M50 280c25-20 52-20 77 0s52 20 77 0 52-20 77 0 52 20 77 0 52-20 77 0'/%3E%3C/g%3E%3Cg fill='%23FF8A4C' fill-opacity='.08'%3E%3Cpath d='M120 120c10-10 26-10 36 0s10 26 0 36-26 10-36 0-10-26 0-36z'/%3E%3Cpath d='M280 150c8-8 20-8 28 0s8 20 0 28-20 8-28 0-8-20 0-28z'/%3E%3Cpath d='M450 200c12-12 30-12 42 0s12 30 0 42-30 12-42 0-12-30 0-42z'/%3E%3Cpath d='M180 300c6-6 16-6 22 0s6 16 0 22-16 6-22 0-6-16 0-22z'/%3E%3C/g%3E%3Cg fill='none' stroke='%23FFD1A6' stroke-opacity='.15' stroke-width='2.5'%3E%3Cpath d='M100 50 Q130 40 160 50 T220 50'/%3E%3Cpath d='M300 80 Q330 70 360 80 T420 80'/%3E%3Cpath d='M200 350 Q230 340 260 350 T320 350'/%3E%3C/g%3E%3Cg fill='%23FFB3BA' fill-opacity='.06'%3E%3Ccircle cx='150' cy='250' r='16'/%3E%3Ccircle cx='400' cy='120' r='12'/%3E%3Ccircle cx='500' cy='300' r='14'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(180deg, rgba(255, 254, 250, 0.85), rgba(255, 251, 247, 0.85));
  background-size: 600px 400px, auto;
  background-repeat: repeat, no-repeat;
  background-attachment: fixed, fixed;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  transition: margin-left 0.3s ease;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(255, 209, 166, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 90% 80%, rgba(191, 217, 242, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(191, 235, 215, 0.08) 0%, transparent 50%);
    z-index: 0;
  }

  .pet-decorations {
    position: fixed;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .pet-emoji {
      position: absolute;
      font-size: 36px;
      opacity: 0.06;
      animation: gentleFloat 15s ease-in-out infinite;

      &:nth-child(1) {
        top: 10%;
        left: 5%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 30%;
        right: 8%;
        animation-delay: 3s;
      }

      &:nth-child(3) {
        bottom: 25%;
        left: 3%;
        animation-delay: 6s;
      }

      &:nth-child(4) {
        bottom: 15%;
        right: 5%;
        animation-delay: 9s;
      }

      &:nth-child(5) {
        top: 50%;
        left: 2%;
        font-size: 28px;
        animation-delay: 12s;
      }
    }
  }

  @keyframes gentleFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(15px, -20px) rotate(5deg); }
    66% { transform: translate(-10px, -15px) rotate(-5deg); }
  }

  &.full-width {
    margin-left: 0;
  }

  &.with-bottom-nav {
    padding-bottom: calc(20px + 68px + env(safe-area-inset-bottom));
  }
}

.notification-container {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 400px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 2000;
  pointer-events: none;

  :deep(.reminder-notification) {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    right: 12px;
    width: calc(100vw - 24px);
    max-width: 400px;
  }
}

.app-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  background: vars.$pet-bg-paper;
  box-shadow: 0 -2px 8px rgba(255, 138, 76, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 138, 76, 0.3), transparent);
  }

  p {
    margin: 0;
    color: #7F8C8D;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .app-main {
    padding: 12px;
  }
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(64px + env(safe-area-inset-bottom));
  padding: 6px 10px calc(6px + env(safe-area-inset-bottom));
  background: vars.$pet-bg-paper;
  box-shadow: 0 -2px 12px rgba(255, 138, 76, 0.15);
  display: flex;
  align-items: stretch;
  gap: 6px;
  overflow-x: auto;
  z-index: 1200;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 138, 76, 0.35), transparent);
  }
}

.bottom-nav-item {
  appearance: none;
  border: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 10px;
  border-radius: pet.$pet-radius-sm;
  color: #5f6b7a;
  min-width: 76px;
  flex: 0 0 auto;
  cursor: pointer;

  .nav-icon {
    font-size: 20px;
    line-height: 1;
  }

  .nav-label {
    font-size: 12px;
    max-width: 88px;
  }

  &.active {
    background: linear-gradient(135deg, rgba(255, 138, 76, 0.2), rgba(255, 209, 166, 0.15));
    color: #2C3E50;
    font-weight: 600;
  }
}

@media (max-width: 1024px) {
  .app-main.with-bottom-nav {
    padding-bottom: calc(12px + 68px + env(safe-area-inset-bottom));
  }
}
</style>

