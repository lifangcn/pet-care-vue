<template>
  <el-container class="app-layout">
    <el-header class="app-header">
      <div class="header-left">
        <el-button
          :icon="layoutStore.isMobile ? (layoutStore.sidebarCollapsed ? Menu : Close) : Fold"
          circle
          @click="handleToggleSidebar"
        />
        <div class="logo">
          <span class="logo-text">PetCare</span>
        </div>
      </div>
      <div class="header-right">
        <el-dropdown>
          <el-avatar :size="32" :src="userAvatar">
            <el-icon><User /></el-icon>
          </el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToProfile">完善个人信息</el-dropdown-item>
              <el-dropdown-item @click="goToMessages">消息中心</el-dropdown-item>
              <el-dropdown-item @click="goToSettings">设置</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside
        :width="layoutStore.sidebarWidth"
        class="app-sidebar"
        :class="{ 'sidebar-collapsed': layoutStore.sidebarCollapsed, 'sidebar-mobile': layoutStore.isMobile }"
      >
        <el-menu
          :default-active="activeMenu"
          :collapse="layoutStore.sidebarCollapsed && !layoutStore.isMobile"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <el-menu-item
            v-for="route in menuRoutes"
            :key="route.path"
            :index="route.path"
          >
            <el-icon v-if="(route.meta?.menu as { icon?: string } | undefined)?.icon">
              <component :is="getIcon((route.meta?.menu as { icon?: string } | undefined)?.icon || '')" />
            </el-icon>
            <template #title>
              {{ (route.meta?.menu as { title?: string } | undefined)?.title || route.meta?.title }}
            </template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="app-main">
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
    <div
      v-if="layoutStore.isMobile && !layoutStore.sidebarCollapsed"
      class="sidebar-overlay"
      @click="handleToggleSidebar"
    />
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Menu, Close, User } from '@element-plus/icons-vue'
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

// 切换侧边栏
const handleToggleSidebar = () => {
  layoutStore.toggleSidebar()
}

// 检测移动端
const checkMobile = () => {
  const isMobile = window.innerWidth < 768
  layoutStore.setMobile(isMobile)
}

const goToProfile = () => {
  router.push('/profile')
}

const goToMessages = () => {
  router.push('/messages')
}

const goToSettings = () => {
  router.push('/settings')
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
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .logo {
      .logo-text {
        font-family: vars.$font-family-pet;
        font-size: 24px;
        font-weight: 700;
        color: vars.$pet-color-blue;
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

.app-sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s ease;
  overflow: hidden;

  &.sidebar-mobile {
    position: fixed;
    left: 0;
    top: 60px;
    height: calc(100vh - 60px);
    z-index: 1000;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    transform: translateX(0);
    transition: transform 0.3s ease;

    &.sidebar-collapsed {
      transform: translateX(-100%);
    }
  }

  .sidebar-menu {
    border: none;
    height: 100%;
    overflow-y: auto;

    :deep(.el-menu-item) {
      height: 56px;
      line-height: 56px;

      &.is-active {
        background-color: #ecf5ff;
        color: vars.$pet-color-blue;
      }
    }
  }
}

.app-main {
  padding: 20px;
  background: #f6f7fb;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
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
  background: #fff;
  border-top: 1px solid #e4e7ed;

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.sidebar-overlay {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
  }

  .app-main {
    padding: 12px;
  }
}
</style>

