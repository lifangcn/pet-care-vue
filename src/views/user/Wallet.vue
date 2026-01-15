<template>
  <div class="wallet-page">
    <el-card class="wallet-card">
      <div class="wallet-header">
        <div class="balance-section">
          <h3>账户余额</h3>
          <p class="amount">¥{{ wallet.balance.toFixed(2) }}</p>
          <el-button type="primary" @click="showRechargeDialog = true">充值</el-button>
        </div>
        <div class="points-section">
          <h3>积分</h3>
          <p class="amount">{{ wallet.points }}</p>
          <el-button type="text" disabled>积分商城</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="tabs-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="余额明细" name="balance" />
        <el-tab-pane label="积分记录" name="points" />
      </el-tabs>
      <div class="transaction-list">
        <el-empty v-if="transactions.length === 0" description="暂无记录" />
        <div v-for="item in transactions" :key="item.id" class="transaction-item">
          <div class="transaction-info">
            <h4>{{ item.description }}</h4>
            <span class="time">{{ formatTime(item.createdAt) }}</span>
          </div>
          <div class="transaction-amount" :class="item.type.includes('consume') || item.type.includes('refund') ? 'negative' : 'positive'">
            {{ item.type.includes('consume') || item.type.includes('refund') ? '-' : '+' }}¥{{ item.amount.toFixed(2) }}
          </div>
        </div>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadTransactions"
      />
    </el-card>

    <el-dialog v-model="showRechargeDialog" title="充值" width="400px">
      <el-form :model="rechargeForm" label-width="80px">
        <el-form-item label="充值金额">
          <el-input-number v-model="rechargeForm.amount" :min="10" :max="10000" :step="10" />
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="rechargeForm.paymentMethod">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRechargeDialog = false">取消</el-button>
        <el-button type="primary" @click="handleRecharge">确认充值</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getWallet, recharge, fetchTransactions, fetchPointsHistory } from '@/services/userService'
import type { Wallet, Transaction } from '@/services/userService'

const wallet = ref<Wallet>({ balance: 0, points: 0 })
const activeTab = ref('balance')
const transactions = ref<Transaction[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const showRechargeDialog = ref(false)
const rechargeForm = ref({ amount: 100, paymentMethod: 'alipay' })

const loadWallet = async () => {
  try {
    const res = await getWallet()
    wallet.value = res.data
  } catch (error) {
    console.error('加载钱包失败:', error)
  }
}

const loadTransactions = async () => {
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    let res
    if (activeTab.value === 'balance') {
      res = await fetchTransactions(params)
    } else {
      res = await fetchPointsHistory(params)
    }
    transactions.value = res.data.records || []
    pagination.value.total = res.data.totalRow || 0
  } catch (error) {
    console.error('加载交易记录失败:', error)
  }
}

watch(activeTab, () => {
  pagination.value.page = 1
  loadTransactions()
})

const handleRecharge = async () => {
  try {
    await recharge(rechargeForm.value)
    showRechargeDialog.value = false
    loadWallet()
  } catch (error) {
    console.error('充值失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadWallet()
  loadTransactions()
})
</script>

<style scoped lang="scss">
.wallet-page {
  padding: 24px;
}

.wallet-card {
  margin-bottom: 24px;
}

.wallet-header {
  display: flex;
  gap: 48px;
}

.balance-section,
.points-section {
  flex: 1;
  h3 {
    margin: 0 0 16px;
    color: #666;
  }
  .amount {
    font-size: 32px;
    font-weight: bold;
    color: #409eff;
    margin: 0 0 16px;
  }
}

.tabs-card {
  margin-top: 24px;
}

.transaction-list {
  margin-top: 24px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.transaction-info {
  flex: 1;
  h4 {
    margin: 0 0 8px;
  }
  .time {
    font-size: 12px;
    color: #999;
  }
}

.transaction-amount {
  font-size: 18px;
  font-weight: bold;
  &.positive {
    color: #67c23a;
  }
  &.negative {
    color: #f56c6c;
  }
}
</style>
