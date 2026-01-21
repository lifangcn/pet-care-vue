<template>
  <div class="dashboard-page">
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
          </el-row>
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
  EditPen,
  FirstAidKit,
  MagicStick,
  Clock,
  Sunny,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { getUserAvatar } from '@/utils/avatarUtils'
import { fetchReminderExecutions, completeReminderExecution } from '@/services/petService'
import type { ReminderExecution } from '@/types/pet'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => {
  return authStore.user?.nickname || authStore.user?.phone || '用户'
})

const userAvatar = computed(() => {
  const username = authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(authStore.user?.avatar, username)
})

const stats = reactive({
  todos: 0,
})

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
    label: 'AI健康检查',
    icon: MagicStick,
    route: '/pet/ai-check',
    color: vars.petBlue,
    bg: 'rgba(84, 160, 255, 0.15)',
  },
]

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


const handleAction = (action: { route: string }) => {
  router.push(action.route)
}

onMounted(() => {
  loadReminderExecutions()
})
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

.hero-welcome {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;

  .hero-avatar {
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
  }
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

