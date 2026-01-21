<template>
  <div class="club-activities-page">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">活动打卡</div>
          <div class="actions">
            <el-button type="primary" :icon="Plus" @click="goCreate">创建活动</el-button>
            <el-button @click="goSquare">内容广场</el-button>
          </div>
        </div>
      </template>

      <div class="filters">
        <el-select v-model="query.status" placeholder="状态" clearable style="width: 160px" @change="reload">
          <el-option label="招募中" :value="1" />
          <el-option label="进行中" :value="2" />
          <el-option label="已结束" :value="3" />
        </el-select>
        <el-select v-model="query.activityType" placeholder="类型" clearable style="width: 160px" @change="reload">
          <el-option label="线上活动" :value="1" />
          <el-option label="线下聚会" :value="2" />
        </el-select>
      </div>

      <div class="list">
        <el-empty v-if="!loading && activities.length === 0" description="暂无活动" />
        <el-card
          v-for="a in activities"
          :key="String(a.id)"
          class="item"
          shadow="hover"
          @click="goDetail(a.id)"
        >
          <div class="item-top">
            <div class="item-title">{{ a.title }}</div>
            <el-tag :type="statusType(a.status)" size="small">
              {{ statusLabel(a.status) }}
            </el-tag>
          </div>
          <div class="item-meta">
            <span class="meta-text">{{ typeLabel(a.activityType) }}</span>
            <span class="meta-text">时间：{{ formatTime(a.activityTime) }}</span>
            <span class="meta-text" v-if="a.currentParticipants !== undefined">
              参与：{{ a.currentParticipants }}{{ a.maxParticipants ? `/${a.maxParticipants}` : '' }}
            </span>
            <span class="meta-text" v-if="a.checkInCount !== undefined">打卡：{{ a.checkInCount }}</span>
          </div>
        </el-card>
      </div>

      <div class="pager">
        <el-button :loading="loading" :disabled="noMore" @click="loadMore">
          {{ noMore ? '没有更多了' : '加载更多' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchActivities } from '@/services/activityService'
import type { Activity } from '@/types/club'

const router = useRouter()

const query = ref<{ status?: number; activityType?: number; pageNumber: number; pageSize: number }>({
  pageNumber: 1,
  pageSize: 10,
})

const activities = ref<Activity[]>([])
const loading = ref(false)
const noMore = ref(false)

const statusLabel = (s?: number) => {
  if (s === 1) return '招募中'
  if (s === 2) return '进行中'
  if (s === 3) return '已结束'
  return '未知'
}

const statusType = (s?: number) => {
  if (s === 1) return 'success'
  if (s === 2) return 'warning'
  if (s === 3) return 'info'
  return 'info'
}

const typeLabel = (t: number) => {
  if (t === 1) return '线上活动'
  if (t === 2) return '线下聚会'
  return '活动'
}

const formatTime = (v?: string) => {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleString('zh-CN')
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
.club-activities-page {
  padding: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  cursor: pointer;
}
.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.item-title {
  font-size: 16px;
  font-weight: 600;
}
.item-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.meta-text {
  color: #909399;
  font-size: 12px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>


