<template>
  <AdminLayout v-if="isAdminRoute">
    <router-view />
  </AdminLayout>
  <AppLayout v-else-if="showLayout" :show-footer="false">
    <router-view />
  </AppLayout>
  <router-view v-else />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const AppLayout = defineAsyncComponent(() => import('@/components/layout/AppLayout.vue'))
const AdminLayout = defineAsyncComponent(() => import('@/components/admin/AdminLayout.vue'))

const route = useRoute()

const noLayoutRoutes = ['/', '/login']
const showLayout = computed(() => !noLayoutRoutes.includes(route.path))
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
