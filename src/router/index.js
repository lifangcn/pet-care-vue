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
      path: '/club/posts',
      name: 'club-posts',
      component: () => import('@/views/club/Posts.vue'),
      meta: {
        title: '内容广场 - 宠物关怀系统',
        menu: {
          title: '俱乐部',
          icon: 'MagicStick',
          order: 6,
        },
      },
    },
    {
      path: '/club/posts/publish',
      name: 'club-post-publish',
      component: () => import('@/views/club/PostPublish.vue'),
      meta: {
        title: '发布动态 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    {
      path: '/club/posts/:id',
      name: 'club-post-detail',
      component: () => import('@/views/club/PostDetail.vue'),
      meta: {
        title: '动态详情 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    {
      path: '/club/activities',
      name: 'club-activities',
      component: () => import('@/views/club/Activities.vue'),
      meta: {
        title: '活动打卡 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    {
      path: '/club/activities/create',
      name: 'club-activity-create',
      component: () => import('@/views/club/ActivityCreate.vue'),
      meta: {
        title: '创建活动 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    {
      path: '/club/activities/:id',
      name: 'club-activity-detail',
      component: () => import('@/views/club/ActivityDetail.vue'),
      meta: {
        title: '活动详情 - 宠物关怀系统',
        menu: { hidden: true },
      },
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
          order: 5,
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
          order: 4,
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
    // ========== 以下路由已废弃，模块已移除 ==========
    // 钱包模块已移除（Wallet.vue 文件保留但不再使用）
    // 商城模块已移除（购物车、订单、优惠券等功能已废弃）
    // 服务订单模块已移除（ServiceOrders.vue 文件保留但不再使用）
    // 旧社区模块已移除（专家、圈子、问答等功能已废弃，已由俱乐部模块替代）
    {
      path: '/reminder',
      name: 'reminder',
      component: () => import('@/views/pet/Reminders.vue'),
      meta: {
        title: '提醒管理 - 宠物关怀系统',
        menu: {
          title: '提醒管理',
          icon: 'Bell',
          order: 3,
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
      // 打卡日历页面已移除（功能已迁移到提醒管理中）
      path: '/checkIn',
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
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  next()
})

export default router
