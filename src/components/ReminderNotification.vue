<template>
  <div class="notification-wrapper">
    <div v-if="showDebug" class="debug-info">
      <el-tag :type="wsConnected ? 'success' : 'danger'" size="small">
        WebSocket: {{ wsConnected ? '已连接' : '未连接' }}
      </el-tag>
      <el-tag type="info" size="small">通知数: {{ notifications.length }}</el-tag>
    </div>
    <template v-if="notifications.length > 0">
      <el-card
        v-for="notification in notifications"
        :key="String(notification.id)"
        class="reminder-notification"
        shadow="hover"
      >
    <div class="notification-content">
      <div class="notification-header">
        <el-icon class="notification-icon"><Bell /></el-icon>
        <span class="notification-title">{{ notification.title || '提醒' }}</span>
        <el-button
          text
          size="small"
          class="close-btn"
          @click="removeNotification(notification.id)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      <div v-if="notification.description" class="notification-description">
        {{ notification.description }}
      </div>
      <div class="notification-meta">
        <span v-if="notification.petName">宠物：{{ notification.petName }}</span>
        <span v-if="notification.scheduleTime">时间：{{ formatTime(notification.scheduleTime) }}</span>
      </div>
      <div class="notification-actions">
        <el-button v-if="notification.id" size="small" type="primary" @click="handleComplete(notification)">
          已完成
        </el-button>
        <el-button v-if="notification.petId" size="small" @click="handleView(notification)">查看详情</el-button>
      </div>
    </div>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { wsService, type ReminderNotification } from '@/services/websocket'
import { completeReminderExecution } from '@/services/petService'

const router = useRouter()
const notifications = ref<ReminderNotification[]>([])
const showDebug = ref(import.meta.env.DEV)
const wsConnected = computed(() => wsService.isConnected())

const handleReminder = (data: ReminderNotification) => {
  // 生成唯一ID（如果后端没有提供）
  const notificationId = data.id || Date.now() + Math.random()
  const notification: ReminderNotification = {
    id: notificationId,
    reminderId: data.reminderId,
    petId: data.petId,
    petName: data.petName,
    title: data.title || '提醒',
    description: data.description,
    scheduleTime: data.scheduleTime || new Date().toISOString(),
    notificationTime: data.notificationTime || new Date().toISOString(),
    type: data.type || 'REMINDER',
  }
  
  const exists = notifications.value.some(n => n.id === notification.id)
  if (!exists) {
    notifications.value.unshift(notification)
    ElMessage({
      message: notification.title || '您有新的提醒',
      type: 'info',
      duration: 3000,
    })
  }
}

const removeNotification = (id: string | number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const handleComplete = async (notification: ReminderNotification) => {
  if (!notification.id) {
    ElMessage.warning('无法完成：缺少提醒ID')
    return
  }
  try {
    await completeReminderExecution(notification.id)
    ElMessage.success('已标记为完成')
    removeNotification(notification.id)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleView = (notification: ReminderNotification) => {
  if (!notification.petId) {
    ElMessage.warning('无法查看：缺少宠物ID')
    return
  }
  router.push(`/pet/${notification.petId}`)
  if (notification.id) {
    removeNotification(notification.id)
  }
}

const formatTime = (time: string | undefined) => {
  if (!time) return ''
  try {
    return new Date(time).toLocaleString('zh-CN')
  } catch (error) {
    return time
  }
}

onMounted(() => {
  wsService.on('reminder', handleReminder)
  if (!wsService.isConnected()) {
    wsService.connect()
  }
})

onUnmounted(() => {
  wsService.off('reminder', handleReminder)
})
</script>

<style scoped lang="scss">
.reminder-notification {
  margin-bottom: 12px;
  border-left: 4px solid #409eff;
}

.notification-content {
  .notification-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .notification-icon {
      color: #409eff;
      font-size: 18px;
    }
    
    .notification-title {
      flex: 1;
      font-weight: 600;
      font-size: 16px;
    }
    
    .close-btn {
      padding: 4px;
    }
  }
  
  .notification-description {
    margin-bottom: 8px;
    color: #666;
    line-height: 1.5;
  }
  
  .notification-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #999;
  }
  
  .notification-actions {
    display: flex;
    gap: 8px;
  }
}

.notification-wrapper {
  width: 100%;
}

.debug-info {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
}
</style>

