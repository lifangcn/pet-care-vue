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
      path: '/addresses',
      name: 'addresses',
      component: () => import('@/views/user/Addresses.vue'),
      meta: {
        title: '地址管理 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/mall/Cart.vue'),
      meta: {
        title: '购物车 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/mall/OrderList.vue'),
      meta: {
        title: '我的订单 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/mall/OrderDetail.vue'),
      meta: {
        title: '订单详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/coupons',
      name: 'coupons',
      component: () => import('@/views/mall/Coupons.vue'),
      meta: {
        title: '优惠券 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/reminders',
      name: 'reminders',
      component: () => import('@/views/pet/Reminders.vue'),
      meta: {
        title: '提醒管理 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/diaries',
      name: 'diaries',
      component: () => import('@/views/pet/Diaries.vue'),
      meta: {
        title: '成长日记 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
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
      path: '/experts',
      name: 'experts',
      component: () => import('@/views/community/Experts.vue'),
      meta: {
        title: '专家与达人 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/experts/:id',
      name: 'expert-detail',
      component: () => import('@/views/community/ExpertDetail.vue'),
      meta: {
        title: '专家详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/circles',
      name: 'circles',
      component: () => import('@/views/community/Circles.vue'),
      meta: {
        title: '兴趣圈子 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/questions',
      name: 'questions',
      component: () => import('@/views/community/Questions.vue'),
      meta: {
        title: '问答求助 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/questions/:id',
      name: 'question-detail',
      component: () => import('@/views/community/QuestionDetail.vue'),
      meta: {
        title: '问题详情 - 宠物关怀系统',
        menu: {
          hidden: true,
        },
      },
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('@/views/community/Activities.vue'),
      meta: {
        title: '活动与打卡 - 宠物关怀系统',
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
