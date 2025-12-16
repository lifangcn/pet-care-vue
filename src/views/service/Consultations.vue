<template>
  <div class="consultations-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>在线咨询</h2>
          <el-button type="primary" @click="$router.push('/experts')">找专家</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="进行中" name="active" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
      <div class="consultation-list">
        <el-empty v-if="consultations.length === 0" description="暂无咨询记录" />
        <el-card v-for="consultation in consultations" :key="consultation.id" class="consultation-item" @click="$router.push(`/consultations/${consultation.id}`)">
          <div class="consultation-header">
            <div class="expert-info">
              <el-avatar :src="consultation.expertAvatar" />
              <div>
                <h4>{{ consultation.expertName }}</h4>
                <el-tag size="small">{{ consultation.type === 'text' ? '图文' : '视频' }}</el-tag>
              </div>
            </div>
            <el-tag :type="consultation.status === 'active' ? 'success' : 'info'">
              {{ consultation.status === 'active' ? '进行中' : '已完成' }}
            </el-tag>
          </div>
          <div class="consultation-content">
            <p>宠物：{{ consultation.petName }}</p>
            <p v-if="consultation.messages.length > 0" class="last-message">
              {{ consultation.messages[consultation.messages.length - 1].content }}
            </p>
          </div>
          <div class="consultation-footer">
            <span class="time">{{ formatTime(consultation.createdAt) }}</span>
            <el-button type="text" @click.stop="$router.push(`/consultations/${consultation.id}`)">查看详情</el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadConsultations"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchConsultations } from '@/services/serviceService'
import type { Consultation } from '@/services/serviceService'

const activeTab = ref('all')
const consultations = ref<Consultation[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadConsultations = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await fetchConsultations(params)
    consultations.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载咨询记录失败:', error)
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  loadConsultations()
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadConsultations()
})
</script>

<style scoped lang="scss">
.consultations-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
  }
}

.consultation-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.consultation-item {
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.consultation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.expert-info {
  display: flex;
  align-items: center;
  gap: 12px;
  h4 {
    margin: 0 0 4px;
  }
}

.consultation-content {
  margin-bottom: 16px;
  p {
    margin: 8px 0;
    color: #666;
  }
  .last-message {
    color: #999;
    font-size: 14px;
  }
}

.consultation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .time {
    color: #999;
    font-size: 12px;
  }
}
</style>
