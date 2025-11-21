<template>
  <AppLayout v-if="showLayout" :show-footer="false">
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
