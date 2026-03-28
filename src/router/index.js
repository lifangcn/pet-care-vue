import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/landing/Landing.vue'),
      meta: {
        title: '宠物关怀助手 - 发现更合适的，从真实分享开始',
        description: '真实养宠人的分享社区，帮你找到适合毛孩子的食品、用品和好去处。少踩坑，多发现。',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        title: '登录 - 宠物关怀系统',
        description: '登录宠物关怀助手，加入真实养宠人分享社区，发现适合毛孩子的食品、用品和好去处。',
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
          title: '首页',
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
          title: '毛孩子',
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
          title: '说说',
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
          hidden: true,
        },
      },
    },
    {
      path: '/ai/rag-chat',
      name: 'ai-rag-chat',
      component: () => import('@/views/ai/RAGChat.vue'),
      meta: {
        title: 'AI助手 - 宠物关怀系统',
        menu: {
          title: 'AI助手',
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
    {
      path: '/points/records',
      name: 'points-records',
      component: () => import('@/views/points/PointsRecords.vue'),
      meta: {
        title: '积分明细 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    // ========== 以下路由已废弃，模块已移除 ==========
    // 钱包模块已移除（Wallet.vue 文件保留但不再使用）
    // 商城模块已移除（购物车、订单、优惠券等功能已废弃）
    // 服务订单模块已移除（ServiceOrders.vue 文件保留但不再使用）
    // 旧社区模块已移除（专家、圈子、问答等功能已废弃，已由社区模块替代）
    {
      path: '/reminder',
      name: 'reminder',
      component: () => import('@/views/pet/Reminders.vue'),
      meta: {
        title: '提醒管理 - 宠物关怀系统',
        menu: {
          title: '提醒',
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
    {
      path: '/points/grab',
      name: 'points-grab',
      component: () => import('@/views/points/CouponGrab.vue'),
      meta: {
        title: '抢劵活动 - 宠物关怀系统',
        menu: { hidden: true },
      },
    },
    // ========== 后台管理路由 ==========
    {
      path: '/admin',
      redirect: '/admin/users',
      meta: { requiresAdmin: true, menu: { hidden: true } },
      children: [
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { title: '用户管理 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'posts',
          name: 'admin-posts',
          component: () => import('@/views/admin/PostAudit.vue'),
          meta: { title: '帖子审核 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'activities',
          name: 'admin-activities',
          component: () => import('@/views/admin/ActivityAudit.vue'),
          meta: { title: '活动审核 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'coupons',
          name: 'admin-coupons',
          component: () => import('@/views/admin/CouponManagement.vue'),
          meta: { title: '积分券模板 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'points-records',
          name: 'admin-points-records',
          component: () => import('@/views/admin/PointsRecords.vue'),
          meta: { title: '积分流水 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'documents',
          name: 'admin-documents',
          component: () => import('@/views/admin/DocumentManagement.vue'),
          meta: { title: '知识库文档 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
        {
          path: 'sync',
          name: 'admin-sync',
          component: () => import('@/views/admin/DataSync.vue'),
          meta: { title: '数据同步 - 管理后台', requiresAdmin: true, menu: { hidden: true } },
        },
      ],
    },
  ],
})

/** 设置或更新 meta 标签，用于 SEO */
function setMeta(name, content, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content || '')
}

router.beforeEach(async (to, _from, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  if (to.meta?.description) {
    setMeta('description', to.meta.description)
    setMeta('og:title', to.meta.title, true)
    setMeta('og:description', to.meta.description, true)
  }

  if (to.meta?.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    if (!authStore.user?.isAdmin) {
      try {
        const adminInfo = await authStore.fetchAdminInfo()
        if (!adminInfo?.isAdmin) {
          next('/dashboard')
          return
        }
      } catch {
        next('/dashboard')
        return
      }
    }
  }

  next()
})

export default router
