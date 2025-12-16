<template>
  <div class="service-orders-page">
    <el-card>
      <template #header>
        <h2>服务订单</h2>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待服务" name="pending" />
        <el-tab-pane label="已确认" name="confirmed" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
      <div class="order-list">
        <el-empty v-if="bookings.length === 0" description="暂无服务订单" />
        <el-card v-for="booking in bookings" :key="booking.id" class="order-item">
          <div class="order-header">
            <div class="service-info">
              <h4>{{ booking.services.map(s => s.name).join(', ') }}</h4>
              <p>{{ booking.provider.name }}</p>
            </div>
            <el-tag :type="getStatusType(booking.status)">{{ getStatusText(booking.status) }}</el-tag>
          </div>
          <div class="order-content">
            <p>宠物：{{ booking.petName }}</p>
            <p>预约时间：{{ formatTime(booking.date) }} {{ booking.time }}</p>
            <p>服务地址：{{ booking.provider.address }}</p>
            <p>服务项目：{{ booking.services.map(s => s.name).join(', ') }}</p>
          </div>
          <div class="order-footer">
            <span class="order-time">下单时间：{{ formatTime(booking.createdAt) }}</span>
            <div class="order-actions">
              <span class="total-amount">¥{{ booking.services.reduce((sum, s) => sum + s.price, 0).toFixed(2) }}</span>
              <el-button v-if="booking.status === 'pending'" @click="cancelBooking(booking.id)">取消预约</el-button>
              <el-button v-if="booking.status === 'completed'" @click="showReview(booking)">评价</el-button>
            </div>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadBookings"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchBookings } from '@/services/serviceService'
import type { BookingRecord } from '@/types/service'

const activeTab = ref('all')
const bookings = ref<BookingRecord[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadBookings = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await fetchBookings(params)
    bookings.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载服务订单失败:', error)
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  loadBookings()
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待服务',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || status
}

const cancelBooking = async (id: string) => {
  // TODO: 调用取消预约接口
  loadBookings()
}

const showReview = (booking: BookingRecord) => {
  // TODO: 显示评价对话框
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadBookings()
})
</script>

<style scoped lang="scss">
.service-orders-page {
  padding: 24px;
}

.order-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    .service-info {
      h4 {
        margin: 0 0 4px;
      }
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
  .order-content {
    margin-bottom: 16px;
    p {
      margin: 8px 0;
      color: #666;
    }
  }
  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .order-time {
      color: #666;
      font-size: 12px;
    }
    .order-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      .total-amount {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}
</style>
