<template>
  <div class="order-detail-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>订单详情</h2>
          <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
        </div>
      </template>
      <div class="order-info">
        <div class="info-section">
          <h3>订单信息</h3>
          <p>订单号：{{ order.orderNo }}</p>
          <p>下单时间：{{ formatTime(order.createdAt) }}</p>
          <p v-if="order.paidAt">支付时间：{{ formatTime(order.paidAt) }}</p>
          <p v-if="order.shippedAt">发货时间：{{ formatTime(order.shippedAt) }}</p>
          <p v-if="order.completedAt">完成时间：{{ formatTime(order.completedAt) }}</p>
        </div>
        <div class="info-section">
          <h3>收货信息</h3>
          <p>{{ order.address.name }} {{ order.address.phone }}</p>
          <p>{{ order.address.address }}</p>
        </div>
      </div>
      <div class="products-section">
        <h3>商品列表</h3>
        <div v-for="item in order.items" :key="item.id" class="product-item">
          <el-image :src="item.productImage" class="product-image" />
          <div class="product-info">
            <h4 @click="$router.push(`/mall/products/${item.productId}`)">{{ item.productName }}</h4>
            <p class="spec">{{ item.spec }}</p>
          </div>
          <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
          <div class="product-quantity">x{{ item.quantity }}</div>
          <div class="product-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
        </div>
      </div>
      <div class="order-summary">
        <div class="summary-row">
          <span>商品总额</span>
          <span>¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>实付金额</span>
          <span>¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <div class="order-actions">
        <el-button v-if="order.status === 'PENDING_PAYMENT'" type="primary" @click="payOrder">去付款</el-button>
        <el-button v-if="order.status === 'PENDING_PAYMENT'" @click="cancelOrder">取消订单</el-button>
        <el-button v-if="order.status === 'SHIPPED'" type="primary" @click="confirmReceipt">确认收货</el-button>
        <el-button v-if="order.status === 'COMPLETED'" @click="applyRefund">申请退款</el-button>
        <el-button v-if="order.status === 'COMPLETED'" @click="showReview = true">评价</el-button>
      </div>
    </el-card>

    <el-dialog v-model="showReview" title="评价" width="600px">
      <div v-for="item in order.items" :key="item.id" class="review-item">
        <el-image :src="item.productImage" class="review-image" />
        <div class="review-form">
          <h4>{{ item.productName }}</h4>
          <el-rate v-model="reviewForm[item.id].rating" />
          <el-input v-model="reviewForm[item.id].content" type="textarea" placeholder="请输入评价内容" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showReview = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchOrderById, cancelOrder, payOrder, confirmReceipt, applyRefund, createOrderReview } from '@/services/mallService'
import type { Order } from '@/services/mallService'

const route = useRoute()
const router = useRouter()
const order = ref<Order>({
  id: '',
  orderNo: '',
  status: 'PENDING_PAYMENT',
  totalAmount: 0,
  items: [],
  address: { name: '', phone: '', address: '' },
  createdAt: '',
})
const showReview = ref(false)
const reviewForm = reactive<Record<string, { rating: number; content: string }>>({})

const loadOrder = async () => {
  try {
    const id = route.params.id as string
    const res = await fetchOrderById(id)
    order.value = res.data
    order.value.items.forEach(item => {
      reviewForm[item.id] = { rating: 5, content: '' }
    })
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    PENDING_PAYMENT: 'warning',
    PENDING_SHIPMENT: 'info',
    SHIPPED: 'primary',
    COMPLETED: 'success',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING_PAYMENT: '待付款',
    PENDING_SHIPMENT: '待发货',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
  }
  return map[status] || status
}

const payOrderHandler = async () => {
  try {
    await payOrder(order.value.id, { paymentMethod: 'alipay' })
    loadOrder()
  } catch (error) {
    console.error('支付失败:', error)
  }
}

const cancelOrderHandler = async () => {
  try {
    await cancelOrder(order.value.id)
    loadOrder()
  } catch (error) {
    console.error('取消订单失败:', error)
  }
}

const confirmReceiptHandler = async () => {
  try {
    await confirmReceipt(order.value.id)
    loadOrder()
  } catch (error) {
    console.error('确认收货失败:', error)
  }
}

const applyRefundHandler = async () => {
  try {
    await applyRefund(order.value.id, { reason: '不满意' })
    loadOrder()
  } catch (error) {
    console.error('申请退款失败:', error)
  }
}

const submitReview = async () => {
  try {
    const items = order.value.items.map(item => ({
      itemId: item.id,
      rating: reviewForm[item.id].rating,
      content: reviewForm[item.id].content,
    }))
    await createOrderReview(order.value.id, { items })
    showReview.value = false
    loadOrder()
  } catch (error) {
    console.error('提交评价失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped lang="scss">
.order-detail-page {
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

.order-info {
  display: flex;
  gap: 48px;
  margin-bottom: 32px;
}

.info-section {
  flex: 1;
  h3 {
    margin: 0 0 16px;
  }
  p {
    margin: 8px 0;
    color: #666;
  }
}

.products-section {
  margin-bottom: 32px;
  h3 {
    margin: 0 0 16px;
  }
}

.product-item {
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
  .product-price,
  .product-quantity,
  .product-total {
    min-width: 80px;
    text-align: right;
  }
  .product-total {
    font-weight: bold;
    color: #f56c6c;
  }
}

.order-summary {
  margin-bottom: 32px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    &.total {
      font-size: 18px;
      font-weight: bold;
      color: #f56c6c;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
    }
  }
}

.order-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.review-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  .review-image {
    width: 60px;
    height: 60px;
  }
  .review-form {
    flex: 1;
    h4 {
      margin: 0 0 8px;
    }
  }
}
</style>
