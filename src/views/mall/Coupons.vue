<template>
  <div class="coupons-page">
    <el-card>
      <template #header>
        <h2>优惠券</h2>
      </template>
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="可用" name="available" />
        <el-tab-pane label="已使用" name="used" />
        <el-tab-pane label="已过期" name="expired" />
      </el-tabs>
      <div class="coupon-list">
        <el-empty v-if="coupons.length === 0" description="暂无优惠券" />
        <el-card v-for="coupon in coupons" :key="coupon.id" class="coupon-item" :class="{ used: coupon.used, expired: isExpired(coupon) }">
          <div class="coupon-content">
            <div class="coupon-left">
              <div class="coupon-value">
                <span v-if="coupon.type === 'discount'">{{ coupon.value }}折</span>
                <span v-else>¥{{ coupon.value }}</span>
              </div>
              <div class="coupon-condition">满¥{{ coupon.minAmount }}可用</div>
            </div>
            <div class="coupon-right">
              <h4>{{ coupon.name }}</h4>
              <p>{{ coupon.description }}</p>
              <div class="coupon-time">
                <span>{{ formatDate(coupon.validFrom) }} 至 {{ formatDate(coupon.validTo) }}</span>
              </div>
            </div>
          </div>
          <div class="coupon-actions">
            <el-button v-if="!coupon.used && !isExpired(coupon)" type="primary" @click="useCoupon(coupon)">立即使用</el-button>
            <el-tag v-if="coupon.used" type="success">已使用</el-tag>
            <el-tag v-if="isExpired(coupon) && !coupon.used" type="info">已过期</el-tag>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadCoupons"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCoupons } from '@/services/mallService'
import type { Coupon } from '@/services/mallService'

const router = useRouter()
const activeTab = ref('available')
const coupons = ref<Coupon[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadCoupons = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value === 'available') {
      params.status = 'available'
    } else if (activeTab.value === 'used') {
      params.status = 'used'
    } else {
      params.status = 'expired'
    }
    const res = await fetchCoupons(params)
    coupons.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载优惠券失败:', error)
  }
}

const handleTabChange = () => {
  pagination.value.page = 1
  loadCoupons()
}

const isExpired = (coupon: Coupon) => {
  return new Date(coupon.validTo) < new Date()
}

const useCoupon = (coupon: Coupon) => {
  router.push('/mall')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped lang="scss">
.coupons-page {
  padding: 24px;
}

.coupon-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-item {
  &.used,
  &.expired {
    opacity: 0.6;
  }
}

.coupon-content {
  display: flex;
  gap: 24px;
}

.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  .coupon-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .coupon-condition {
    font-size: 12px;
    opacity: 0.9;
  }
}

.coupon-right {
  flex: 1;
  h4 {
    margin: 0 0 8px;
  }
  p {
    margin: 0 0 8px;
    color: #666;
  }
  .coupon-time {
    font-size: 12px;
    color: #999;
  }
}

.coupon-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
