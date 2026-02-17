<template>
  <div class="points-records-page">
    <div class="records-container">
      <!-- 顶部积分概览条 -->
      <div class="points-overview">
        <div class="overview-balance">
          <span class="overview-label">可用积分</span>
          <span class="overview-value font-number">{{ pointsStore.availablePoints }}</span>
        </div>
        <div class="overview-level">
          <span class="level-badge">Lv.{{ pointsStore.level.level }}</span>
          <span class="level-title">{{ pointsStore.level.title }}</span>
        </div>
      </div>

      <!-- 筛选 Tab -->
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: currentFilter === tab.value }"
          @click="switchFilter(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 流水列表 -->
      <div class="records-list">
        <div v-if="loading && records.length === 0" class="records-loading">
          加载中...
        </div>
        <div v-else-if="records.length === 0" class="records-empty">
          暂无积分记录
        </div>
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
        >
          <div class="record-left">
            <span class="record-type-tag" :class="'type-' + record.actionType">
              {{ actionTypeLabel(record.actionType) }}
            </span>
            <div class="record-detail">
              <span class="record-remark">{{ record.remark || actionTypeLabel(record.actionType) }}</span>
              <span class="record-time">{{ formatTime(record.createdAt) }}</span>
            </div>
          </div>
          <div class="record-points font-number" :class="record.points > 0 ? 'gain' : 'cost'">
            {{ record.points > 0 ? '+' : '' }}{{ record.points }}
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalRecords > pageSize" class="records-pagination">
        <el-pagination
          v-model:current-page="pageNumber"
          :page-size="pageSize"
          :total="totalRecords"
          layout="prev, pager, next"
          small
          @current-change="loadRecords"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePointsStore } from '@/store/points'
import { fetchPointsRecords } from '@/services/pointsService'
import type { PointsRecord, PointsActionType } from '@/types/points'

const pointsStore = usePointsStore()

const records = ref<PointsRecord[]>([])
const loading = ref(false)
const pageNumber = ref(1)
const pageSize = 15
const totalRecords = ref(0)

/** 当前筛选类型：all / gain / cost */
const currentFilter = ref<'all' | 'gain' | 'cost'>('all')

const filterTabs = [
  { label: '全部', value: 'all' as const },
  { label: '获取', value: 'gain' as const },
  { label: '消耗', value: 'cost' as const },
]

/** 行为类型枚举映射 */
const ACTION_TYPE_MAP: Record<PointsActionType, string> = {
  REGISTER: '注册赠送',
  CHECK_IN: '每日签到',
  PUBLISH: '发布内容',
  COMMENT: '评论',
  LIKE: '点赞他人',
  LIKED: '被点赞',
  COMMENTED: '被评论',
  AI_CONSULT: 'AI咨询',
  COUPON_REDEEM: '券兑换',
}

/** 消耗类行为类型 */
const COST_ACTION_TYPES: PointsActionType[] = ['AI_CONSULT', 'COUPON_REDEEM']

/** 获取行为类型文案 */
const actionTypeLabel = (type: PointsActionType): string => {
  return ACTION_TYPE_MAP[type] || '其他'
}

/** 格式化时间 */
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/** 切换筛选 */
const switchFilter = (filter: 'all' | 'gain' | 'cost') => {
  currentFilter.value = filter
  pageNumber.value = 1
  loadRecords()
}

/** 加载积分流水 */
const loadRecords = async () => {
  loading.value = true
  try {
    // 根据筛选 Tab 构建 actionType 参数
    // gain: actionType 0-6（获取类）, cost: actionType 7（消耗类）
    // 简化处理：后端不一定支持 gain/cost 筛选，此处通过 actionType 传递
    const params: any = {
      pageNumber: pageNumber.value,
      pageSize,
    }

    // 如果后端支持按正负筛选，可在此扩展
    // 当前仅传 pageNumber + pageSize，前端不再做额外 actionType 筛选避免接口不支持
    const { data } = await fetchPointsRecords(params)
    const allRecords: PointsRecord[] = data?.records || []

    // 前端筛选 gain / cost
    if (currentFilter.value === 'gain') {
      records.value = allRecords.filter(r => r.points > 0)
    } else if (currentFilter.value === 'cost') {
      records.value = allRecords.filter(r => r.points < 0)
    } else {
      records.value = allRecords
    }

    totalRecords.value = data?.total || 0
  } catch (e) {
    console.error('[PointsRecords] 加载积分流水失败:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  pointsStore.fetchAccount()
  loadRecords()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.points-records-page {
  min-height: 100vh;
  background: #F5F0E8;
  padding: 20px;
}

.records-container {
  max-width: 600px;
  margin: 0 auto;
}

// 顶部积分概览
.points-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(135deg, #FF8A4C 0%, #FFB380 50%, #FFD4A8 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  position: relative;

  // 噪点纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.04;
    pointer-events: none;
    mix-blend-mode: overlay;
    border-radius: 20px;
  }
}

.overview-balance {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .overview-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85);
  }

  .overview-value {
    font-size: 36px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
}

.overview-level {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  .level-badge {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    color: #fff;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .level-title {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
  }
}

// 筛选 Tab
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-tab {
  padding: 8px 20px;
  border: none;
  background: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: pet.$pet-warm-gray;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  @include anim.anim-standard;

  &.active {
    background: linear-gradient(135deg, #FF8A4C, #FFB380);
    color: #fff;
    box-shadow: 0 4px 12px rgba(255, 138, 76, 0.3);
  }

  &:hover:not(.active) {
    background: #FFF5EB;
    color: #FF8A4C;
  }
}

// 流水列表
.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.records-loading,
.records-empty {
  text-align: center;
  padding: 48px 20px;
  color: pet.$pet-warm-gray;
  font-size: 14px;
  background: #fff;
  border-radius: 14px;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  @include anim.anim-standard;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(3px);
  }
}

.record-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.record-type-tag {
  flex-shrink: 0;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;

  // 获取类（绿系）
  &.type-REGISTER, &.type-CHECK_IN, &.type-PUBLISH, &.type-COMMENT,
  &.type-LIKE, &.type-LIKED, &.type-COMMENTED {
    color: #81B29A;
    background: rgba(129, 178, 154, 0.12);
  }
  // 消耗类（红系）
  &.type-AI_CONSULT, &.type-COUPON_REDEEM {
    color: #E07A5F;
    background: rgba(224, 122, 95, 0.1);
  }
}

.record-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  .record-remark {
    font-size: 14px;
    font-weight: 500;
    color: vars.$pet-charcoal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .record-time {
    font-size: 12px;
    color: pet.$pet-warm-gray;
  }
}

.record-points {
  flex-shrink: 0;
  font-size: 16px;
  font-weight: 700;
  margin-left: 12px;

  &.gain {
    color: #81B29A;
  }

  &.cost {
    color: #E07A5F;
  }
}

// 分页
.records-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 8px;

      &.is-active {
        background: #FF8A4C;
      }
    }
  }
}

@media (max-width: 768px) {
  .points-records-page {
    padding: 12px;
  }

  .points-overview {
    padding: 20px;
  }

  .overview-balance .overview-value {
    font-size: 28px;
  }
}
</style>
