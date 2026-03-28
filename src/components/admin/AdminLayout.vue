<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="admin-sidebar">
      <div class="sidebar-header" @click="toggleCollapse">
        <span class="logo-text" v-if="!isCollapsed">PetCare</span>
        <span class="logo-text logo-text--small" v-else>PC</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="admin-menu"
        background-color="#1e1e2d"
        text-color="#a2a3b7"
        active-text-color="#E07A5F"
      >
        <el-menu-item-group>
          <template #title><span v-if="!isCollapsed">用户管理</span></template>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <template #title>用户列表</template>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group>
          <template #title><span v-if="!isCollapsed">内容审核</span></template>
          <el-menu-item index="/admin/posts">
            <el-icon><Document /></el-icon>
            <template #title>帖子审核</template>
          </el-menu-item>
          <el-menu-item index="/admin/activities">
            <el-icon><Flag /></el-icon>
            <template #title>活动审核</template>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group>
          <template #title><span v-if="!isCollapsed">积分管理</span></template>
          <el-menu-item index="/admin/coupons">
            <el-icon><Ticket /></el-icon>
            <template #title>积分券模板</template>
          </el-menu-item>
          <el-menu-item index="/admin/points-records">
            <el-icon><List /></el-icon>
            <template #title>积分流水</template>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group>
          <template #title><span v-if="!isCollapsed">AI 管理</span></template>
          <el-menu-item index="/admin/documents">
            <el-icon><FolderOpened /></el-icon>
            <template #title>知识库文档</template>
          </el-menu-item>
          <el-menu-item index="/admin/sync">
            <el-icon><Refresh /></el-icon>
            <template #title>数据同步</template>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>

    <el-container class="admin-main-container">
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ currentTitle }}</span>
        </div>
        <div class="header-right">
          <el-button text @click="goToUserSite">
            <el-icon><Back /></el-icon>
            返回用户端
          </el-button>
          <el-divider direction="vertical" />
          <span class="admin-user-name">{{ userName }}</span>
          <el-avatar :size="32" :src="userAvatar">
            <el-icon><User /></el-icon>
          </el-avatar>
        </div>
      </el-header>

      <el-main class="admin-main">
        <slot />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { User, Document, Flag, Ticket, List, FolderOpened, Refresh, Fold, Expand, Back } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { getUserAvatar } from '@/utils/avatarUtils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapsed = ref(false)

const activeMenu = computed(() => route.path)

const userName = computed(() => authStore.user?.nickname || authStore.user?.phone || '管理员')

const userAvatar = computed(() => {
  const name = authStore.user?.nickname || authStore.user?.phone || '管理员'
  return getUserAvatar(authStore.user?.avatar, name)
})

const currentTitle = computed(() => {
  const titleMap: Record<string, string> = {
    '/admin/users': '用户管理',
    '/admin/posts': '帖子审核',
    '/admin/activities': '活动审核',
    '/admin/coupons': '积分券模板',
    '/admin/points-records': '积分流水',
    '/admin/documents': '知识库文档',
    '/admin/sync': '数据同步',
  }
  return titleMap[route.path] || '管理后台'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const goToUserSite = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.admin-sidebar {
  background: #1e1e2d;
  overflow: hidden;
  transition: width 0.2s ease;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: #E07A5F;
      letter-spacing: -0.5px;
      white-space: nowrap;
    }

    .logo-text--small {
      font-size: 16px;
    }
  }

  .admin-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;

    :deep(.el-menu-item-group__title) {
      color: #6b6b80;
      font-size: 12px;
      padding: 12px 16px 4px;
      letter-spacing: 0.5px;
    }

    :deep(.el-menu-item) {
      height: 44px;
      line-height: 44px;
      margin: 2px 8px;
      border-radius: 8px;

      &:hover {
        background: rgba(224, 122, 95, 0.08) !important;
        color: #E07A5F !important;
      }

      &.is-active {
        background: rgba(224, 122, 95, 0.12) !important;
        color: #E07A5F !important;
      }
    }
  }
}

.admin-main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e8e0d5;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;

      &:hover {
        color: #E07A5F;
      }
    }

    .page-title {
      font-size: 16px;
      font-weight: 600;
      color: #3D405B;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .admin-user-name {
      font-size: 14px;
      color: #666;
    }
  }
}

.admin-main {
  background: #FDF9F3;
  overflow-y: auto;
  padding: 24px;
  flex: 1;
}
</style>
