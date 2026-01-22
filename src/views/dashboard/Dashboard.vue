<template>
  <div class="dashboard-page">
    <div class="pet-decorations">
      <span class="pet-emoji">🐶</span>
      <span class="pet-emoji">🐱</span>
      <span class="pet-emoji">🐰</span>
      <span class="pet-emoji">🐹</span>
    </div>
    <el-container class="content-shell">
      <el-main>
        <section class="stats-section">
          <el-row :gutter="16">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="stat-card" @click="router.push('/pets')">
                <div class="card-title">
                  <span>我的宠物</span>
                  <el-icon :size="20"><Avatar /></el-icon>
                </div>
                <el-statistic :value="petCount" suffix="只" />
                <p class="card-desc">点击查看详情</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="stat-card" @click="router.push('/reminder')">
                <div class="card-title">
                  <span>今日待办</span>
                  <el-icon :size="20"><BellFilled /></el-icon>
                </div>
                <el-statistic :value="stats.todos" suffix="项" />
                <p class="card-desc">点击查看提醒</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="stat-card" @click="router.push('/club/posts')">
                <div class="card-title">
                  <span>内容广场</span>
                  <el-icon :size="20"><ChatDotRound /></el-icon>
                </div>
                <el-statistic :value="0" suffix="条" />
                <p class="card-desc">点击查看动态</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="12" :lg="6">
              <el-card shadow="hover" class="stat-card" @click="router.push('/ai/rag-chat')">
                <div class="card-title">
                  <span>AI问答</span>
                  <el-icon :size="20"><MagicStick /></el-icon>
                </div>
                <el-statistic :value="stats.aiChatCount" suffix="次" />
                <p class="card-desc">点击开始对话</p>
              </el-card>
            </el-col>
          </el-row>
        </section>

        <section class="features-section">
          <el-card shadow="hover" class="features-card">
            <div class="section-title">
              <h3>功能入口</h3>
            </div>
            <div class="features-grid">
              <div
                v-for="feature in features"
                :key="feature.route"
                class="feature-item"
                @click="router.push(feature.route)"
              >
                <div class="feature-icon" :style="{ background: feature.bg, color: feature.color }">
                  <el-icon :size="28"><component :is="feature.icon" /></el-icon>
                </div>
                <p class="feature-label">{{ feature.label }}</p>
              </div>
            </div>
          </el-card>
        </section>

        <section v-if="recentPets.length > 0" class="pets-section">
          <el-card shadow="hover" class="pets-card">
            <div class="section-title">
              <h3>我的宠物</h3>
              <el-button text type="primary" @click="router.push('/pets')">查看全部</el-button>
            </div>
            <div class="pets-grid">
              <el-card
                v-for="pet in recentPets"
                :key="pet.id"
                class="pet-card"
                shadow="hover"
                @click="router.push(`/pet/${pet.id}`)"
              >
                <div class="pet-content">
                  <el-avatar :size="64" :src="pet.avatar || ''" class="pet-avatar">
                    <el-icon><Avatar /></el-icon>
                  </el-avatar>
                  <div class="pet-info">
                    <h4>{{ pet.name }}</h4>
                    <p>{{ pet.breed || '未设置品种' }} · {{ typeLabel(pet.type) }}</p>
                    <p v-if="pet.birthday" class="pet-birthday">生日：{{ pet.birthday }}</p>
                  </div>
                </div>
              </el-card>
            </div>
          </el-card>
        </section>
      </el-main>

      <el-aside width="320px" class="aside-panel">
        <el-card shadow="hover" class="todo-card">
          <div class="section-title">
            <h3>待办提醒</h3>
            <span>按时间排序</span>
          </div>
          <el-empty v-if="timelines.length === 0" description="暂无待办提醒" :image-size="80" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="item in timelines"
              :key="item.id"
              :timestamp="item.time"
              :type="item.type"
            >
              <div class="timeline-item">
                <div class="timeline-content">
                  <div class="timeline-header">
                    <el-avatar v-if="item.petAvatar" :src="item.petAvatar" :size="32" class="pet-avatar" />
                    <el-avatar v-else :size="32" class="pet-avatar">{{ item.petName?.charAt(0) || '?' }}</el-avatar>
                    <div class="timeline-text">
                      <p class="title">{{ item.title }}</p>
                      <p class="desc">{{ item.desc }}</p>
                      <p v-if="item.petName" class="pet-name">{{ item.petName }}</p>
                    </div>
                  </div>
                </div>
                <el-checkbox :model-value="item.completed" :disabled="item.completed" @change="() => handleComplete(item)">完成</el-checkbox>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-aside>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  BellFilled,
  Avatar,
  MagicStick,
  ChatDotRound,
  Document,
  FirstAidKit,
  Flag,
} from '@element-plus/icons-vue'
import { usePetStore } from '@/store/pet'
import { fetchReminderExecutions, completeReminderExecution } from '@/services/petService'
import type { ReminderExecution, Pet } from '@/types/pet'

const router = useRouter()
const petStore = usePetStore()

const stats = reactive({
  todos: 0,
  aiChatCount: 0,
})

const petCount = computed(() => petStore.pets.length)
const recentPets = computed(() => petStore.pets.slice(0, 4))

const timelines = ref<Array<{
  id: string | number
  time: string
  title: string
  desc: string
  petName?: string | null
  petAvatar?: string | null
  type: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  completed: boolean
  execution: ReminderExecution
}>>([])

const features = [
  {
    label: '宠物管理',
    icon: Avatar,
    route: '/pets',
    color: '#FF8A4C',
    bg: 'rgba(255, 138, 76, 0.15)',
  },
  {
    label: '提醒管理',
    icon: BellFilled,
    route: '/reminder',
    color: '#FF6B9C',
    bg: 'rgba(255, 107, 156, 0.15)',
  },
  {
    label: '内容广场',
    icon: ChatDotRound,
    route: '/club/posts',
    color: '#54A0FF',
    bg: 'rgba(84, 160, 255, 0.15)',
  },
  {
    label: '活动打卡',
    icon: Flag,
    route: '/club/activities',
    color: '#1DD1A1',
    bg: 'rgba(29, 209, 161, 0.15)',
  },
  {
    label: 'AI健康检查',
    icon: FirstAidKit,
    route: '/ai/health-check',
    color: '#BFD9F2',
    bg: 'rgba(191, 217, 242, 0.15)',
  },
  {
    label: 'AI助手',
    icon: MagicStick,
    route: '/ai/rag-chat',
    color: '#D7CCFF',
    bg: 'rgba(215, 204, 255, 0.15)',
  },
  {
    label: '文档管理',
    icon: Document,
    route: '/ai/documents',
    color: '#FFF0B8',
    bg: 'rgba(255, 240, 184, 0.15)',
  },
]

const typeLabel = (type: Pet['type']) => {
  if (type === 'dog') return '狗'
  if (type === 'cat') return '猫'
  if (type === 'other') return '其他'
  return '未设置'
}

const formatTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getTimelineType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  if (status === 'COMPLETED') return 'success'
  if (status === 'OVERDUE') return 'danger'
  return 'primary'
}

const loadReminderExecutions = async () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const res = await fetchReminderExecutions({
      status: 'PENDING',
      startTime: formatDateTime(today),
      endTime: formatDateTime(tomorrow),
      pageNumber: 1,
      pageSize: 10,
    })

    const executions = res.data?.records || []
    stats.todos = executions.length

    timelines.value = executions.map((execution) => ({
      id: execution.id,
      time: formatTime(execution.scheduleTime),
      title: execution.reminderTitle || `提醒执行 #${execution.id}`,
      desc: execution.reminderDescription || execution.completionNotes || '待处理提醒事项',
      petName: execution.petName,
      petAvatar: execution.petAvatar,
      type: getTimelineType(execution.status),
      completed: execution.status === 'COMPLETED',
      execution,
    })).sort((a, b) => {
      return new Date(a.execution.scheduleTime).getTime() - new Date(b.execution.scheduleTime).getTime()
    })
  } catch (error) {
    console.error('加载待办提醒失败:', error)
  }
}

const handleComplete = async (item: typeof timelines.value[0]) => {
  if (item.completed) return
  try {
    await completeReminderExecution(item.id)
    item.completed = true
    item.type = 'success'
    stats.todos = Math.max(0, stats.todos - 1)
    ElMessage.success('已完成')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const loadAIChatCount = () => {
  const count = localStorage.getItem('ai_chat_count')
  stats.aiChatCount = count ? parseInt(count, 10) : 0
}

onMounted(async () => {
  await petStore.loadPets()
  await loadReminderExecutions()
  loadAIChatCount()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.dashboard-page {
  position: relative;
  padding: 32px 24px 40px;
  min-height: 100vh;
  font-family: vars.$font-family-base;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: 
      radial-gradient(circle at 15% 25%, rgba(255, 209, 166, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 85% 75%, rgba(191, 217, 242, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(191, 235, 215, 0.1) 0%, transparent 40%);
    z-index: 0;
  }

  .pet-decorations {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .pet-emoji {
      position: absolute;
      font-size: 48px;
      opacity: 0.08;
      animation: petFloat 12s ease-in-out infinite;

      &:nth-child(1) {
        top: 8%;
        right: 5%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 25%;
        left: 3%;
        animation-delay: 2s;
      }

      &:nth-child(3) {
        bottom: 20%;
        right: 8%;
        animation-delay: 4s;
      }

      &:nth-child(4) {
        bottom: 35%;
        left: 5%;
        animation-delay: 6s;
      }

      &:nth-child(5) {
        top: 50%;
        right: 2%;
        font-size: 36px;
        animation-delay: 8s;
      }
    }
  }

  @keyframes petFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    25% { transform: translate(20px, -25px) rotate(8deg) scale(1.1); }
    50% { transform: translate(-15px, -35px) rotate(-8deg) scale(0.95); }
    75% { transform: translate(-20px, -20px) rotate(5deg) scale(1.05); }
  }
}

.content-shell {
  background: transparent;
  display: flex;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.content-shell .el-main {
  padding: 0;
  overflow: visible;
}

.content-shell .el-aside {
  padding-left: 0;
}

.stats-section,
.features-section,
.pets-section {
  margin-bottom: 24px;
}

.stats-section:last-of-type,
.features-section:last-of-type,
.pets-section:last-of-type {
  margin-bottom: 0;
}

.stats-section .el-col {
  display: flex;
}

.stat-card {
  min-height: 140px;
  border-radius: 16px;
  width: 100%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 251, 247, 0.95));

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 209, 166, 0.1) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(255, 138, 76, 0.2);

    &::before {
      opacity: 1;
    }
  }

  .card-title {
    position: relative;
    z-index: 1;
  }
}

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2d3d;
  margin-bottom: 16px;
  position: relative;
}

.card-desc {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #606266;

  h3 {
    margin: 0;
    color: #1f2d3d;
    font-size: 18px;
  }
}

.features-card {
  border-radius: 16px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 251, 247, 0.98));
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 209, 166, 0.2) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
    border-radius: 50%;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 20px rgba(255, 138, 76, 0.15);

    &::before {
      width: 200px;
      height: 200px;
    }

    .feature-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.feature-label {
  margin: 0;
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  text-align: center;
}

.pets-card {
  border-radius: 16px;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.pet-card {
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(255, 251, 247, 0.98));
  position: relative;
  overflow: hidden;

  &::after {
    content: '💕';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 20px;
    opacity: 0;
    transform: scale(0);
    transition: all 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 20px rgba(255, 138, 76, 0.15);

    &::after {
      opacity: 0.6;
      transform: scale(1);
    }

    .pet-avatar {
      transform: scale(1.1);
    }
  }
}

.pet-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.pet-avatar {
  flex-shrink: 0;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.pet-info {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #1f2d3d;
  }

  p {
    margin: 4px 0;
    color: #909399;
    font-size: 13px;
  }

  .pet-birthday {
    color: #606266;
    font-size: 12px;
  }
}

.aside-panel {
  padding: 0;
}

.todo-card {
  height: 100%;
  overflow-y: auto;
  border-radius: 16px;
}

.timeline-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.timeline-content {
  flex: 1;
  
  .timeline-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pet-avatar {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .timeline-text {
    flex: 1;
    min-width: 0;
  }
  
  .title {
    margin: 0;
    font-weight: 600;
    font-size: 14px;
  }
  .desc {
    margin: 4px 0 0;
    color: #909399;
    font-size: 13px;
    line-height: 1.4;
  }
  .pet-name {
    margin: 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 500;
  }
}

@media (max-width: 960px) {
  .dashboard-page {
    padding: 16px 12px 32px;
  }

  .content-shell {
    flex-direction: column;
  }

  .aside-panel {
    width: 100% !important;
    margin-top: 16px;
  }

  .features-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .pets-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
