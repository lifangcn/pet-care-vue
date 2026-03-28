<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>积分记录</h2>
          <div class="header-actions">
            <el-input
              v-model="userIdFilter"
              placeholder="按用户ID筛选"
              clearable
              style="width: 200px"
              @keyup.enter="loadRecords"
            />
            <el-button type="primary" :icon="Refresh" @click="loadRecords">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="records" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="actionType" label="类型" width="140">
          <template #default="{ row }">
            <el-tag size="small">{{ getActionTypeLabel(row.actionType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分变动" width="120">
          <template #default="{ row }">
            <span :class="row.points > 0 ? 'text-green' : 'text-red'" class="font-number">
              {{ row.points > 0 ? '+' : '' }}{{ row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && records.length === 0" description="暂无积分记录" />

      <el-pagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadRecords"
        @current-change="loadRecords"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchAdminPointsRecords } from '@/services/adminCouponService'

const loading = ref(false)
const records = ref<any[]>([])
const userIdFilter = ref('')
const pageNumber = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadRecords = async () => {
  try {
    loading.value = true
    const params: any = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value
    }
    if (userIdFilter.value) {
      const userId = parseInt(userIdFilter.value)
      if (!isNaN(userId)) {
        params.userId = userId
      }
    }
    const { data } = await fetchAdminPointsRecords(params)
    records.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    ElMessage.error('加载积分记录失败')
    console.error('loadRecords error:', error)
  } finally {
    loading.value = false
  }
}

const getActionTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    REGISTER: '注册赠送',
    CHECK_IN: '每日签到',
    PUBLISH: '发布内容',
    COMMENT: '评论',
    LIKE: '点赞他人',
    LIKED: '被点赞',
    COMMENTED: '被评论',
    AI_CONSULT: 'AI咨询',
    COUPON_REDEEM: '券兑换'
  }
  return map[type] || type
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped lang="scss">
.admin-page {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.text-green {
  color: #67c23a;
  font-weight: 600;
}

.text-red {
  color: #f56c6c;
  font-weight: 600;
}

.font-number {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
</style>
