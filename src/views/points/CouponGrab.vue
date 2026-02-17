<template>
  <div class="grab-page">
    <div class="grab-container">
      <!-- 活动头图区域 -->
      <div class="grab-hero">
        <div class="hero-content">
          <h1 class="hero-title">限时抢劵</h1>
          <p class="hero-desc">手快有，手慢无</p>
        </div>
        <div class="hero-deco"></div>
      </div>

      <!-- 活动规则 -->
      <div class="grab-rules">
        <h3 class="rules-title">活动规则</h3>
        <ul class="rules-list">
          <li>每张券限领指定次数，先到先得</li>
          <li>抢到后自动进入券包，请在有效期内领取使用</li>
          <li>代金券领取后积分直接到账，不可撤回</li>
        </ul>
      </div>

      <!-- 加载态 -->
      <div v-if="loading" class="grab-loading">加载中...</div>

      <!-- 无活动 -->
      <div v-else-if="templates.length === 0" class="grab-empty">
        暂无可抢的券活动
      </div>

      <!-- 券模板列表 -->
      <div v-for="tpl in templates" :key="tpl.id" class="grab-coupon-card">
        <div class="card-left">
          <span class="card-face-value font-number">{{ tpl.faceValue }}</span>
          <span class="card-unit">积分</span>
        </div>
        <div class="card-right">
          <span class="card-label">{{ tpl.name }}</span>
          <span class="card-expire">{{ tpl.validDesc }}</span>
          <span class="card-limit">每人限领 {{ tpl.perUserLimit }} 张</span>
        </div>
        <div class="card-action">
          <!-- 库存进度 -->
          <div class="stock-mini">
            <span v-if="tpl.stock > 0" class="stock-num font-number">剩 {{ tpl.stock }}</span>
            <span v-else class="stock-out">已抢完</span>
          </div>
          <button
            class="grab-btn-sm"
            :class="{ disabled: grabbingId === tpl.id || tpl.stock <= 0 }"
            :disabled="grabbingId === tpl.id || tpl.stock <= 0"
            @click="handleGrab(tpl)"
          >
            {{ grabbingId === tpl.id ? '抢劵中...' : tpl.stock <= 0 ? '已抢完' : '立即抢劵' }}
          </button>
        </div>
      </div>

      <!-- 返回 -->
      <button class="back-link" @click="router.back()">
        返回个人信息
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchCouponTemplates, grabCoupon } from '@/services/pointsService'
import type { CouponTemplate } from '@/types/points'

const router = useRouter()

const templates = ref<CouponTemplate[]>([])
const loading = ref(false)
const grabbingId = ref<number | null>(null)

/** 加载券模板列表 */
const loadTemplates = async () => {
  loading.value = true
  try {
    const { data } = await fetchCouponTemplates()
    templates.value = data || []
  } catch (e) {
    console.error('[CouponGrab] 加载券模板失败:', e)
  } finally {
    loading.value = false
  }
}

/** 抢劵 */
const handleGrab = async (tpl: CouponTemplate) => {
  if (grabbingId.value || tpl.stock <= 0) return

  grabbingId.value = tpl.id
  try {
    await grabCoupon(tpl.id)
    ElMessage.success('抢劵成功，请在券包中查看')
    // 本地扣减库存
    tpl.stock = Math.max(0, tpl.stock - 1)
    // 跳转回个人信息页
    setTimeout(() => {
      router.push('/profile')
    }, 800)
  } catch (e: any) {
    const msg = e?.response?.data?.message || '券已抢完'
    ElMessage.warning(msg)
    if (e?.response?.status === 409 || msg.includes('抢完')) {
      tpl.stock = 0
    }
  } finally {
    grabbingId.value = null
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.grab-page {
  min-height: 100vh;
  background: #F5F0E8;
  padding: 20px;
}

.grab-container {
  max-width: 480px;
  margin: 0 auto;
}

// 活动头图
.grab-hero {
  position: relative;
  padding: 40px 24px 32px;
  background: linear-gradient(145deg, #E07A5F 0%, #FF8A4C 40%, #FFB380 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  overflow: hidden;

  // 噪点纹理
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.05;
    pointer-events: none;
    mix-blend-mode: overlay;
    border-radius: 20px;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.hero-desc {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

// 装饰性圆形
.hero-deco {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.15);
}

// 活动规则
.grab-rules {
  background: #fff;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.rules-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: vars.$pet-charcoal;
}

.rules-list {
  margin: 0;
  padding-left: 18px;
  list-style: none;

  li {
    position: relative;
    padding: 4px 0;
    font-size: 13px;
    color: pet.$pet-warm-gray;
    line-height: 1.6;

    &::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 12px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #FFB380;
    }
  }
}

// 加载态 & 空态
.grab-loading,
.grab-empty {
  text-align: center;
  padding: 48px 20px;
  color: pet.$pet-warm-gray;
  font-size: 14px;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 16px;
}

// 券模板卡片
.grab-coupon-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #FFFBF7 0%, #FFF5EB 100%);
  border: 2px solid rgba(255, 138, 76, 0.2);
  border-radius: 16px;
  margin-bottom: 12px;
  position: relative;

  // 券齿孔装饰（跟随 card-left 右侧）
  &::after {
    content: '';
    position: absolute;
    left: 94px;
    top: 6px;
    bottom: 6px;
    width: 0;
    border-left: 2px dashed rgba(255, 138, 76, 0.15);
  }
}

.card-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  min-width: 70px;
  padding-right: 12px;

  .card-face-value {
    font-size: 32px;
    font-weight: 700;
    color: #FF8A4C;
    line-height: 1;
    white-space: nowrap;
  }

  .card-unit {
    font-size: 12px;
    color: pet.$pet-warm-gray;
    white-space: nowrap;
  }
}

.card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 16px;
  min-width: 0;

  .card-label {
    font-size: 15px;
    font-weight: 600;
    color: vars.$pet-charcoal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-expire {
    font-size: 12px;
    color: pet.$pet-warm-gray;
  }

  .card-limit {
    font-size: 11px;
    color: #C4B8A8;
  }
}

.card-action {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
}

.stock-mini {
  font-size: 11px;

  .stock-num {
    color: #FF8A4C;
    font-weight: 500;
  }

  .stock-out {
    color: #C4C4C4;
  }
}

.grab-btn-sm {
  padding: 8px 18px;
  border: none;
  background: linear-gradient(135deg, #FF8A4C, #E07A5F);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 3px 10px rgba(255, 138, 76, 0.3);
  @include anim.anim-elastic;

  &:hover:not(.disabled) {
    transform: translateY(-1px);
    box-shadow: 0 5px 16px rgba(255, 138, 76, 0.4);
  }

  &:active:not(.disabled) {
    transform: translateY(0);
  }

  &.disabled {
    background: #D4D0C8;
    box-shadow: none;
    cursor: not-allowed;
  }
}

// 返回链接
.back-link {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: none;
  background: transparent;
  color: pet.$pet-warm-gray;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  @include anim.anim-standard;

  &:hover {
    color: #FF8A4C;
  }
}

@media (max-width: 768px) {
  .grab-page {
    padding: 12px;
  }

  .grab-hero {
    padding: 32px 20px 24px;
  }

  .hero-title {
    font-size: 24px;
  }

  .grab-coupon-card {
    padding: 16px;
  }

  .card-left .card-face-value {
    font-size: 26px;
  }
}
</style>
