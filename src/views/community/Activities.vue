<template>
  <div class="activities-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="活动" name="activities">
        <el-card>
          <template #header>
            <h2>活动</h2>
          </template>
          <div class="activity-list">
            <el-empty v-if="activities.length === 0" description="暂无活动" />
            <el-card v-for="activity in activities" :key="activity.id" class="activity-item">
              <el-image :src="activity.cover" class="activity-cover" />
              <div class="activity-content">
                <h3>{{ activity.title }}</h3>
                <p>{{ activity.description }}</p>
                <div class="activity-info">
                  <span>{{ activity.type === 'online' ? '线上' : '线下' }}</span>
                  <span>{{ formatTime(activity.startTime) }}</span>
                  <span v-if="activity.location">地点：{{ activity.location }}</span>
                  <span>参与人数：{{ activity.participantCount }}</span>
                </div>
                <div class="activity-actions">
                  <el-button v-if="!activity.joined" type="primary" @click="joinActivity(activity.id)">报名参加</el-button>
                  <el-tag v-else type="success">已报名</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="打卡" name="checkins">
        <el-card>
          <template #header>
            <h2>打卡</h2>
          </template>
          <div class="checkin-list">
            <el-empty v-if="checkIns.length === 0" description="暂无打卡任务" />
            <el-card v-for="checkIn in checkIns" :key="checkIn.id" class="checkin-item">
              <div class="checkin-header">
                <el-icon :size="32"><component :is="checkIn.icon" /></el-icon>
                <div class="checkin-info">
                  <h3>{{ checkIn.title }}</h3>
                  <p>{{ checkIn.description }}</p>
                </div>
              </div>
              <div class="checkin-stats">
                <div class="stat-item">
                  <span class="label">连续打卡</span>
                  <span class="value">{{ checkIn.currentStreak }} 天</span>
                </div>
                <div class="stat-item">
                  <span class="label">总打卡</span>
                  <span class="value">{{ checkIn.totalDays }} 天</span>
                </div>
              </div>
              <div class="checkin-actions">
                <el-button v-if="!checkIn.todayChecked" type="primary" @click="doCheckIn(checkIn.type)">今日打卡</el-button>
                <el-tag v-else type="success">今日已打卡</el-tag>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchActivities, joinActivity, fetchCheckIns, checkIn } from '@/services/communityService'
import type { Activity, CheckIn } from '@/services/communityService'

const activeTab = ref('activities')
const activities = ref<Activity[]>([])
const checkIns = ref<CheckIn[]>([])

const loadActivities = async () => {
  try {
    const res = await fetchActivities()
    activities.value = res.data.data || []
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const joinActivityHandler = async (id: string) => {
  try {
    await joinActivity(id)
    loadActivities()
  } catch (error) {
    console.error('报名活动失败:', error)
  }
}

const loadCheckIns = async () => {
  try {
    const res = await fetchCheckIns()
    checkIns.value = res.data || []
  } catch (error) {
    console.error('加载打卡列表失败:', error)
  }
}

const doCheckIn = async (type: string) => {
  try {
    await checkIn(type)
    loadCheckIns()
  } catch (error) {
    console.error('打卡失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadActivities()
  loadCheckIns()
})
</script>

<style scoped lang="scss">
.activities-page {
  padding: 24px;
}

.activity-list,
.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 16px;
  .activity-cover {
    width: 200px;
    height: 150px;
    border-radius: 8px;
  }
  .activity-content {
    flex: 1;
    h3 {
      margin: 0 0 8px;
    }
    p {
      margin: 0 0 16px;
      color: #666;
    }
    .activity-info {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      color: #999;
      font-size: 14px;
    }
  }
}

.checkin-item {
  .checkin-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    .checkin-info {
      flex: 1;
      h3 {
        margin: 0 0 4px;
      }
      p {
        margin: 0;
        color: #666;
      }
    }
  }
  .checkin-stats {
    display: flex;
    gap: 32px;
    margin-bottom: 16px;
    .stat-item {
      display: flex;
      flex-direction: column;
      .label {
        font-size: 12px;
        color: #999;
      }
      .value {
        font-size: 20px;
        font-weight: bold;
        color: #409eff;
      }
    }
  }
  .checkin-actions {
    text-align: right;
  }
}
</style>
