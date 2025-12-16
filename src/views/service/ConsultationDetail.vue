<template>
  <div class="consultation-detail-page">
    <el-card>
      <template #header>
        <div class="header">
          <div class="expert-info">
            <el-avatar :src="consultation.expertAvatar" />
            <div>
              <h3>{{ consultation.expertName }}</h3>
              <el-tag size="small">{{ consultation.type === 'text' ? '图文咨询' : '视频咨询' }}</el-tag>
            </div>
          </div>
          <el-tag :type="consultation.status === 'active' ? 'success' : 'info'">
            {{ consultation.status === 'active' ? '进行中' : '已完成' }}
          </el-tag>
        </div>
      </template>
      <div class="messages-container">
        <div v-for="msg in consultation.messages" :key="msg.id" class="message-item" :class="msg.senderType">
          <el-avatar :src="msg.senderType === 'expert' ? consultation.expertAvatar : ''" />
          <div class="message-content">
            <div class="message-bubble" :class="msg.senderType">
              <p>{{ msg.content }}</p>
              <div v-if="msg.images && msg.images.length > 0" class="message-images">
                <el-image v-for="(img, idx) in msg.images" :key="idx" :src="img" class="message-image" />
              </div>
            </div>
            <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div v-if="consultation.status === 'active'" class="input-area">
        <el-input v-model="messageContent" type="textarea" :rows="3" placeholder="输入消息..." />
        <div class="input-actions">
          <el-button @click="sendMessage">发送</el-button>
          <el-button v-if="consultation.status === 'active'" @click="endConsultation">结束咨询</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchConsultationById, sendMessage, endConsultation } from '@/services/serviceService'
import type { Consultation } from '@/services/serviceService'

const route = useRoute()
const consultation = ref<Consultation>({
  id: '',
  type: 'text',
  expertId: '',
  expertName: '',
  expertAvatar: '',
  petId: '',
  petName: '',
  status: 'pending',
  messages: [],
  createdAt: '',
})
const messageContent = ref('')

const loadConsultation = async () => {
  try {
    const id = route.params.id as string
    const res = await fetchConsultationById(id)
    consultation.value = res.data
  } catch (error) {
    console.error('加载咨询详情失败:', error)
  }
}

const sendMessageHandler = async () => {
  if (!messageContent.value.trim()) return
  try {
    await sendMessage(consultation.value.id, { content: messageContent.value })
    messageContent.value = ''
    loadConsultation()
  } catch (error) {
    console.error('发送消息失败:', error)
  }
}

const endConsultationHandler = async () => {
  try {
    await endConsultation(consultation.value.id)
    loadConsultation()
  } catch (error) {
    console.error('结束咨询失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadConsultation()
})
</script>

<style scoped lang="scss">
.consultation-detail-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expert-info {
  display: flex;
  align-items: center;
  gap: 12px;
  h3 {
    margin: 0 0 4px;
  }
}

.messages-container {
  max-height: 600px;
  overflow-y: auto;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  &.user {
    flex-direction: row-reverse;
  }
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  &.user {
    align-items: flex-end;
  }
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 70%;
  &.expert {
    background: white;
    align-self: flex-start;
  }
  &.user {
    background: #409eff;
    color: white;
    align-self: flex-end;
  }
  p {
    margin: 0;
  }
}

.message-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  .message-image {
    width: 100px;
    height: 100px;
  }
}

.message-time {
  font-size: 12px;
  color: #999;
}

.input-area {
  margin-top: 24px;
  .input-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }
}
</style>
