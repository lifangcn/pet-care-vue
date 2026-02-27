<template>
  <div class="activities-page">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <h1>活动</h1>
      <div class="header-actions">
        <el-button type="primary" @click="goSquare">社区</el-button>
        <el-button type="primary" :icon="Plus" @click="goCreate">发布</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <span
          v-for="tab in statusTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: query.status === tab.value }"
          @click="setStatus(tab.value)"
        >
          {{ tab.label }}
        </span>
      </div>

      <el-select v-model="query.activityType" placeholder="类型" clearable class="filter-select" @change="reload">
        <el-option label="全部" :value="undefined" />
        <el-option label="线上活动" value="ONLINE" />
        <el-option label="线下聚会" value="OFFLINE" />
      </el-select>
    </div>

    <!-- 活动列表 -->
    <div class="activities-grid" v-loading="loading">
      <div
        v-for="a in activities"
        :key="String(a.id)"
        class="activity-card"
        @click="goDetail(a.id)"
      >
        <div class="card-top">
          <h3 class="card-title">{{ a.title }}</h3>
          <span class="status-tag" :class="'status-' + a.status">
            {{ statusLabel(a.status) }}
          </span>
        </div>
        <div class="card-meta">
          <span class="meta-text">{{ typeLabel(a.activityType) }}</span>
          <span class="meta-text">时间：{{ formatTime(a.activityTime) }}</span>
          <span class="meta-text" v-if="a.currentParticipants !== undefined">
            参与：{{ a.currentParticipants }}{{ a.maxParticipants ? `/${a.maxParticipants}` : '' }}
          </span>
          <span class="meta-text" v-if="a.checkInCount !== undefined">打卡：{{ a.checkInCount }}</span>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="!loading && activities.length > 0">
      <el-button v-if="!noMore" @click="loadMore">加载更多</el-button>
      <span v-else class="no-more">没有更多了</span>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && activities.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <h3>暂无活动</h3>
      <p>来发布第一个活动吧</p>
      <el-button type="primary" @click="goCreate">发布活动</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchActivities } from '@/services/activityService'
import type { Activity, ActivityStatus, ActivityType } from '@/types/club'

const router = useRouter()

const statusTabs = [
  { label: '招募中', value: 'RECRUITING' as const },
  { label: '进行中', value: 'ONGOING' as const },
  { label: '已结束', value: 'ENDED' as const },
]

const query = ref<{ status?: ActivityStatus; activityType?: ActivityType; pageNumber: number; pageSize: number }>({
  status: 'RECRUITING',
  pageNumber: 1,
  pageSize: 20,
})

const activities = ref<Activity[]>([])
const loading = ref(false)
const noMore = ref(false)

const statusLabel = (s?: ActivityStatus) => {
  if (s === 'RECRUITING') return '招募中'
  if (s === 'ONGOING') return '进行中'
  if (s === 'ENDED') return '已结束'
  return '未知'
}

const typeLabel = (t: ActivityType) => {
  if (t === 'ONLINE') return '线上活动'
  if (t === 'OFFLINE') return '线下聚会'
  return '活动'
}

const formatTime = (v?: string) => {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleString('zh-CN')
}

const setStatus = (value: ActivityStatus | undefined) => {
  query.value.status = value
  reload()
}

const load = async (append: boolean) => {
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await fetchActivities(query.value)
    const list = data?.records || []
    if (append) activities.value = activities.value.concat(list)
    else activities.value = list
    const totalPage = data?.totalPage
    if (typeof totalPage === 'number') {
      noMore.value = (data.pageNumber || query.value.pageNumber) >= totalPage
    } else {
      noMore.value = list.length < query.value.pageSize
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const reload = async () => {
  query.value.pageNumber = 1
  noMore.value = false
  await load(false)
}

const loadMore = async () => {
  if (noMore.value) return
  query.value.pageNumber += 1
  await load(true)
}

const goDetail = (id: string | number) => {
  router.push(`/club/activities/${id}`)
}

const goCreate = () => {
  router.push('/club/activities/create')
}

const goSquare = () => {
  router.push('/club/posts')
}

onMounted(reload)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.activities-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
}

// 顶部操作栏
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: vars.$pet-charcoal;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: pet.$pet-warm-gray;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: vars.$pet-charcoal;
    background: #F5F0E8;
  }

  &.active {
    color: #fff;
    background: pet.$pet-primary;
  }
}

:deep(.filter-select) {
  width: 140px;
}

// 活动列表 3列
.activities-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.activity-card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  @include anim.anim-standard;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: vars.$pet-charcoal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  flex-shrink: 0;

  &.status-RECRUITING {
    background: rgba(129, 178, 154, 0.2);
    color: #81B29A;
  }

  &.status-ONGOING {
    background: rgba(242, 204, 143, 0.3);
    color: #B8860B;
  }

  &.status-ENDED {
    background: #F5F0E8;
    color: pet.$pet-warm-gray;
  }
}

.card-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-text {
  color: pet.$pet-warm-gray;
  font-size: 12px;
}

// 加载更多
.load-more {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.no-more {
  color: pet.$pet-warm-gray;
  font-size: 14px;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: vars.$pet-charcoal;
  }

  p {
    margin: 0 0 20px;
    font-size: 14px;
    color: pet.$pet-warm-gray;
  }
}

// 响应式
@media (max-width: 768px) {
  .activities-page {
    padding: 12px 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    h1 {
      font-size: 20px;
    }
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .filter-tabs {
      justify-content: center;
    }

    :deep(.filter-select) {
      width: 100%;
    }
  }

  .activities-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
