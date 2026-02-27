<template>
  <div class="club-activity-detail-page paw-print top-left">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">活动详情</div>
          <div class="actions">
            <el-button @click="goBack">返回</el-button>
            <el-button type="primary" :loading="joinLoading" @click="handleJoin">报名</el-button>
          </div>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated />

      <template v-else>
        <div class="activity-title">{{ activity?.title || '-' }}</div>
        <div class="meta">
          <el-tag size="small" :type="statusType(activity?.status)">{{ statusLabel(activity?.status) }}</el-tag>
          <span class="meta-text">{{ typeLabel(activity?.activityType) }}</span>
          <span class="meta-text">时间：{{ formatTime(activity?.activityTime) }}</span>
          <span v-if="activity?.endTime" class="meta-text">结束：{{ formatTime(activity?.endTime) }}</span>
          <span v-if="activity?.currentParticipants !== undefined" class="meta-text">
            参与：{{ activity?.currentParticipants }}{{ activity?.maxParticipants ? `/${activity?.maxParticipants}` : '' }}
          </span>
          <span v-if="activity?.checkInCount !== undefined" class="meta-text">打卡：{{ activity?.checkInCount }}</span>
        </div>

        <div v-if="activity?.coverImage" class="cover">
          <img :src="activity.coverImage" class="cover-img" />
        </div>

        <div v-if="activity?.description" class="desc">
          {{ activity.description }}
        </div>

        <div v-if="activity?.activityType === 'OFFLINE' && activity?.address" class="block">
          <div class="block-title">线下地址</div>
          <div class="block-body">{{ activity.address }}</div>
        </div>

        <div v-if="activity?.activityType === 'ONLINE' && activity?.onlineLink" class="block">
          <div class="block-title">线上链接</div>
          <div class="block-body">
            <el-link :href="activity.onlineLink" target="_blank" type="primary">{{ activity.onlineLink }}</el-link>
          </div>
        </div>

        <div class="block">
          <div class="block-title">参与用户</div>
          <div class="block-body">
            <el-empty v-if="participants.length === 0" description="暂无参与用户" />
            <div v-else class="participants">
              <el-tag v-for="(p, idx) in participants" :key="idx" effect="plain">
                {{ p?.nickname || p?.name || p?.phone || p?.id || '用户' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="block" v-if="(activity?.checkInEnabled ?? 1) === 1">
          <div class="block-title">打卡</div>
          <div class="block-body">
            <el-input v-model="checkInContent" type="textarea" :rows="3" placeholder="打卡内容" />
            <el-input
              v-model="checkInMediaText"
              type="textarea"
              :rows="2"
              placeholder="图片/视频链接（每行一个）"
              style="margin-top: 10px"
            />
            <div style="margin-top: 10px">
              <el-button type="primary" :loading="checkInLoading" @click="handleCheckIn">打卡</el-button>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="block-title">打卡墙</div>
          <div class="block-body">
            <el-empty v-if="checkIns.length === 0" description="暂无打卡" />
            <el-card v-for="c in checkIns" :key="String(c.id)" class="checkin-item" shadow="hover">
              <div class="checkin-content">{{ c.content || '-' }}</div>
              <div class="checkin-meta">
                <span class="meta-text">{{ formatTime(c.createdAt) }}</span>
              </div>
            </el-card>
            <div class="pager">
              <el-button :loading="checkInListLoading" :disabled="checkInNoMore" @click="loadMoreCheckIns">
                {{ checkInNoMore ? '没有更多了' : '加载更多' }}
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { checkInActivity, fetchActivityById, fetchCheckIns, fetchParticipants, joinActivity } from '@/services/activityService'
import type { Activity, ActivityStatus, Post } from '@/types/club'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const joinLoading = ref(false)
const activity = ref<Activity | null>(null)

const participants = ref<any[]>([])

const checkInContent = ref('')
const checkInMediaText = ref('')
const checkInLoading = ref(false)

const checkIns = ref<Post[]>([])
const checkInListLoading = ref(false)
const checkInNoMore = ref(false)
const checkInPage = ref({ pageNumber: 1, pageSize: 10 })

const statusLabel = (s?: ActivityStatus) => {
  if (s === 'RECRUITING') return '招募中'
  if (s === 'ONGOING') return '进行中'
  if (s === 'ENDED') return '已结束'
  return '未知'
}

const statusType = (s?: ActivityStatus) => {
  if (s === 'RECRUITING') return 'success'
  if (s === 'ONGOING') return 'warning'
  if (s === 'ENDED') return 'info'
  return 'info'
}

const typeLabel = (t?: Activity['activityType']) => {
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

const id = () => route.params.id as string

const loadActivity = async () => {
  if (!id()) return
  loading.value = true
  try {
    const { data } = await fetchActivityById(id())
    activity.value = data
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const loadParticipants = async () => {
  if (!id()) return
  try {
    const { data } = await fetchParticipants(id())
    participants.value = data || []
  } catch (e) {
    participants.value = []
  }
}

const loadCheckIns = async (append: boolean) => {
  if (!id() || checkInListLoading.value) return
  checkInListLoading.value = true
  try {
    const { data } = await fetchCheckIns(id(), checkInPage.value)
    const list = data?.records || []
    if (append) checkIns.value = checkIns.value.concat(list)
    else checkIns.value = list
    const totalPage = data?.totalPage
    if (typeof totalPage === 'number') {
      checkInNoMore.value = (data.pageNumber || checkInPage.value.pageNumber) >= totalPage
    } else {
      checkInNoMore.value = list.length < checkInPage.value.pageSize
    }
  } catch (e) {
    // ignore
  } finally {
    checkInListLoading.value = false
  }
}

const loadMoreCheckIns = async () => {
  if (checkInNoMore.value) return
  checkInPage.value.pageNumber += 1
  await loadCheckIns(true)
}

const handleJoin = async () => {
  if (!id()) return
  joinLoading.value = true
  try {
    await joinActivity(id())
    ElMessage.success('报名成功')
    await Promise.all([loadActivity(), loadParticipants()])
  } catch (e: any) {
    ElMessage.error(e?.message || '报名失败')
  } finally {
    joinLoading.value = false
  }
}

const handleCheckIn = async () => {
  if (!id()) return
  checkInLoading.value = true
  try {
    const mediaUrls = (checkInMediaText.value || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .map(url => ({ url }))
    await checkInActivity(id(), { content: checkInContent.value, mediaUrls })
    ElMessage.success('打卡成功')
    checkInContent.value = ''
    checkInMediaText.value = ''
    checkInPage.value.pageNumber = 1
    checkInNoMore.value = false
    await Promise.all([loadActivity(), loadCheckIns(false)])
  } catch (e: any) {
    ElMessage.error(e?.message || '打卡失败')
  } finally {
    checkInLoading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  await Promise.all([loadActivity(), loadParticipants()])
  await loadCheckIns(false)
})
</script>

<style scoped lang="scss">
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/variables.scss' as vars;

.club-activity-detail-page {
  padding: 24px;
  position: relative;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .title {
    font-size: 20px;
    font-weight: 700;
    font-family: 'Comic Sans MS', sans-serif;
  }
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.activity-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  font-family: 'Comic Sans MS', sans-serif;
  color: #2C3E50;
}

.meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: vars.$pet-bg-card;
  border-radius: pet.$pet-radius-md;
  border: 2px solid rgba(255, 138, 76, 0.25);
}

.meta-text {
  color: #7F8C8D;
  font-size: 13px;
}

.cover {
  margin: 16px 0;
}

.cover-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: pet.$pet-radius-lg;
  border: 2px solid rgba(255, 138, 76, 0.25);
}

.desc {
  white-space: pre-wrap;
  line-height: 1.8;
  margin-bottom: 16px;
  padding: 16px;
  background: vars.$pet-bg-card;
  border-radius: pet.$pet-radius-md;
  border: 2px solid rgba(255, 138, 76, 0.25);
}

.block {
  margin-top: 20px;
}

.block-title {
  font-weight: 700;
  margin-bottom: 12px;
  font-family: 'Comic Sans MS', sans-serif;
  font-size: 16px;
  color: #2C3E50;
}

.block-body {
  color: #2C3E50;
  padding: 16px;
  background: vars.$pet-bg-paper;
  border-radius: pet.$pet-radius-md;
  border: 2px solid rgba(255, 138, 76, 0.25);
}

.participants {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.checkin-item {
  margin-top: 12px;
}

.checkin-content {
  white-space: pre-wrap;
  line-height: 1.8;
}

.checkin-meta {
  margin-top: 10px;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>


