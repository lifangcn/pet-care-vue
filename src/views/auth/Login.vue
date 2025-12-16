<template>
  <div class="login-page">
    <el-container class="login-container">
      <el-aside class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">PetCare</div>
          <h2>宠物关怀系统</h2>
          <p>智能健康管理 · 专业护理服务 · 宠物社区互联</p>
        </div>
      </el-aside>
      <el-main class="form-panel">
        <el-card class="login-card" shadow="hover">
          <div class="card-header">
            <h3>欢迎回来</h3>
            <p>请登录您的宠物关怀账户</p>
          </div>
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
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Lock, Message } from '@element-plus/icons-vue'
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

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
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
  background: #f5f7fb;
  font-family: vars.$font-family-base;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
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
  background-image: linear-gradient(135deg, rgba(84, 160, 255, 0.85), rgba(255, 155, 67, 0.85));
  background-size: cover;
  background-position: center;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.brand-content {
  text-align: center;
  max-width: 320px;
}

.brand-logo {
  font-family: vars.$font-family-pet;
  font-size: 48px;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.brand-content h2 {
  font-size: 32px;
  margin-bottom: 12px;
}

.brand-content p {
  font-size: 16px;
  line-height: 1.6;
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
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
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

