<template>
  <div class="home-page">
    <div class="home-container">
      <!-- 顶部欢迎条 -->
      <div class="welcome-bar">
        <div class="welcome-text">
          <h1>{{ greeting }}</h1>
          <p>{{ greetingSub }}</p>
        </div>
        <div class="welcome-stats">
          <div class="mini-stat" @click="router.push('/pets')">
            <span class="mini-stat-icon">🐕</span>
            <div class="mini-stat-text">
              <strong>{{ recentPets.length }}</strong>
              <span>毛孩子</span>
            </div>
          </div>
          <div class="mini-stat" @click="router.push('/reminder')">
            <span class="mini-stat-icon">📋</span>
            <div class="mini-stat-text">
              <strong>{{ timelines.length }}</strong>
              <span>今日待办</span>
            </div>
          </div>
          <div class="mini-stat" @click="router.push('/profile')">
            <span class="mini-stat-icon">⭐</span>
            <div class="mini-stat-text">
              <strong>{{ pointsStore.availablePoints }}</strong>
              <span>{{ pointsStore.level.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主内容流 -->
      <div class="content-flow">
        <!-- 宠物卡片区域 -->
        <section v-if="recentPets.length > 0" class="flow-section">
          <div class="section-header">
            <h2>我的毛孩子</h2>
            <router-link to="/pets" class="view-all">全部 →</router-link>
          </div>

          <div class="pets-grid">
            <div
              v-for="pet in recentPets"
              :key="pet.id"
              class="pet-card"
              @click="router.push(`/pet/${pet.id}`)"
            >
              <div class="pet-image">
                <img :src="pet.avatar || '/default-pet.png'" :alt="pet.name" @error="handleImageError" />
              </div>
              <div class="pet-info">
                <h3>{{ pet.name }}</h3>
                <p>{{ pet.breed || '毛孩子' }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-else class="empty-state">
          <div class="empty-icon">🐾</div>
          <h2>还没有添加宠物</h2>
          <p>快来添加你的第一个毛孩子吧</p>
          <el-button type="primary" :icon="Plus" @click="router.push('/pets')">
            添加宠物
          </el-button>
        </section>

        <!-- 今日提醒区域 -->
        <section v-if="timelines.length > 0" class="flow-section">
          <div class="section-header">
            <h2>今日提醒</h2>
            <span class="reminder-count">{{ timelines.length }}项待办</span>
          </div>

          <div class="reminders-list">
            <div
              v-for="item in timelines"
              :key="item.id"
              class="reminder-item"
              :class="{ done: item.completed }"
            >
              <div class="reminder-checkbox">
                <el-checkbox
                  :model-value="item.completed"
                  :disabled="item.completed"
                  @change="() => handleComplete(item)"
                />
              </div>
              <div class="reminder-time">{{ item.time }}</div>
              <div class="reminder-content">
                <p class="reminder-title">{{ item.title }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 快捷操作 -->
        <section class="quick-actions">
          <router-link to="/club/posts" class="action-card">
            <span class="action-icon">💬</span>
            <div class="action-text">
              <strong>发布动态</strong>
              <span>分享毛孩子的日常</span>
            </div>
            <span class="action-arrow">→</span>
          </router-link>
          <!-- <router-link to="/ai/health-check" class="action-card">
            <span class="action-icon">🏥</span>
            <div class="action-text">
              <strong>健康记录</strong>
              <span>记录成长点滴</span>
            </div>
            <span class="action-arrow">→</span>
          </router-link> -->
        </section>

        <!-- 社区动态 -->
        <section v-if="communityPosts.length > 0" class="flow-section">
          <div class="section-header">
            <h2>社区</h2>
            <router-link to="/club/posts" class="view-all">更多 →</router-link>
          </div>

          <div class="community-list">
            <div
              v-for="post in communityPosts"
              :key="post.id"
              class="community-item"
              @click="router.push(`/club/posts/${post.id}`)"
            >
              <div class="community-content">
                <p class="community-title">{{ post.title || post.content?.slice(0, 50) + '...' }}</p>
                <div class="community-meta">
                  <span class="meta-time">{{ formatPostTime(post.createdAt) }}</span>
                  <span class="meta-likes" v-if="post.likeCount !== undefined">
                    <span>👍</span> {{ post.likeCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { usePetStore } from '@/store/pet'
import { usePointsStore } from '@/store/points'
import { fetchReminderExecutions, completeReminderExecution } from '@/services/petService'
import { fetchPosts } from '@/services/postService'
import type { ReminderExecution } from '@/types/pet'
import type { Post } from '@/types/club'

const router = useRouter()
const petStore = usePetStore()
const pointsStore = usePointsStore()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早安'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const greetingSub = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '注意休息，明天见'
  if (hour < 9) return '新的一天，记得照顾毛孩子'
  if (hour < 12) return '忙碌的早晨，别忘了它们'
  if (hour < 14) return '吃过午饭了吗？'
  if (hour < 18) return '下午加油，毛孩子在家等你'
  if (hour < 22) return '下班了，好好陪陪它们'
  return '早点休息，晚安'
})

const recentPets = computed(() => petStore.pets.slice(0, 6))

const timelines = ref<Array<{
  id: string | number
  time: string
  title: string
  petAvatar?: string | null
  completed: boolean
  execution: ReminderExecution
}>>([])

const communityPosts = ref<Post[]>([])

const formatTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatPostTime = (dateTime?: string): string => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
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
      pageSize: 5,
    })

    const executions = res.data?.records || []
    timelines.value = executions.map((execution) => ({
      id: execution.id,
      time: formatTime(execution.scheduleTime),
      title: execution.reminderTitle || `提醒 #${execution.id}`,
      petAvatar: execution.petAvatar,
      completed: execution.status === 'COMPLETED',
      execution,
    })).sort((a, b) => {
      return new Date(a.execution.scheduleTime).getTime() - new Date(b.execution.scheduleTime).getTime()
    })
  } catch (error) {
    console.error('加载提醒失败:', error)
  }
}

const handleComplete = async (item: typeof timelines.value[0]) => {
  if (item.completed) return
  try {
    await completeReminderExecution(item.id)
    item.completed = true
    ElMessage.success('已完成')
    timelines.value = timelines.value.filter(t => t.id !== item.id)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const loadCommunityPosts = async () => {
  try {
    const res = await fetchPosts({
      sort: 'latest',
      pageNumber: 1,
      pageSize: 5,
    })
    communityPosts.value = res.data?.records || []
  } catch (error) {
    console.error('加载社区动态失败:', error)
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect fill="#F5F0E8" width="100" height="100"/>
      <text x="50" y="55" font-size="40" text-anchor="middle" fill="#CCC">🐾</text>
    </svg>
  `)
}

onMounted(async () => {
  await petStore.loadPets()
  pointsStore.fetchAccountWithRetry().catch(() => {})
  await loadReminderExecutions()
  await loadCommunityPosts()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.home-page {
  padding: 0;
  min-height: 100%;
}

.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
}

// 顶部欢迎条
.welcome-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  // 柔化渐变：去掉过于饱和的橙色，保持温暖感
  background: linear-gradient(135deg, #FFB380 0%, #FFD4A8 100%);
  border-radius: 20px;
  margin-bottom: 20px;

  // 噪点纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
    mix-blend-mode: overlay;
    border-radius: 20px;
  }
}

.welcome-text {
  position: relative;
  z-index: 1;

  h1 {
    margin: 0 0 4px;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }
}

.welcome-stats {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  @include anim.anim-standard;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
}

.mini-stat-icon {
  font-size: 20px;
}

.mini-stat-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  strong {
    font-size: 18px;
    color: #fff;
    font-weight: 700;
  }

  span {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
  }
}

// 内容流
.content-flow {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.flow-section {
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: vars.$pet-charcoal;
    }

    .view-all {
      font-size: 13px;
      color: pet.$pet-primary;
      text-decoration: none;
      font-weight: 500;
      @include anim.anim-standard;

      &:hover {
        color: #E5723E;
      }
    }

    .reminder-count {
      font-size: 13px;
      color: pet.$pet-warm-gray;
    }
  }
}

// 宠物卡片流
.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-width: 900px;
}

.pet-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  // 增强阴影层次：使用品牌色阴影
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  // 添加 Claymorphism 边框效果
  border: 2px solid rgba(212, 163, 115, 0.15);
  transition: all 200ms ease-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(224, 122, 95, 0.15);
    border-color: rgba(212, 163, 115, 0.25);
  }

  &:active {
    transform: translateY(-1px);
  }
}

.pet-image {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pet-info {
  padding: 12px 14px;

  h3 {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 600;
    color: vars.$pet-charcoal;
  }

  p {
    margin: 0;
    font-size: 12px;
    color: pet.$pet-warm-gray;
  }
}

// 快捷操作
.quick-actions {
  display: flex;
  gap: 10px;
}

.action-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  text-decoration: none;
  // Claymorphism 阴影效果
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(212, 163, 115, 0.15);
  transition: all 200ms ease-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 20px rgba(224, 122, 95, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(212, 163, 115, 0.25);
  }

  &:active {
    transform: translateY(-1px);
  }

  .action-icon {
    font-size: 20px;
  }

  .action-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
      font-size: 14px;
      color: vars.$pet-charcoal;
    }

    span {
      font-size: 12px;
      color: pet.$pet-warm-gray;
    }
  }

  .action-arrow {
    font-size: 16px;
    color: pet.$pet-warm-gray;
  }
}

// 社区列表
.community-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 14px;
  cursor: pointer;
  // Claymorphism 阴影效果
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(212, 163, 115, 0.15);
  transition: all 200ms ease-out;

  &:hover {
    box-shadow:
      0 8px 20px rgba(224, 122, 95, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translateX(4px);
    border-color: rgba(212, 163, 115, 0.25);
  }

  &:active {
    transform: translateX(2px);
  }
}

.community-content {
  flex: 1;
  min-width: 0;

  .community-title {
    margin: 0 0 6px;
    font-size: 14px;
    font-weight: 500;
    color: vars.$pet-charcoal;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.4;
  }

  .community-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;

    .meta-time {
      color: pet.$pet-warm-gray;
    }

    .meta-likes {
      display: flex;
      align-items: center;
      gap: 4px;
      color: pet.$pet-warm-gray;

      span:first-child {
        font-size: 12px;
      }
    }
  }
}

// 提醒卡片流
.reminders-flow {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reminder-card-flow {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  @include anim.anim-standard;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.done {
    opacity: 0.5;

    .reminder-title {
      text-decoration: line-through;
    }
  }
}

.reminder-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #FF8A4C, #FFB380);
  border-radius: 12px;
  flex-shrink: 0;
  color: #fff;

  .time-hour {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }

  .time-minute {
    font-size: 12px;
    font-weight: 500;
    opacity: 0.9;
  }
}

.reminder-divider {
  width: 1px;
  height: 32px;
  background: #E5E7EB;
  flex-shrink: 0;
}

.reminder-content {
  flex: 1;
  min-width: 0;

  .reminder-title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: vars.$pet-charcoal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: vars.$pet-charcoal;
  }

  p {
    margin: 0 0 20px;
    font-size: 14px;
    color: pet.$pet-warm-gray;
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

// 响应式
@media (max-width: 900px) {
  .content-flow {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 12px 16px;
  }

  .welcome-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
  }

  .welcome-stats {
    width: 100%;
    justify-content: space-between;
  }

  .mini-stat {
    flex: 1;
    justify-content: center;
  }

  .pets-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    flex-direction: column;
  }
}
</style>
