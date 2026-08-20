<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <el-avatar :size="100" :src="displayAvatar" class="avatar-preview">
            <el-icon :size="50"><User /></el-icon>
          </el-avatar>
          <el-upload
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
            accept="image/*"
          >
            <div class="avatar-edit">
              <el-icon><Camera /></el-icon>
            </div>
          </el-upload>
        </div>
        <button v-if="stepOneForm.avatar" class="avatar-remove" @click="removeAvatar">
          移除头像
        </button>
      </div>

      <!-- 积分信息卡片 -->
      <div class="points-section">
        <div class="points-main">
          <div class="points-balance">
            <span class="points-label">可用积分</span>
            <span class="points-value">{{ pointsStore.availablePoints }}</span>
          </div>
          <div class="points-level">
            <span class="level-badge">Lv.{{ pointsStore.level.level }}</span>
            <span class="level-title">{{ pointsStore.level.title }}</span>
          </div>
        </div>
        <!-- 等级进度条 -->
        <div class="level-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: pointsStore.level.progress + '%' }"></div>
          </div>
          <div class="progress-text">
            <span v-if="pointsStore.level.level < 10">
              距 Lv.{{ pointsStore.level.level + 1 }} 还需
              {{ pointsStore.level.nextLevelPoints - pointsStore.totalPoints }} 积分
            </span>
            <span v-else>已满级</span>
          </div>
        </div>
        <!-- 操作入口 -->
        <div class="points-actions">
          <div class="points-action-item" @click="showCoupons = !showCoupons">
            <span class="action-count">{{ availableCouponCount }}</span>
            <span class="action-label">代金券</span>
          </div>
          <div class="points-divider"></div>
          <div class="points-action-item" @click="router.push('/points/records')">
            <span class="action-count">明细</span>
            <span class="action-label">积分流水</span>
          </div>
          <div class="points-divider"></div>
          <div class="points-action-item" @click="router.push('/points/grab')">
            <span class="action-count">活动</span>
            <span class="action-label">抢劵</span>
          </div>
        </div>
        <!-- 代金券折叠列表 -->
        <div v-if="showCoupons" class="coupons-panel">
          <!-- 状态筛选 Tab -->
          <div class="coupon-filter-tabs">
            <button
              v-for="tab in couponFilterTabs"
              :key="tab.value"
              class="coupon-filter-tab"
              :class="{ active: couponFilter === tab.value }"
              @click="switchCouponFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
          <div v-if="couponsLoading" class="coupons-empty">加载中...</div>
          <div v-else-if="coupons.length === 0" class="coupons-empty">
            {{ couponFilter === 'ALL' ? '暂无代金券' : '暂无' + couponFilterTabs.find(t => t.value === couponFilter)?.label + '代金券' }}
          </div>
          <div v-for="coupon in coupons" :key="coupon.id" class="coupon-item">
            <div class="coupon-value">
              <span class="coupon-amount">{{ coupon.faceValue }}</span>
              <span class="coupon-unit">积分</span>
            </div>
            <div class="coupon-info">
              <span class="coupon-status" :class="'status-' + coupon.status">
                {{ couponStatusText(coupon.status) }}
              </span>
              <span class="coupon-expire">{{ formatCouponExpire(coupon.endTime) }}</span>
            </div>
            <!-- 未使用的券显示领取按钮 -->
            <button
              v-if="coupon.status === 'UNUSED'"
              class="coupon-redeem-btn"
              :disabled="redeemingId === coupon.id"
              @click="handleRedeem(coupon)"
            >
              {{ redeemingId === coupon.id ? '领取中...' : '领取' }}
            </button>
          </div>
          <!-- 分页 -->
          <div v-if="couponTotal > couponPageSize" class="coupons-pagination">
            <el-pagination
              v-model:current-page="couponPage"
              :page-size="couponPageSize"
              :total="couponTotal"
              layout="prev, pager, next"
              small
              @current-change="loadCoupons"
            />
          </div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <h2>个人信息</h2>

        <div class="form-group">
          <label>昵称</label>
          <el-input v-model="stepOneForm.nickname" placeholder="请输入昵称" />
        </div>

        <div class="form-group">
          <label>地址</label>
          <el-input v-model="stepOneForm.address" placeholder="请输入地址" />
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="router.back()">取消</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { UploadProps, UploadFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Camera } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { usePointsStore } from '@/store/points'
import { updateUserProfile, uploadUserAvatar } from '@/services/userService'
import { fetchPointsCoupons, redeemCoupon } from '@/services/pointsService'
import { getUserAvatar } from '@/utils/avatarUtils'
import type { PointsCoupon, PointsCouponStatus } from '@/types/points'

const router = useRouter()
const authStore = useAuthStore()
const pointsStore = usePointsStore()

const stepOneForm = reactive({
  nickname: '',
  avatar: '',
  address: '',
})

// 积分 & 代金券相关
const showCoupons = ref(false)
const coupons = ref<PointsCoupon[]>([])
const couponsLoading = ref(false)
const couponFilter = ref<'ALL' | PointsCouponStatus>('ALL')
const couponPage = ref(1)
const couponPageSize = 10
const couponTotal = ref(0)
const redeemingId = ref<number | null>(null)

/** 筛选 Tab 配置 */
const couponFilterTabs = [
  { label: '全部', value: 'ALL' as const },
  { label: '可领取', value: 'UNUSED' as const },
  { label: '已使用', value: 'USED' as const },
  { label: '已过期', value: 'EXPIRED' as const },
]

/** 可用代金券数量（从当前列表统计或全量查一次） */
const availableCouponCount = computed(() => {
  if (couponFilter.value === 'UNUSED' || couponFilter.value === 'ALL') {
    return coupons.value.filter(c => c.status === 'UNUSED').length
  }
  return 0
})

/** 代金券状态文案 */
const couponStatusText = (status: PointsCouponStatus) => {
  const map: Record<PointsCouponStatus, string> = { UNUSED: '可领取', USED: '已使用', EXPIRED: '已过期' }
  return map[status]
}

/** 格式化代金券过期时间 */
const formatCouponExpire = (endTime: string) => {
  const date = new Date(endTime)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / 86400000)
  if (days <= 0) return '已过期'
  if (days <= 3) return `${days}天后过期`
  return `${date.getMonth() + 1}/${date.getDate()} 到期`
}

/** 切换代金券筛选状态 */
const switchCouponFilter = (filter: 'ALL' | PointsCouponStatus) => {
  couponFilter.value = filter
  couponPage.value = 1
  loadCoupons()
}

/** 加载代金券列表 */
const loadCoupons = async () => {
  couponsLoading.value = true
  try {
    const params: any = { pageNumber: couponPage.value, pageSize: couponPageSize }
    if (couponFilter.value !== 'ALL') {
      params.status = couponFilter.value
    }
    const { data } = await fetchPointsCoupons(params)
    coupons.value = data?.records || []
    couponTotal.value = data?.total || 0
  } catch (e) {
    console.error('[Profile] 加载代金券失败:', e)
  } finally {
    couponsLoading.value = false
  }
}

/** 领取代金券（兑换积分到账户） */
const handleRedeem = async (coupon: PointsCoupon) => {
  try {
    await ElMessageBox.confirm(
      `确认领取该代金券？将获得 ${coupon.faceValue} 积分`,
      '领取代金券',
      { confirmButtonText: '确认领取', cancelButtonText: '取消', type: 'info' }
    )
  } catch {
    return // 用户取消
  }

  redeemingId.value = coupon.id
  try {
    await redeemCoupon(coupon.id)
    // 本地更新积分
    pointsStore.addPoints(coupon.faceValue)
    ElMessage.success(`领取成功，${coupon.faceValue} 积分已到账`)
    // 刷新券列表
    loadCoupons()
    // 强制刷新积分账户（确保与后端同步）
    pointsStore.fetchAccount(true)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '领取失败，请稍后重试')
  } finally {
    redeemingId.value = null
  }
}

const displayAvatar = computed(() => {
  const username = stepOneForm.nickname || authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(stepOneForm.avatar, username)
})

const handleAvatarChange = async (file: UploadFile) => {
  if (!file.raw) return
  try {
    const { data } = await uploadUserAvatar(file.raw)
    const url = typeof data === 'string' ? data : (data.avatar || data.url || '')
    stepOneForm.avatar = url
    if (authStore.user) {
      authStore.user.avatar = url
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    ElMessage.success('头像上传成功')
  } catch (e) {
    ElMessage.error('头像上传失败')
  }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const removeAvatar = () => {
  stepOneForm.avatar = ''
  ElMessage.success('已移除头像')
}

onMounted(async () => {
  if (authStore.user) {
    stepOneForm.nickname = authStore.user.nickname || ''
    stepOneForm.avatar = authStore.user.avatar || ''
    stepOneForm.address = authStore.user.address || ''
  }
  // 先加载代金券，再强制刷新积分账户，刷新完成后重新加载券状态
  await loadCoupons()
  try {
    await pointsStore.fetchAccountWithRetry()
  } catch (error) {
    console.error('[Profile] 刷新积分账户失败:', error)
  }
  await loadCoupons()
})

const handleSubmit = async () => {
  try {
    await updateUserProfile({
      nickname: stepOneForm.nickname || undefined,
      avatar: stepOneForm.avatar || undefined,
      address: stepOneForm.address || undefined,
    })
    if (authStore.user) {
      authStore.user.nickname = stepOneForm.nickname || authStore.user.nickname
      authStore.user.avatar = stepOneForm.avatar || authStore.user.avatar
      authStore.user.address = stepOneForm.address || authStore.user.address
      // 同步到 localStorage，防止刷新后丢失
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
    ElMessage.success('保存成功')
    router.back()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.profile-page {
  min-height: 100vh;
  background: #F5F0E8;
  padding: 20px;
}

.profile-container {
  max-width: 480px;
  margin: 0 auto;
}

// 头像区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 20px;
  background: linear-gradient(135deg, #FF8A4C 0%, #FFB380 100%);
  border-radius: 20px;
  margin-bottom: 20px;

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

.avatar-wrapper {
  position: relative;
  z-index: 1;

  .avatar-preview {
    border: 4px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.avatar-edit {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  @include anim.anim-standard;

  &:hover {
    transform: scale(1.1);
  }

  .el-icon {
    color: pet.$pet-primary;
    font-size: 16px;
  }
}

.avatar-remove {
  position: relative;
  z-index: 1;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  @include anim.anim-standard;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
  }
}

// 积分信息卡片
.points-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;

  // 装饰性噪点纹理
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FF8A4C 0%, #FFB380 50%, #81B29A 100%);
    border-radius: 16px 16px 0 0;
  }
}

.points-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-top: 4px;
}

.points-balance {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .points-label {
    font-size: 12px;
    color: pet.$pet-warm-gray;
  }

  .points-value {
    font-size: 32px;
    font-weight: 700;
    font-family: vars.$font-family-number;
    color: vars.$pet-charcoal;
    line-height: 1.1;
  }
}

.points-level {
  display: flex;
  align-items: center;
  gap: 8px;

  .level-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    background: linear-gradient(135deg, #FF8A4C, #FFB380);
    border-radius: 20px;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    font-family: vars.$font-family-number;
  }

  .level-title {
    font-size: 14px;
    font-weight: 500;
    color: vars.$pet-charcoal;
  }
}

.level-progress {
  margin-bottom: 16px;

  .progress-bar {
    height: 6px;
    background: #F0EDE8;
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF8A4C, #FFB380);
    border-radius: 3px;
    @include anim.anim-standard(400ms);
  }

  .progress-text {
    margin-top: 6px;
    font-size: 11px;
    color: pet.$pet-warm-gray;
    text-align: right;
  }
}

.points-actions {
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 14px;
}

.points-action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  @include anim.anim-standard;

  &:hover {
    transform: translateY(-1px);
  }

  .action-count {
    font-size: 16px;
    font-weight: 600;
    color: vars.$pet-charcoal;
  }

  .action-label {
    font-size: 11px;
    color: pet.$pet-warm-gray;
  }
}

.points-divider {
  width: 1px;
  height: 28px;
  background: rgba(0, 0, 0, 0.06);
}

// 代金券面板
.coupons-panel {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
  animation: scaleIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

// 代金券筛选 Tab
.coupon-filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.coupon-filter-tab {
  padding: 5px 14px;
  border: none;
  background: #F5F0E8;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: pet.$pet-warm-gray;
  cursor: pointer;
  @include anim.anim-standard;

  &.active {
    background: linear-gradient(135deg, #FF8A4C, #FFB380);
    color: #fff;
    box-shadow: 0 2px 8px rgba(255, 138, 76, 0.25);
  }

  &:hover:not(.active) {
    background: #EDE8DF;
    color: vars.$pet-charcoal;
  }
}

.coupons-empty {
  text-align: center;
  color: pet.$pet-warm-gray;
  font-size: 13px;
  padding: 12px 0;
}

.coupon-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, #FFFBF7 0%, #FFF8F0 100%);
  border: 1px solid rgba(255, 138, 76, 0.15);
  border-radius: 10px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.coupon-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;

  .coupon-amount {
    font-size: 22px;
    font-weight: 700;
    font-family: vars.$font-family-number;
    color: #FF8A4C;
  }

  .coupon-unit {
    font-size: 11px;
    color: pet.$pet-warm-gray;
  }
}

.coupon-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin: 0 10px;

  .coupon-status {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 10px;

    &.status-UNUSED {
      color: #81B29A;
      background: rgba(129, 178, 154, 0.12);
    }

    &.status-USED {
      color: pet.$pet-warm-gray;
      background: rgba(0, 0, 0, 0.04);
    }

    &.status-EXPIRED {
      color: #C4C4C4;
      background: rgba(0, 0, 0, 0.03);
    }
  }

  .coupon-expire {
    font-size: 11px;
    color: pet.$pet-warm-gray;
  }
}

// 领取按钮
.coupon-redeem-btn {
  flex-shrink: 0;
  padding: 6px 16px;
  border: none;
  background: linear-gradient(135deg, #81B29A, #A8D5BA);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  @include anim.anim-standard;

  &:hover:not(:disabled) {
    box-shadow: 0 3px 10px rgba(129, 178, 154, 0.4);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 代金券分页
.coupons-pagination {
  display: flex;
  justify-content: center;
  margin-top: 12px;

  :deep(.el-pagination) {
    .el-pager li {
      border-radius: 6px;
      min-width: 28px;
      height: 28px;

      &.is-active {
        background: #FF8A4C;
      }
    }
  }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scaleY(0.9); transform-origin: top; }
  to { opacity: 1; transform: scaleY(1); }
}

// 表单区域
.form-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  h2 {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: vars.$pet-charcoal;
  }
}

.form-group {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: vars.$pet-charcoal;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      &.is-focus {
        box-shadow: 0 0 0 2px rgba(255, 138, 76, 0.2);
      }
    }
  }
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;

  :deep(.el-button) {
    flex: 1;
    height: 42px;
    border-radius: 10px;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 12px;
  }

  .avatar-section {
    padding: 24px 20px;
  }

  .form-section {
    padding: 16px;
  }

  .points-section {
    padding: 16px;
  }
}
</style>
