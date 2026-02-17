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
          <el-avatar :size="36" :src="userAvatar" class="user-avatar" @click="goToProfile">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-hello text-ellipsis">{{ userName }}</span>
          <el-button text class="logout-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
    </el-header>

    <el-container>
      <el-aside
        v-if="!shouldHideSidebar && !layoutStore.isMobile"
        :width="layoutStore.sidebarWidth"
        class="app-sidebar"
      >
        <nav class="sidebar-nav" aria-label="侧边导航">
          <router-link
            v-for="route in menuRoutes"
            :key="route.path"
            :to="route.path"
            class="nav-item"
            :class="{ active: activeMenu === route.path }"
          >
            <div class="nav-icon-wrap" :class="[`icon-${getNavIconType(route.path)}`, { 'is-active': activeMenu === route.path }]">
              <!-- 首页 -->
              <svg v-if="getNavIconType(route.path) === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h4a1 1 0 011 1v5h3a1 1 0 001-1v-9"/></svg>
              <!-- 毛孩子 -->
              <svg v-else-if="getNavIconType(route.path) === 'paw'" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="8.5" cy="6.2" rx="2.1" ry="2.5"/><ellipse cx="15.5" cy="6.2" rx="2.1" ry="2.5"/><ellipse cx="4.8" cy="11.5" rx="1.9" ry="2.3"/><ellipse cx="19.2" cy="11.5" rx="1.9" ry="2.3"/><path d="M7.2 16c0-2.7 2.2-4.8 4.8-4.8s4.8 2.1 4.8 4.8c0 1.9-1.3 3.3-2.8 3.3-.8 0-1.3-.6-2-.6s-1.2.6-2 .6C8.5 19.3 7.2 17.9 7.2 16z"/></svg>
              <!-- 提醒 -->
              <svg v-else-if="getNavIconType(route.path) === 'bell'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <!-- 说说 -->
              <svg v-else-if="getNavIconType(route.path) === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              <!-- AI助手 -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2 6.5L21 12l-7 2.5L12 21l-2-6.5L3 12l7-2.5z"/></svg>
            </div>
            <span class="nav-label">
              {{ (route.meta?.menu as { title?: string } | undefined)?.title || route.meta?.title }}
            </span>
            <span class="nav-indicator" />
          </router-link>
        </nav>
      </el-aside>

      <el-main class="app-main" :class="{ 'full-width': shouldHideSidebar, 'with-bottom-nav': !shouldHideBottomNav && layoutStore.isMobile }">
        <div class="notification-container">
          <ReminderNotification />
        </div>
        <slot />
      </el-main>
    </el-container>

    <nav v-if="!shouldHideBottomNav && layoutStore.isMobile" class="bottom-nav" aria-label="底部导航">
      <router-link
        v-for="r in menuRoutes"
        :key="r.path"
        :to="r.path"
        class="bottom-nav-item"
        :class="{ active: activeMenu === r.path }"
      >
        <div class="nav-icon-wrap" :class="[`icon-${getNavIconType(r.path)}`, { 'is-active': activeMenu === r.path }]">
          <!-- 首页 -->
          <svg v-if="getNavIconType(r.path) === 'home'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v9a1 1 0 001 1h3v-5a1 1 0 011-1h4a1 1 0 011 1v5h3a1 1 0 001-1v-9"/></svg>
          <!-- 毛孩子 -->
          <svg v-else-if="getNavIconType(r.path) === 'paw'" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="8.5" cy="6.2" rx="2.1" ry="2.5"/><ellipse cx="15.5" cy="6.2" rx="2.1" ry="2.5"/><ellipse cx="4.8" cy="11.5" rx="1.9" ry="2.3"/><ellipse cx="19.2" cy="11.5" rx="1.9" ry="2.3"/><path d="M7.2 16c0-2.7 2.2-4.8 4.8-4.8s4.8 2.1 4.8 4.8c0 1.9-1.3 3.3-2.8 3.3-.8 0-1.3-.6-2-.6s-1.2.6-2 .6C8.5 19.3 7.2 17.9 7.2 16z"/></svg>
          <!-- 提醒 -->
          <svg v-else-if="getNavIconType(r.path) === 'bell'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <!-- 说说 -->
          <svg v-else-if="getNavIconType(r.path) === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
          <!-- AI助手 -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2 6.5L21 12l-7 2.5L12 21l-2-6.5L3 12l7-2.5z"/></svg>
        </div>
        <span class="nav-label text-ellipsis">
          {{ (r.meta?.menu as { title?: string } | undefined)?.title || r.meta?.title }}
        </span>
      </router-link>
    </nav>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
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

const userAvatar = computed(() => {
  const username = authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(authStore.user?.avatar, username)
})

const userName = computed(() => {
  return authStore.user?.nickname || authStore.user?.phone || '用户'
})

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

const activeMenu = computed(() => {
  return route.path
})

const shouldHideSidebar = computed(() => {
  return route.meta?.hideSidebar === true
})

const shouldHideBottomNav = computed(() => {
  return route.meta?.hideBottomNav === true
})

/** 根据路由路径返回导航图标类型 */
const getNavIconType = (path: string): string => {
  const iconMap: Record<string, string> = {
    '/dashboard': 'home',
    '/pets': 'paw',
    '/reminder': 'bell',
    '/club/posts': 'chat',
    '/ai/rag-chat': 'ai',
  }
  return iconMap[path] || 'home'
}

const checkMobile = () => {
  const isTouchDevice = window.matchMedia?.('(pointer: coarse)').matches || false
  const isMobile = isTouchDevice && window.innerWidth < 1024
  layoutStore.setMobile(isMobile)
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请重试')
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
@use '@/styles/animations.scss' as anim;

.app-layout {
  min-height: 100vh;
  background: #FDF9F3;
}

.app-layout :deep(> .el-container) {
  height: calc(100vh - 64px);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid pet.$pet-border-color;
  height: 64px;

  .header-left {
    display: flex;
    align-items: center;

    .logo {
      .logo-text {
        font-family: vars.$font-family-base;
        font-size: 22px;
        font-weight: 700;
        color: vars.$pet-charcoal;
        letter-spacing: -0.5px;
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
  gap: 12px;

  .user-avatar {
    cursor: pointer;
    flex-shrink: 0;
    border: 2px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    @include anim.anim-standard;

    &:hover {
      transform: scale(1.05);
    }
  }

  .user-hello {
    max-width: 120px;
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  .logout-btn {
    padding: 8px;
    color: pet.$pet-warm-gray;
    @include anim.anim-standard;

    &:hover {
      color: pet.$pet-primary;
    }
  }
}

.app-sidebar {
  background: #fff;
  border-right: 1px solid pet.$pet-border-color;
  overflow: hidden;

  .sidebar-nav {
    padding: 20px 16px;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    color: #666;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    border-radius: pet.$pet-radius-md;
    @include anim.anim-standard;

    .nav-icon-wrap {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 20px;
        height: 20px;
      }

      // 侧边栏 active 动画
      &.icon-home.is-active svg {
        animation: navHomeBounce 2.5s anim.$ease-elastic infinite;
      }

      &.icon-paw.is-active svg {
        animation: navPawWaggle 2s anim.$ease-elastic infinite;
      }

      &.icon-bell.is-active svg {
        animation: navBellRing 4s anim.$ease-standard infinite;
        transform-origin: top center;
      }

      &.icon-chat.is-active svg {
        animation: navChatPulse 3s anim.$ease-standard infinite;
      }

      &.icon-ai.is-active svg {
        animation: navAiSparkle 3s anim.$ease-standard infinite;
      }
    }

    .nav-label {
      flex: 1;
    }

    .nav-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: transparent;
      @include anim.anim-standard;
    }

    &:hover {
      color: vars.$pet-charcoal;
      background: pet.$pet-accent-cream;
    }

    &.active {
      color: pet.$pet-primary;
      background: rgba(224, 122, 95, 0.1);

      .nav-indicator {
        background: pet.$pet-primary;
      }
    }
  }
}

.app-main {
  padding: 24px;
  height: 100%;
  overflow-y: auto;

  &.full-width {
    margin-left: 0;
  }

  &.with-bottom-nav {
    padding-bottom: calc(24px + 64px + env(safe-area-inset-bottom));
  }
}

.notification-container {
  position: fixed;
  top: 80px;
  right: 24px;
  width: 380px;
  max-height: calc(100vh - 104px);
  overflow-y: auto;
  z-index: 2000;
  pointer-events: none;

  :deep(.reminder-notification) {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    right: 16px;
    width: calc(100vw - 32px);
    max-width: 380px;
  }
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid pet.$pet-border-color;
  display: flex;
  align-items: stretch;
  gap: 4px;
  z-index: 1200;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 8px;
  color: #999;
  flex: 1;
  text-decoration: none;
  @include anim.anim-standard;

  .nav-icon-wrap {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 22px;
      height: 22px;
    }

    // 首页 - 轻弹
    &.icon-home.is-active svg {
      animation: navHomeBounce 2.5s anim.$ease-elastic infinite;
    }

    // 毛孩子 - 摇摆
    &.icon-paw.is-active svg {
      animation: navPawWaggle 2s anim.$ease-elastic infinite;
    }

    // 提醒 - 摇铃
    &.icon-bell.is-active svg {
      animation: navBellRing 4s anim.$ease-standard infinite;
      transform-origin: top center;
    }

    // 说说 - 呼吸
    &.icon-chat.is-active svg {
      animation: navChatPulse 3s anim.$ease-standard infinite;
    }

    // AI助手 - 闪烁
    &.icon-ai.is-active svg {
      animation: navAiSparkle 3s anim.$ease-standard infinite;
    }
  }

  .nav-label {
    font-size: 11px;
    font-weight: 500;
    max-width: 100%;
  }

  &:hover {
    color: #666;
  }

  &.active {
    color: pet.$pet-primary;
  }
}

// === 导航图标动画关键帧 ===

// 首页 - 轻微弹跳
@keyframes navHomeBounce {
  0%, 70%, 100% { transform: translateY(0); }
  35% { transform: translateY(-3px); }
  50% { transform: translateY(-1px); }
}

// 毛孩子 - 左右摇摆（模拟摇尾巴）
@keyframes navPawWaggle {
  0%, 75%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(-12deg); }
  25% { transform: rotate(10deg); }
  40% { transform: rotate(-6deg); }
  55% { transform: rotate(3deg); }
}

// 提醒 - 摇铃效果（快速摆动后静止）
@keyframes navBellRing {
  0% { transform: rotate(0deg); }
  2% { transform: rotate(14deg); }
  4% { transform: rotate(-12deg); }
  6% { transform: rotate(8deg); }
  8% { transform: rotate(-5deg); }
  10% { transform: rotate(2deg); }
  12%, 100% { transform: rotate(0deg); }
}

// 说说 - 呼吸缩放
@keyframes navChatPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

// AI助手 - 旋转闪烁
@keyframes navAiSparkle {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(15deg) scale(1.15); }
  50% { transform: rotate(0deg) scale(1); }
  75% { transform: rotate(-8deg) scale(1.05); }
}

@media (max-width: 1024px) {
  .app-main.with-bottom-nav {
    padding-bottom: calc(24px + 72px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
  }

  .app-main {
    padding: 16px;
  }
}
</style>
