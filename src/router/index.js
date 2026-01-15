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
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/views/profile/UserProfile.vue'),
      meta: {
        title: '完善信息 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
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
      path: '/pet/:id',
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
      // 商城模块已移除
      path: '/mall',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
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
      // 社区模块已移除
      path: '/community',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      path: '/ai/health-check',
      name: 'ai-health-check',
      component: () => import('@/views/ai/HealthCheck.vue'),
      meta: {
        title: 'AI健康检查 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/ai/documents',
      name: 'ai-documents',
      component: () => import('@/views/ai/DocumentManagement.vue'),
      meta: {
        title: '文档管理 - 宠物关怀系统',
        menu: {
          title: '文档管理',
          icon: 'Document',
          order: 7,
        },
      },
    },
    {
      path: '/ai/rag-chat',
      name: 'ai-rag-chat',
      component: () => import('@/views/ai/RAGChat.vue'),
      meta: {
        title: 'RAG智能问答 - 宠物关怀系统',
        menu: {
          title: 'RAG智能问答',
          icon: 'ChatDotRound',
          order: 8,
        },
      },
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/user/Messages.vue'),
      meta: {
        title: '消息中心 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/wallet',
      name: 'wallet',
      component: () => import('@/views/user/Wallet.vue'),
      meta: {
        title: '我的钱包 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/user/Settings.vue'),
      meta: {
        title: '设置 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      // 商城模块已移除
      path: '/cart',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 商城模块已移除
      path: '/orders',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 商城模块已移除
      path: '/orders/:id',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 商城模块已移除
      path: '/coupons',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      path: '/reminder',
      name: 'reminder',
      component: () => import('@/views/pet/Reminders.vue'),
      meta: {
        title: '提醒管理 - 宠物关怀系统',
        menu: {
          title: '提醒管理',
          icon: 'Bell',
          order: 7,
        },
      },
    },
    {
      path: '/reminder/executions',
      name: 'reminder-executions',
      component: () => import('@/views/pet/ReminderExecutions.vue'),
      meta: {
        title: '提醒执行记录 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      // 打卡日历页面已移除（保留提醒管理中的签到）
      path: '/checkin',
      redirect: '/reminder',
      meta: { menu: { hidden: true } },
    },
    {
      path: '/consultations',
      name: 'consultations',
      component: () => import('@/views/service/Consultations.vue'),
      meta: {
        title: '在线咨询 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/consultations/:id',
      name: 'consultation-detail',
      component: () => import('@/views/service/ConsultationDetail.vue'),
      meta: {
        title: '咨询详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/service-orders',
      name: 'service-orders',
      component: () => import('@/views/service/ServiceOrders.vue'),
      meta: {
        title: '服务订单 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      // 社区模块已移除
      path: '/experts',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 社区模块已移除
      path: '/experts/:id',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 社区模块已移除
      path: '/circles',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 社区模块已移除
      path: '/questions',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 社区模块已移除
      path: '/questions/:id',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
    },
    {
      // 社区模块已移除
      path: '/activities',
      redirect: '/dashboard',
      meta: { menu: { hidden: true } },
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
