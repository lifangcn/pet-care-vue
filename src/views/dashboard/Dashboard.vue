<template>
  <div class="dashboard-page">
    <div class="hero-panel">
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <div class="hero-text">
          <p class="hero-subtitle">温暖守护 · 贴心陪伴</p>
          <h1>欢迎回来，{{ userName }}</h1>
          <p class="hero-desc">
            今日已为 <strong>{{ stats.todos }}</strong> 项任务设定提醒，<strong>{{ stats.community }}</strong> 条社区互动待查收。
            保持宠物健康，从当下开始。
          </p>
          <div class="hero-tags">
            <el-tag type="success" round effect="dark">健康指数 {{ stats.healthScore }} 分</el-tag>
            <el-tag type="warning" round effect="dark">商城福利 {{ stats.coupons }} 张</el-tag>
          </div>
        </div>
        <div class="hero-cards">
          <el-card
            v-for="item in heroHighlights"
            :key="item.title"
            shadow="hover"
            class="hero-card"
          >
            <div class="hero-card-icon" :style="{ background: item.bg, color: item.color }">
              <el-icon :size="22"><component :is="item.icon" /></el-icon>
            </div>
            <div>
              <p class="label">{{ item.title }}</p>
              <p class="value">{{ item.value }}</p>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <el-container class="content-shell">
      <el-main>
        <section class="overview-section">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover">
                <div class="card-title">
                  <span>今日待办</span>
                  <el-icon :size="18"><BellFilled /></el-icon>
                </div>
                <el-statistic :value="stats.todos" suffix="项" />
                <p class="card-desc">记得按时完成护理任务</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover">
                <div class="card-title">
                  <span>健康评分</span>
                  <el-icon :size="18"><Medal /></el-icon>
                </div>
                <el-progress type="circle" :percentage="stats.healthScore" :color="vars.petBlue" />
                <p class="card-desc">整体状态良好</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover">
                <div class="card-title">
                  <span>社区消息</span>
                  <el-icon :size="18"><ChatDotRound /></el-icon>
                </div>
                <div class="badge-wrapper">
                  <el-badge :value="stats.community" type="danger">
                    <el-button link>查看通知</el-button>
                  </el-badge>
                </div>
                <p class="card-desc">社群互动热度上升</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover">
                <div class="card-title">
                  <span>优惠券</span>
                  <el-icon :size="18"><Tickets /></el-icon>
                </div>
                <el-statistic :value="stats.coupons" suffix="张" />
                <p class="card-desc">商城限时福利已更新</p>
              </el-card>
            </el-col>
          </el-row>
        </section>

        <section class="middle-section">
          <el-row :gutter="16">
            <el-col :xs="24" :lg="12">
              <el-card class="action-card" shadow="hover">
                <div class="section-title">
                  <h3>快速操作</h3>
                  <span>常用功能一步直达</span>
                </div>
                <div class="action-grid">
                  <div
                    v-for="action in quickActions"
                    :key="action.label"
                    class="action-item"
                    role="button"
                    tabindex="0"
                    :style="{ borderColor: action.color }"
                    @click="handleAction(action)"
                  >
                    <div class="action-icon" :style="{ background: action.bg, color: action.color }">
                      <el-icon :size="24"><component :is="action.icon" /></el-icon>
                    </div>
                    <p>{{ action.label }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :xs="24" :lg="12">
              <el-card class="pet-status-card" shadow="hover">
                <div class="section-title">
                  <h3>宠物状态</h3>
                  <span>关注每一位伙伴</span>
                </div>
                <div class="pet-list">
                  <el-card
                    v-for="pet in pets"
                    :key="pet.id"
                    class="pet-item"
                    shadow="never"
                    @click="openPet(pet)"
                  >
                    <div class="pet-header">
                      <el-avatar :src="pet.avatar" :size="48" />
                      <div>
                        <p class="pet-name">{{ pet.name }} <small>{{ pet.breed }}</small></p>
                        <p class="pet-info">最近活动：{{ pet.lastActivity }}</p>
                      </div>
                    </div>
                    <div class="pet-health">
                      <span>健康评分</span>
                      <el-progress :percentage="pet.health" :color="pet.health > 80 ? vars.petGreen : vars.petOrange" />
                    </div>
                  </el-card>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </section>
      </el-main>

      <el-aside width="320px" class="aside-panel">
        <el-card shadow="hover" class="todo-card">
          <div class="section-title">
            <h3>待办提醒</h3>
            <span>按时间排序</span>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="item in timelines"
              :key="item.id"
              :timestamp="item.time"
              :type="item.type"
            >
              <div class="timeline-item">
                <div class="timeline-content">
                  <p class="title">{{ item.title }}</p>
                  <p class="desc">{{ item.desc }}</p>
                </div>
                <el-checkbox v-model="item.completed">完成</el-checkbox>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  BellFilled,
  Medal,
  ChatDotRound,
  Tickets,
  EditPen,
  FirstAidKit,
  Share,
  MagicStick,
  Clock,
  Sunny,
} from '@element-plus/icons-vue'

const router = useRouter()
const userName = 'Laura'

const stats = reactive({
  todos: 4,
  healthScore: 86,
  community: 12,
  coupons: 3,
})

const vars = {
  petBlue: '#54A0FF',
  petGreen: '#1DD1A1',
  petOrange: '#FF9F43',
  petPink: '#FF6B9C',
}

const quickActions = [
  {
    label: '添加健康记录',
    icon: EditPen,
    route: '/pet/health',
    color: vars.petOrange,
    bg: 'rgba(255, 159, 67, 0.15)',
  },
  {
    label: '预约服务',
    icon: FirstAidKit,
    route: '/service/booking',
    color: vars.petGreen,
    bg: 'rgba(29, 209, 161, 0.15)',
  },
  {
    label: '发布社区动态',
    icon: Share,
    route: '/community/post',
    color: vars.petPink,
    bg: 'rgba(255, 107, 156, 0.15)',
  },
  {
    label: 'AI健康检查',
    icon: MagicStick,
    route: '/pet/ai-check',
    color: vars.petBlue,
    bg: 'rgba(84, 160, 255, 0.15)',
  },
]

const pets = [
  {
    id: 1,
    name: 'Milo',
    breed: '布偶猫',
    avatar: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&w=120&h=120&fit=crop',
    health: 92,
    lastActivity: '今早完成体检',
  },
  {
    id: 2,
    name: 'Lucky',
    breed: '金毛犬',
    avatar: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&w=120&h=120&fit=crop',
    health: 75,
    lastActivity: '昨日完成洗护',
  },
]

const timelines = reactive([
  { id: 1, time: '09:00', title: '给Milo喂药', desc: '免疫增强剂', type: 'primary', completed: false },
  { id: 2, time: '11:30', title: 'Lucky遛弯', desc: '公园30分钟', type: 'success', completed: false },
  { id: 3, time: '15:00', title: '社区活动', desc: '分享宠物护理经验', type: 'warning', completed: false },
  { id: 4, time: '18:00', title: '商城优惠', desc: '领取洗护套餐券', type: 'info', completed: false },
])

const heroHighlights = [
  {
    title: '下一次护理',
    value: '今日 16:30',
    icon: FirstAidKit,
    bg: 'rgba(255, 159, 67, 0.15)',
    color: vars.petOrange,
  },
  {
    title: 'AI健康检查',
    value: '待启动',
    icon: MagicStick,
    bg: 'rgba(84, 160, 255, 0.15)',
    color: vars.petBlue,
  },
  {
    title: '今日阳光指数',
    value: '良好 · 22℃',
    icon: Sunny,
    bg: 'rgba(255, 107, 156, 0.15)',
    color: vars.petPink,
  },
  {
    title: '本周行程',
    value: '4 个预约',
    icon: Clock,
    bg: 'rgba(29, 209, 161, 0.15)',
    color: vars.petGreen,
  },
]

const handleAction = (action: { route: string }) => {
  router.push(action.route)
}

const openPet = (pet: { id: number }) => {
  router.push(`/pet/${pet.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.dashboard-page {
  position: relative;
  padding: 32px 24px 40px;
  background: linear-gradient(135deg, rgba(255, 159, 67, 0.2), rgba(84, 160, 255, 0.18)) #fdfaf6;
  min-height: 100vh;
  font-family: vars.$font-family-base;
}

.hero-panel {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 25px 60px rgba(255, 159, 67, 0.2);
  backdrop-filter: blur(6px);
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, #ffaf7b, #ffd56f 50%, #ffa5c3);
  opacity: 0.85;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 36px 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  color: #fff;
}

.hero-text {
  flex: 1 1 320px;
  min-width: 280px;
}

.hero-subtitle {
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 13px;
  opacity: 0.8;
  margin-bottom: 6px;
}

.hero-desc {
  margin: 12px 0 16px;
  max-width: 560px;
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-cards {
  flex: 1 1 320px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.hero-card {
  border-radius: 18px;
  border: none;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  color: #fff;

  .label {
    margin: 0;
    opacity: 0.8;
  }

  .value {
    margin: 8px 0 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.hero-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #ff9f43;
}

.content-shell {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.08);
  padding: 24px;
  display: flex;
  gap: 24px;
}

.content-shell .el-main {
  padding: 0;
  overflow: visible;
}

.content-shell .el-aside {
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.overview-section,
.middle-section {
  margin-bottom: 32px;
}

.overview-section:last-of-type,
.middle-section:last-of-type {
  margin-bottom: 0;
}

.overview-section .el-col,
.middle-section .el-col {
  display: flex;
}

.overview-section .el-card,
.middle-section .el-card {
  min-height: 180px;
  border-radius: 20px;
  border: none;
  background: #fffaf4;
  width: 100%;
}

.middle-section .el-card {
  min-height: auto;
  background: #fff;
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2d3d;
}

.card-desc {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

.badge-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-top: 8px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  color: #606266;

  h3 {
    margin: 0;
    color: #1f2d3d;
  }
}

.action-card,
.pet-status-card {
  overflow: visible;

  :deep(.el-card__body) {
    overflow: visible;
    padding-bottom: 16px;
  }
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.action-item {
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 159, 67, 0.25);
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  p {
    margin: 0;
    font-weight: 600;
    color: #303133;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(255, 159, 67, 0.25);
  }
}

.action-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pet-status-card .pet-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pet-item {
  cursor: pointer;
  transition: transform 0.2s ease;
  border-radius: 16px;
  border: 1px solid rgba(255, 159, 67, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 159, 67, 0.2);
  }
}

.pet-header {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;

  .pet-name {
    margin: 0;
    font-weight: 600;
    small {
      color: #909399;
      margin-left: 6px;
    }
  }

  .pet-info {
    margin: 0;
    font-size: 12px;
    color: #909399;
  }
}

.pet-health {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
}

.aside-panel {
  padding: 16px 0 16px 16px;
}

.todo-card {
  height: 100%;
  overflow-y: auto;
  border-radius: 20px;
  border: none;
  background: #fff9f5;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.timeline-content {
  .title {
    margin: 0;
    font-weight: 600;
  }
  .desc {
    margin: 4px 0 0;
    color: #909399;
    font-size: 13px;
  }
}

@media (max-width: 960px) {
  .dashboard-page {
    padding: 16px 12px 32px;
  }

  .content-shell {
    flex-direction: column;
  }

  .content-shell .el-aside {
    border-left: none;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 16px;
  }

  .hero-content {
    padding: 28px 24px;
  }

  .aside-panel {
    width: 100% !important;
    padding-left: 0;
    margin-top: 16px;
  }
}
</style>

