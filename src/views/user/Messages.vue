<template>
  <div class="messages-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>消息中心</h2>
          <el-button type="primary" @click="markAllAsRead">全部已读</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="系统通知" name="system" />
        <el-tab-pane label="订单通知" name="order" />
      </el-tabs>
      <div class="message-list">
        <el-empty v-if="messages.length === 0" description="暂无消息" />
        <div v-for="msg in messages" :key="msg.id" class="message-item" :class="{ unread: !msg.read }">
          <div class="message-content">
            <h4>{{ msg.title }}</h4>
            <p>{{ msg.content }}</p>
            <span class="time">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <div class="message-actions">
            <el-button v-if="!msg.read" type="text" @click="markAsRead(msg.id)">标记已读</el-button>
            <el-button type="text" @click="deleteMsg(msg.id)">删除</el-button>
          </div>
        </div>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadMessages"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchMessages, markMessageAsRead, markAllAsRead, deleteMessage } from '@/services/userService'
import type { Message } from '@/services/userService'

const activeTab = ref('all')
const messages = ref<Message[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadMessages = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }
    const res = await fetchMessages(params)
    messages.value = res.data.records || []
    pagination.value.total = res.data.totalRow || 0
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  loadMessages()
}

const markAsRead = async (id: string) => {
  try {
    await markMessageAsRead(id)
    loadMessages()
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markAllAsReadHandler = async () => {
  try {
    await markAllAsRead()
    loadMessages()
  } catch (error) {
    console.error('全部已读失败:', error)
  }
}

const deleteMsg = async (id: string) => {
  try {
    await deleteMessage(id)
    loadMessages()
  } catch (error) {
    console.error('删除消息失败:', error)
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  }
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped lang="scss">
.messages-page {
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

.message-list {
  margin-top: 24px;
}

.message-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
  &.unread {
    background: #f0f9ff;
  }
}

.message-content {
  flex: 1;
  h4 {
    margin: 0 0 8px;
  }
  p {
    margin: 0 0 8px;
    color: #666;
  }
  .time {
    font-size: 12px;
    color: #999;
  }
}

.message-actions {
  display: flex;
  gap: 8px;
}
</style>
