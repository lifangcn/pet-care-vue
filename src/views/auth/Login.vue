<template>
  <div class="login-page">
    <!-- 左侧视觉区 -->
    <div class="visual-panel">
      <div class="image-slider">
        <div
          v-for="(image, index) in petImages"
          :key="index"
          class="slide"
          :class="{ active: currentIndex === index }"
        >
          <img :src="image.url" :alt="image.name" class="slide-image" />
        </div>
        <div class="slide-overlay"></div>
      </div>

      <div class="visual-content">
        <h1 class="visual-title">PetCare</h1>
        <p class="visual-subtitle">记录毛孩子的每一个美好瞬间</p>
      </div>

      <div class="slide-indicators">
        <span
          v-for="(_, index) in petImages"
          :key="index"
          class="indicator"
          :class="{ active: currentIndex === index }"
          @click="currentIndex = index"
        ></span>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="form-panel">
      <div class="form-wrapper">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p>登录后继续使用</p>
        </div>

        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane label="手机号登录" name="phone">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model.trim="form.phone" placeholder="请输入手机号" size="large">
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="code">
                <el-input v-model="form.code" placeholder="请输入验证码" size="large">
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                  <template #append>
                    <el-button
                      :disabled="countdown > 0 || sending"
                      :loading="sending"
                      type="primary"
                      link
                      @click="sendCode"
                    >
                      {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-button type="primary" class="login-btn" size="large" @click="handleLogin">登录</el-button>
              <p class="login-tip">公测期间，验证码将以弹窗形式展示，无需真实短信</p>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="微信登录" name="wechat">
            <div class="wechat-login">
              <div v-if="qrCodeUrl" class="qrcode-container">
                <div class="qrcode-wrapper">
                  <img :src="qrCodeUrl" alt="微信登录二维码" class="qrcode-image" />
                  <div v-if="scanStatus === 'SCANNED'" class="qrcode-overlay">
                    <div class="scan-tip">请在手机上确认登录</div>
                  </div>
                  <div v-if="scanStatus === 'EXPIRED'" class="qrcode-overlay expired">
                    <div class="expired-tip">二维码已过期</div>
                    <el-button type="primary" size="small" @click="generateQRCode">刷新</el-button>
                  </div>
                </div>
                <p class="qrcode-tip">用微信扫一扫登录</p>
              </div>
              <div v-else class="qrcode-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                <p>正在生成二维码...</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Lock, Message, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import type { LoginForm } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const form = reactive<LoginForm>({
  phone: '',
  code: '',
})

const phonePattern = /^1[3-9]\d{9}$/
const countdown = ref(0)
const sending = ref(false)
let timer: number | null = null

const activeTab = ref('phone')
const qrCodeUrl = ref('')
const ticket = ref('')
const scanStatus = ref<'WAITING' | 'SCANNED' | 'CONFIRMED' | 'EXPIRED'>('WAITING')
let scanTimer: number | null = null

// 图片轮播
const currentIndex = ref(0)
const petImages = [
  { url: '/images/golden-retriever.png', name: '金毛' },
  { url: '/images/shiba.jpg', name: '柴犬' },
  { url: '/images/samoyed.jpg', name: '萨摩耶' }
]
let carouselTimer: number | null = null

const startCarousel = () => {
  carouselTimer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % petImages.length
  }, 5000)
}

const validatePhone = (_: unknown, value: string, callback: (error?: Error) => void) => {
  const phone = value?.trim()
  if (!phone) {
    callback(new Error('请输入手机号'))
  } else if (!phonePattern.test(phone)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules: FormRules<LoginForm> = {
  phone: [{ required: true, validator: validatePhone, trigger: ['blur', 'change'] }],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' },
  ],
}

const sendCode = async () => {
  if (countdown.value > 0 || sending.value) {
    return
  }

  const phone = form.phone?.trim()
  if (!phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!phonePattern.test(phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  try {
    sending.value = true
    await authStore.sendCode(phone)
    countdown.value = 60
    timer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (error) {
  } finally {
    sending.value = false
  }
}

const generateQRCode = async () => {
  try {
    qrCodeUrl.value = ''
    scanStatus.value = 'WAITING'
    const data = await authStore.getWechatQRCode()
    qrCodeUrl.value = data.qrcodeUrl
    ticket.value = data.ticket
    startScanPolling()
  } catch (error) {
  }
}

const startScanPolling = () => {
  if (scanTimer) {
    clearInterval(scanTimer)
  }
  scanTimer = window.setInterval(async () => {
    if (!ticket.value) return
    try {
      const data = await authStore.checkWechatScanStatus(ticket.value)
      const status = data.status?.toUpperCase() || data.status
      scanStatus.value = status as any
      if (status === 'CONFIRMED') {
        if (scanTimer) {
          clearInterval(scanTimer)
          scanTimer = null
        }
        router.push({ name: 'dashboard' })
      } else if (status === 'EXPIRED') {
        if (scanTimer) {
          clearInterval(scanTimer)
          scanTimer = null
        }
      }
    } catch (error: any) {
      if (error.message?.includes('过期') || error.message?.includes('expired') || error.message?.includes('EXPIRED')) {
        scanStatus.value = 'EXPIRED'
        if (scanTimer) {
          clearInterval(scanTimer)
          scanTimer = null
        }
      }
    }
  }, 2000)
}

watch(activeTab, (newTab) => {
  if (newTab === 'wechat' && !qrCodeUrl.value) {
    generateQRCode()
  } else if (newTab === 'phone' && scanTimer) {
    clearInterval(scanTimer)
    scanTimer = null
  }
})

onMounted(() => {
  startCarousel()
  if (activeTab.value === 'wechat') {
    generateQRCode()
  }
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (scanTimer) clearInterval(scanTimer)
  if (carouselTimer) clearInterval(carouselTimer)
})

const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await authStore.login({
      phone: form.phone.trim(),
      code: form.code,
    })
    router.push({ name: 'dashboard' })
  } catch (error) {
  }
}

watch(
  () => form.phone,
  (value) => {
    const phone = value?.trim()
    if (!phone) return
    if (phonePattern.test(phone)) {
      formRef.value?.clearValidate('phone')
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 62% 38%;
  background: #F5F0E8;
}

// 左侧视觉区
.visual-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 48px;
  overflow: hidden;
}

.image-slider {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;

  &.active {
    opacity: 1;
  }
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  // 避免裁掉主体（如金毛头部），优先展示图片上半部分
  object-position: 50% 0;
}

.slide-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.5) 100%);
}

.visual-content {
  position: relative;
  z-index: 1;
  color: #fff;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.visual-title {
  font-size: 52px;
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -1px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.visual-subtitle {
  font-size: 18px;
  margin: 0;
  opacity: 0.95;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.slide-indicators {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 10px;
  margin-top: 32px;
}

.indicator {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;

  &.active {
    width: 60px;
    background: #fff;
  }
}

// 右侧登录区
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: #fff;
}

.form-wrapper {
  width: 100%;
  max-width: 380px;
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}

.form-header {
  margin-bottom: 32px;

  h2 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px;
    color: vars.$pet-charcoal;
  }

  p {
    font-size: 14px;
    color: pet.$pet-warm-gray;
    margin: 0;
  }
}

.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 28px;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
  }

  // 输入框 icon 色彩呼应
  :deep(.el-input__prefix) {
    .el-icon {
      color: #D4A373;
    }
  }

  :deep(.el-input:focus-within) {
    .el-input__prefix {
      .el-icon {
        color: #E07A5F;
      }
    }
  }
}

.login-btn {
  width: 100%;
  font-size: 15px;
  margin-top: 8px;
  // Claymorphism 效果
  border-radius: 14px;
  border: 3px solid rgba(224, 122, 95, 0.3);
  background: linear-gradient(145deg, #E8906A, #D87050);
  box-shadow:
    inset -2px -2px 8px rgba(0, 0, 0, 0.1),
    inset 2px 2px 8px rgba(255, 255, 255, 0.3),
    4px 4px 12px rgba(224, 122, 95, 0.25);
  transition: all 200ms ease-out;

  &:hover {
    box-shadow:
      inset -2px -2px 8px rgba(0, 0, 0, 0.1),
      inset 2px 2px 8px rgba(255, 255, 255, 0.3),
      6px 6px 16px rgba(224, 122, 95, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    box-shadow:
      inset 2px 2px 8px rgba(0, 0, 0, 0.15),
      inset -2px -2px 8px rgba(255, 255, 255, 0.1),
      2px 2px 6px rgba(224, 122, 95, 0.2);
    transform: scale(0.98) translateY(1px);
  }
}

.login-tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: pet.$pet-warm-gray;
  line-height: 1.5;
}

// 微信登录
.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.qrcode-container {
  text-align: center;
}

.qrcode-wrapper {
  position: relative;
  display: inline-block;
  padding: 12px;
  background: #fafafa;
  border: 1px solid pet.$pet-border-color;
  border-radius: 12px;
}

.qrcode-image {
  width: 180px;
  height: 180px;
  display: block;
}

.qrcode-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.qrcode-overlay.expired {
  background: rgba(255, 255, 255, 0.98);
}

.scan-tip {
  color: pet.$pet-primary;
  font-size: 14px;
  font-weight: 500;
}

.expired-tip {
  color: #f56c6c;
  font-size: 14px;
  margin-bottom: 12px;
}

.qrcode-tip {
  margin-top: 16px;
  color: pet.$pet-warm-gray;
  font-size: 13px;
}

.qrcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: pet.$pet-warm-gray;

  .el-icon {
    font-size: 28px;
    margin-bottom: 12px;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式
@media (max-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .visual-panel {
    min-height: 45vh;
    padding: 32px;
  }

  .visual-title {
    font-size: 36px;
  }

  .visual-subtitle {
    font-size: 15px;
  }

  .form-panel {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .visual-panel {
    min-height: 35vh;
    padding: 24px;
  }

  .visual-title {
    font-size: 28px;
  }

  .slide-indicators {
    display: none;
  }

  .form-panel {
    padding: 24px 20px;
  }

  .form-wrapper {
    max-width: 100%;
  }
}
</style>
