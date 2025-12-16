<template>
  <div class="order-list-page">
    <el-card>
      <template #header>
        <h2>我的订单</h2>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="pending_payment" />
        <el-tab-pane label="待发货" name="pending_shipment" />
        <el-tab-pane label="已发货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
      <div class="order-list">
        <el-empty v-if="orders.length === 0" description="暂无订单" />
        <el-card v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
          <div v-for="item in order.items" :key="item.id" class="order-product">
            <el-image :src="item.productImage" class="product-image" />
            <div class="product-info">
              <h4 @click="$router.push(`/mall/products/${item.productId}`)">{{ item.productName }}</h4>
              <p class="spec">{{ item.spec }}</p>
            </div>
            <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
            <div class="product-quantity">x{{ item.quantity }}</div>
          </div>
          <div class="order-footer">
            <span class="order-time">下单时间：{{ formatTime(order.createdAt) }}</span>
            <div class="order-actions">
              <span class="total-amount">合计：¥{{ order.totalAmount.toFixed(2) }}</span>
              <el-button v-if="order.status === 'pending_payment'" @click="payOrder(order.id)">去付款</el-button>
              <el-button v-if="order.status === 'pending_payment'" @click="cancelOrder(order.id)">取消订单</el-button>
              <el-button v-if="order.status === 'shipped'" @click="confirmReceipt(order.id)">确认收货</el-button>
              <el-button v-if="order.status === 'completed'" @click="$router.push(`/orders/${order.id}`)">查看详情</el-button>
            </div>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadOrders"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchOrders, cancelOrder, payOrder, confirmReceipt } from '@/services/mallService'
import type { Order } from '@/services/mallService'

const activeTab = ref('all')
const orders = ref<Order[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadOrders = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await fetchOrders(params)
    orders.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  loadOrders()
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: 'warning',
    pending_shipment: 'info',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending_payment: '待付款',
    pending_shipment: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
  }
  return map[status] || status
}

const cancelOrderHandler = async (id: string) => {
  try {
    await cancelOrder(id)
    loadOrders()
  } catch (error) {
    console.error('取消订单失败:', error)
  }
}

const payOrderHandler = async (id: string) => {
  try {
    await payOrder(id, { paymentMethod: 'alipay' })
    loadOrders()
  } catch (error) {
    console.error('支付失败:', error)
  }
}

const confirmReceiptHandler = async (id: string) => {
  try {
    await confirmReceipt(id)
    loadOrders()
  } catch (error) {
    console.error('确认收货失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.order-list-page {
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
    .order-no {
      color: #666;
    }
  }
}

.order-product {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  .product-image {
    width: 80px;
    height: 80px;
  }
  .product-info {
    flex: 1;
    h4 {
      margin: 0 0 8px;
      cursor: pointer;
      &:hover {
        color: #409eff;
      }
    }
    .spec {
      margin: 0;
      color: #666;
      font-size: 12px;
    }
  }
  .product-price {
    font-weight: bold;
    min-width: 80px;
    text-align: right;
  }
  .product-quantity {
    min-width: 60px;
    text-align: right;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  .order-time {
    color: #666;
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
</style>
