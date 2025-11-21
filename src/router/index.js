import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        title: '登录 - 宠物关怀系统',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: {
        title: '注册 - 宠物关怀系统',
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: {
        title: '仪表盘 - 宠物关怀系统',
        menu: {
          title: '仪表盘',
          icon: 'DataBoard',
          order: 1,
        },
      },
    },
    {
      path: '/pets',
      name: 'pets',
      component: () => import('@/views/pet/PetList.vue'),
      meta: {
        title: '宠物列表 - 宠物关怀系统',
        menu: {
          title: '宠物管理',
          icon: 'Avatar',
          order: 2,
        },
      },
    },
    {
      path: '/pets/:id',
      name: 'pet-detail',
      component: () => import('@/views/pet/PetDetail.vue'),
      meta: {
        title: '宠物详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/mall',
      name: 'mall',
      component: () => import('@/views/mall/ProductList.vue'),
      meta: {
        title: '商城 - 宠物关怀系统',
        menu: {
          title: '商城',
          icon: 'ShoppingCart',
          order: 3,
        },
      },
    },
    {
      path: '/mall/products/:id',
      name: 'product-detail',
      component: () => import('@/views/mall/ProductDetail.vue'),
      meta: {
        title: '商品详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/service/booking',
      name: 'service-booking',
      component: () => import('@/views/service/ServiceBooking.vue'),
      meta: {
        title: '服务预约 - 宠物关怀系统',
        menu: {
          title: '服务预约',
          icon: 'Calendar',
          order: 4,
        },
      },
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('@/views/community/CommunityHome.vue'),
      meta: {
        title: '社区 - 宠物关怀系统',
        menu: {
          title: '社区',
          icon: 'ChatLineRound',
          order: 5,
        },
      },
    },
    {
      path: '/ai/health-check',
      name: 'ai-health-check',
      component: () => import('@/views/ai/HealthCheck.vue'),
      meta: {
        title: 'AI健康检查 - 宠物关怀系统',
        menu: {
          title: 'AI健康检查',
          icon: 'MagicStick',
          order: 6,
        },
      },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
