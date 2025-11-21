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
          <el-avatar :size="32" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
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
import { Fold, Menu, Close } from '@element-plus/icons-vue'
import {
  DataBoard,
  Avatar,
  ShoppingCart,
  Calendar,
  ChatLineRound,
  MagicStick,
} from '@element-plus/icons-vue'
import { useLayoutStore } from '@/store/layout'

interface Props {
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFooter: false,
})

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()

// 图标映射
const iconMap: Record<string, any> = {
  Odometer: DataBoard,
  DataBoard,
  Avatar,
  ShoppingBag: ShoppingCart,
  ShoppingCart,
  Calendar,
  ChatLineRound,
  MagicStick,
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

// 退出登录
const handleLogout = () => {
  router.push('/login')
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
  overflow-y: auto;
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

