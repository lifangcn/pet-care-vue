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
            <el-form-item label="手机号" prop="identifier">
              <el-input v-model.trim="form.identifier" placeholder="请输入手机号">
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password>
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <div class="form-meta">
              <el-checkbox v-model="form.remember">记住密码</el-checkbox>
              <el-link type="primary" @click="goForget">忘记密码？</el-link>
            </div>
            <el-button type="primary" class="login-btn" @click="handleLogin">登 录</el-button>
          </el-form>
          <div class="divider">
            <span>或</span>
          </div>
          <div class="social-login">
            <el-tooltip content="微信登录" placement="top">
              <el-button circle type="success">
                <el-icon><ChatLineRound /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="微博登录" placement="top">
              <el-button circle type="danger">
                <el-icon><Promotion /></el-icon>
              </el-button>
            </el-tooltip>
          </div>
          <div class="footer-links">
            <span>还没有账号？</span>
            <el-link type="primary" @click="goRegister">立即注册</el-link>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { ChatLineRound, Lock, Message, Promotion } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

interface LoginForm {
  identifier: string
  password: string
  remember: boolean
}

const router = useRouter()
const formRef = ref<FormInstance>()
const form = reactive<LoginForm>({
  identifier: '',
  password: '',
  remember: false,
})

const phonePattern = /^1[3-9]\d{9}$/

const validateIdentifier = (_: unknown, value: string, callback: (error?: Error) => void) => {
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
  identifier: [{ required: true, validator: validateIdentifier, trigger: ['blur', 'change'] }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
}

const handleLogin = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      ElMessage.success('登录成功（示例）')
    }
  })
}

const goRegister = () => {
  router.push({ name: 'register' })
}

const goForget = () => {
  ElMessage.info('忘记密码功能暂未开放')
}

watch(
  () => form.identifier,
  (value) => {
    const phone = value?.trim()
    if (!phone) return
    if (phonePattern.test(phone)) {
      formRef.value?.clearValidate('identifier')
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
  background-image: linear-gradient(135deg, rgba(84, 160, 255, 0.85), rgba(255, 155, 67, 0.85)),
    url('https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80');
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

