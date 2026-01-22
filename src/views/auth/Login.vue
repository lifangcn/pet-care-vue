<template>
  <div class="login-page">
    <div class="floating-pets">
      <span class="pet-icon">🐶</span>
      <span class="pet-icon">🐱</span>
      <span class="pet-icon">🐰</span>
      <span class="pet-icon">🐹</span>
    </div>
    <el-container class="login-container">
      <el-aside class="brand-panel">
        <div class="carousel-background">
          <div
            v-for="(image, index) in petImages"
            :key="index"
            class="carousel-slide"
            :class="{ active: currentImageIndex === index }"
          >
            <img
              :src="image.url"
              :alt="image.name"
              class="carousel-image"
              @error="handleImageError"
            />
          </div>
          <div class="carousel-overlay" />
        </div>
        <div class="pet-decorations">
          <span class="pet-emoji">🐶</span>
          <span class="pet-emoji">🐱</span>
          <span class="pet-emoji">🐰</span>
          <span class="pet-emoji">🐹</span>
          <span class="pet-emoji">🐾</span>
          <span class="pet-emoji">💖</span>
        </div>
        <div class="brand-content">
          <div class="brand-logo">PetCare</div>
          <h2>宠物关怀系统</h2>
          <p>智能健康管理 · 专业护理服务 · 宠物社区互联</p>
        </div>
        <div class="carousel-indicators">
          <span
            v-for="(image, index) in petImages"
            :key="index"
            class="indicator"
            :class="{ active: currentImageIndex === index }"
            @click="currentImageIndex = index"
          />
        </div>
      </el-aside>
      <el-main class="form-panel">
        <el-card class="login-card" shadow="hover">
          <div class="card-header">
            <h3>欢迎回来</h3>
            <p>请登录您的宠物关怀账户</p>
          </div>
          <el-tabs v-model="activeTab" class="login-tabs">
            <el-tab-pane label="手机登录" name="phone">
              <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model.trim="form.phone" placeholder="请输入手机号">
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="code">
                  <el-input v-model="form.code" placeholder="请输入验证码">
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
                <el-button type="primary" class="login-btn" @click="handleLogin">登 录</el-button>
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
                      <el-button type="primary" size="small" @click="generateQRCode">刷新二维码</el-button>
                    </div>
                  </div>
                  <p class="qrcode-tip">使用微信扫一扫登录</p>
                </div>
                <div v-else class="qrcode-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <p>正在生成二维码...</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-main>
    </el-container>
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

const currentImageIndex = ref(0)
const petImages = [
  {
    url: '/images/samoyed.jpg',
    name: '萨摩耶'
  },
  {
    url: '/images/shiba.jpg',
    name: '柴犬'
  },
  {
    url: '/images/golden-retriever.jpg',
    name: '金毛'
  }
]
let carouselTimer: number | null = null

const startCarousel = () => {
  carouselTimer = window.setInterval(() => {
    currentImageIndex.value = (currentImageIndex.value + 1) % petImages.length
  }, 5000)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  img.style.display = 'none'
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

/**
 * [API调用] POST /auth/code
 * 发送验证码
 */
const sendCode = async () => {
  // 防止频繁点击：倒计时中或正在发送时直接返回
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
    // [API调用] POST /auth/code - 发送验证码（通过 authStore.sendCode 调用）
    await authStore.sendCode(phone)
    // 开始倒计时
    countdown.value = 60
    timer = window.setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (error) {
    // 错误已在 store 中处理
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
    // 错误已在 store 中处理
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
  if (activeTab.value === 'wechat') {
    generateQRCode()
  }
  startCarousel()
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (scanTimer) clearInterval(scanTimer)
  if (carouselTimer) clearInterval(carouselTimer)
})

/**
 * [API调用] POST /auth/login
 * 处理用户登录
 */
const handleLogin = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    // [API调用] POST /auth/login - 用户登录（通过 authStore.login 调用）
    await authStore.login({
      phone: form.phone.trim(),
      code: form.code,
    })
    // 登录成功后跳转到首页
    router.push({ name: 'dashboard' })
  } catch (error) {
    // 错误已在 store 中处理
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

.login-page {
  min-height: 100vh;
  background:
    radial-gradient(900px 420px at 10% 8%, rgba(255, 209, 166, 0.55), transparent 60%),
    radial-gradient(860px 520px at 92% 12%, rgba(191, 217, 242, 0.45), transparent 60%),
    radial-gradient(900px 520px at 30% 92%, rgba(191, 235, 215, 0.45), transparent 65%),
    linear-gradient(180deg, rgba(255, 251, 247, 1), rgba(255, 248, 240, 1));
  font-family: vars.$font-family-base;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;

  .floating-pets {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .pet-icon {
      position: absolute;
      font-size: 48px;
      opacity: 0.08;
      animation: drift 20s linear infinite;

      &:nth-child(1) {
        top: 15%;
        left: 8%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 60%;
        right: 10%;
        animation-delay: 5s;
      }

      &:nth-child(3) {
        bottom: 20%;
        left: 15%;
        animation-delay: 10s;
      }

      &:nth-child(4) {
        top: 40%;
        right: 5%;
        animation-delay: 15s;
      }
    }
  }

  @keyframes drift {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(30px, -20px) rotate(90deg); }
    50% { transform: translate(-20px, -40px) rotate(180deg); }
    75% { transform: translate(-30px, -20px) rotate(270deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  &::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Cg fill='none' stroke='%23FF8A4C' stroke-opacity='.1' stroke-width='3' stroke-linecap='round'%3E%3Cpath d='M50 100c20-15 45-15 65 0s45 15 65 0 45-15 65 0 45 15 65 0 45-15 65 0'/%3E%3Cpath d='M30 250c25-20 55-20 80 0s55 20 80 0 55-20 80 0 55 20 80 0 55-20 80 0'/%3E%3Cpath d='M60 400c18-18 42-18 60 0s42 18 60 0 42-18 60 0 42 18 60 0 42-18 60 0'/%3E%3C/g%3E%3Cg fill='%23FF8A4C' fill-opacity='.08'%3E%3Cpath d='M150 150c12-12 30-12 42 0s12 30 0 42-30 12-42 0-12-30 0-42z'/%3E%3Cpath d='M350 200c10-10 26-10 36 0s10 26 0 36-26 10-36 0-10-26 0-36z'/%3E%3Cpath d='M200 350c8-8 20-8 28 0s8 20 0 28-20 8-28 0-8-20 0-28z'/%3E%3C/g%3E%3Cg fill='%23FFB3BA' fill-opacity='.06'%3E%3Ccircle cx='100' cy='300' r='20'/%3E%3Ccircle cx='400' cy='150' r='16'/%3E%3Ccircle cx='300' cy='400' r='18'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 500px 500px;
    opacity: 1;
    mix-blend-mode: multiply;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
}

.login-container {
  width: 100%;
  max-width: 1100px;
  min-height: 620px;
  background: transparent;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(84, 160, 255, 0.25);
}

.brand-panel {
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;

  .carousel-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    .carousel-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 1.5s ease-in-out;
      overflow: hidden;

      &.active {
        opacity: 1;
      }

      .carousel-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    }

    .carousel-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(255, 138, 76, 0.75), rgba(255, 209, 166, 0.7));
      z-index: 1;
    }
  }

  &::before {
    content: '🐾';
    position: absolute;
    font-size: 120px;
    opacity: 0.15;
    top: 10%;
    right: 10%;
    animation: bounce 3s ease-in-out infinite;
  }

  &::after {
    content: '💕';
    position: absolute;
    font-size: 80px;
    opacity: 0.15;
    bottom: 15%;
    left: 15%;
    animation: bounce 3s ease-in-out infinite 1.5s;
  }

  .pet-decorations {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;

    .pet-emoji {
      position: absolute;
      font-size: 60px;
      opacity: 0.12;
      animation: float 6s ease-in-out infinite;

      &:nth-child(1) {
        top: 5%;
        left: 5%;
        animation-delay: 0s;
      }

      &:nth-child(2) {
        top: 20%;
        right: 8%;
        animation-delay: 1s;
      }

      &:nth-child(3) {
        bottom: 25%;
        left: 8%;
        animation-delay: 2s;
      }

      &:nth-child(4) {
        bottom: 10%;
        right: 12%;
        animation-delay: 3s;
      }

      &:nth-child(5) {
        top: 50%;
        left: 2%;
        font-size: 40px;
        animation-delay: 1.5s;
      }

      &:nth-child(6) {
        top: 35%;
        right: 3%;
        font-size: 50px;
        animation-delay: 2.5s;
      }
    }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(10px, -15px) rotate(5deg); }
    50% { transform: translate(-5px, -25px) rotate(-5deg); }
    75% { transform: translate(-10px, -10px) rotate(3deg); }
  }
}

  .brand-content {
    text-align: center;
    max-width: 320px;
    position: relative;
    z-index: 2;
  }

  .carousel-indicators {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 3;

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #fff;
        width: 24px;
        border-radius: 4px;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.8);
      }
    }
  }

.brand-logo {
  font-family: vars.$font-family-pet;
  font-size: 48px;
  letter-spacing: 2px;
  margin-bottom: 16px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.brand-content h2 {
  font-size: 32px;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.brand-content p {
  font-size: 16px;
  line-height: 1.6;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1;
}

.form-panel {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 8px 32px rgba(255, 138, 76, 0.15);
  background: rgba(255, 254, 250, 0.95);
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  z-index: 1;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 24px;
  margin-bottom: 8px;
  color: #1f2d3d;
}

.card-header p {
  color: #909399;
  font-size: 14px;
}

.form-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 12px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 16px 0;
  color: #c0c4cc;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ebeef5;
}

.divider span {
  padding: 0 12px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
}

.footer-links {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.login-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
}

.wechat-login {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.qrcode-container {
  text-align: center;
}

.qrcode-wrapper {
  position: relative;
  display: inline-block;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.qrcode-image {
  width: 200px;
  height: 200px;
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
  color: #409eff;
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
  color: #909399;
  font-size: 14px;
}

.qrcode-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.qrcode-loading .el-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .login-page {
    padding: 16px;
  }

  .login-container {
    flex-direction: column !important;
    min-height: auto;
  }

  .brand-panel {
    width: 100%;
    height: 200px;
    padding: 32px;
  }

  .form-panel {
    width: 100%;
    padding: 24px;
  }
}
</style>

