<template>
  <AppLayout v-if="showLayout" :show-footer="false">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

// 懒加载 AppLayout 组件，减少初始包大小
const AppLayout = defineAsyncComponent(() => import('@/components/layout/AppLayout.vue'))

const route = useRoute()

// 不需要布局的页面（落地页、登录页）
const noLayoutRoutes = ['/', '/login']
const showLayout = computed(() => !noLayoutRoutes.includes(route.path))
</script>
