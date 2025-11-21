<template>
  <div class="register-page">
    <el-card class="register-card" shadow="hover">
      <div class="card-header">
        <h2>创建你的宠物关怀账户</h2>
        <p>三步完成注册，解锁智能宠物服务</p>
      </div>

      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="账号信息" description="验证手机号并设置密码" />
        <el-step title="基础信息" description="完善个人资料" />
        <el-step title="宠物信息" description="添加宠物档案（可选）" />
      </el-steps>

      <div class="steps-body">
        <section v-show="activeStep === 0">
          <el-form
            ref="stepOneFormRef"
            :model="stepOneForm"
            :rules="stepOneRules"
            label-position="top"
          >
            <el-form-item label="手机号" prop="phone">
              <el-input v-model.trim="stepOneForm.phone" maxlength="12" placeholder="请输入11位手机号">
                <template #prefix>
                  <el-icon><Iphone /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="短信验证码" prop="code">
              <el-input v-model="stepOneForm.code" placeholder="请输入验证码">
                <template #append>
                  <el-button
                    :disabled="countdown > 0"
                    type="primary"
                    link
                    @click="sendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="登录密码" prop="password">
              <el-input
                v-model="stepOneForm.password"
                show-password
                type="password"
                placeholder="至少6位，需包含数字与字母"
              />
              <div class="password-strength">
                <span>密码强度</span>
                <el-progress
                  :percentage="passwordStrength"
                  :status="strengthStatus"
                  :stroke-width="8"
                  striped
                  :striped-flow="passwordStrength > 0"
                />
              </div>
            </el-form-item>
            <el-form-item prop="agree">
              <el-checkbox v-model="stepOneForm.agree">
                我已阅读并同意
                <el-link type="primary" :underline="false">《用户协议》</el-link>
                与
                <el-link type="primary" :underline="false">《隐私政策》</el-link>
              </el-checkbox>
            </el-form-item>
          </el-form>
        </section>

        <section v-show="activeStep === 1">
          <el-form ref="stepTwoFormRef" :model="stepTwoForm" :rules="stepTwoRules" label-position="top">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="stepTwoForm.nickname" placeholder="给自己取一个昵称吧" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="stepTwoForm.gender">
                <el-radio-button value="male">男</el-radio-button>
                <el-radio-button value="female">女</el-radio-button>
                <el-radio-button value="other">其他</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="stepTwoForm.birthday"
                type="date"
                placeholder="选择生日"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </section>

        <section v-show="activeStep === 2">
          <el-form ref="stepThreeFormRef" :model="stepThreeForm" label-position="top">
            <el-form-item label="宠物类型">
              <el-radio-group v-model="stepThreeForm.petType">
                <el-radio-button value="cat">猫咪</el-radio-button>
                <el-radio-button value="dog">狗狗</el-radio-button>
                <el-radio-button value="other">其他</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="宠物名称">
              <el-input v-model="stepThreeForm.petName" placeholder="给宠物起个名字" />
            </el-form-item>
            <el-form-item label="宠物品种">
              <el-select v-model="stepThreeForm.petBreed" placeholder="选择宠物品种">
                <el-option label="中华田园犬" value="native-dog" />
                <el-option label="金毛寻回犬" value="golden" />
                <el-option label="布偶猫" value="ragdoll" />
                <el-option label="英短" value="british-shorthair" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="宠物生日">
              <el-date-picker
                v-model="stepThreeForm.petBirthday"
                type="date"
                placeholder="选择宠物生日"
                style="width: 100%"
              />
            </el-form-item>
            <el-alert
              type="info"
              show-icon
              :closable="false"
              title="此步骤可跳过，稍后在宠物管理中添加也可以"
            />
          </el-form>
        </section>
      </div>

      <div class="steps-actions">
        <el-button :disabled="activeStep === 0" @click="prevStep">上一步</el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="nextStep">下一步</el-button>
        <template v-else>
          <el-button @click="skipPetStep" text>跳过此步骤</el-button>
          <el-button type="primary" @click="handleSubmit">提交注册</el-button>
        </template>
      </div>
    </el-card>

    <el-dialog v-model="successDialog" title="注册成功" width="420px" :close-on-click-modal="false">
      <p>恭喜您注册成功！可以使用手机号和密码登录宠物关怀系统。</p>
      <template #footer>
        <el-button @click="successDialog = false">继续完善资料</el-button>
        <el-button type="primary" @click="goToLogin">前往登录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Iphone } from '@element-plus/icons-vue'

const router = useRouter()
const activeStep = ref(0)

const stepOneFormRef = ref<FormInstance>()
const stepTwoFormRef = ref<FormInstance>()
const stepThreeFormRef = ref<FormInstance>()

const stepOneForm = reactive({
  phone: '',
  code: '',
  password: '',
  agree: false,
})

const stepTwoForm = reactive({
  nickname: '',
  gender: 'male',
  birthday: '',
})

const stepThreeForm = reactive({
  petType: 'cat',
  petName: '',
  petBreed: '',
  petBirthday: '',
})

const validatePhone = (_: unknown, value: string, callback: (error?: Error) => void) => {
  const phonePattern = /^1[3-9]\d{9}$/
  const phone = String(value ?? '').trim()
  if (!phone) {
    callback(new Error('请输入手机号'))
  } else if (!phonePattern.test(phone)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validatePassword = (_: unknown, value: string, callback: (error?: Error) => void) => {
  const strongPattern = /^(?=.*[A-Za-z])(?=.*\\d).{6,}$/
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (!strongPattern.test(value)) {
    callback(new Error('密码需至少6位，包含字母和数字'))
  } else {
    callback()
  }
}

const stepOneRules: FormRules<typeof stepOneForm> = {
  phone: [{ required: true, validator: validatePhone, trigger: ['blur', 'change'] }],
  code: [{ required: true, message: '请输入验证码', trigger: ['blur', 'change'] }],
  password: [{ required: true, validator: validatePassword, trigger: ['blur', 'change'] }],
  agree: [
    {
      type: 'boolean',
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请先阅读并同意协议'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

const stepTwoRules: FormRules<typeof stepTwoForm> = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthday: [{ required: true, message: '请选择生日', trigger: 'change' }],
}

const passwordStrength = computed(() => {
  const pwd = stepOneForm.password
  if (!pwd) return 0
  let score = 0
  if (/[a-z]/.test(pwd)) score += 20
  if (/[A-Z]/.test(pwd)) score += 20
  if (/\\d/.test(pwd)) score += 20
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20
  if (pwd.length >= 10) score += 20
  return Math.min(score, 100)
})

const strengthStatus = computed(() => {
  if (passwordStrength.value >= 80) return 'success'
  if (passwordStrength.value >= 40) return 'warning'
  if (passwordStrength.value > 0) return 'exception'
  return undefined
})

const countdown = ref(0)
let timer: number | null = null

const sendCode = () => {
  const phone = String(stepOneForm.phone ?? '').trim()
  if (!phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (countdown.value > 0) return
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  ElMessage.success('验证码已发送（示例）')
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const nextStep = async () => {
  if (activeStep.value === 0) {
    const valid = await stepOneFormRef.value?.validate().catch(() => false)
    if (!valid) return
  }
  if (activeStep.value === 1) {
    const valid = await stepTwoFormRef.value?.validate().catch(() => false)
    if (!valid) return
  }
  activeStep.value = Math.min(activeStep.value + 1, 2)
}

const prevStep = () => {
  activeStep.value = Math.max(activeStep.value - 1, 0)
}

const skipPetStep = () => {
  handleSubmit()
}

const successDialog = ref(false)

const handleSubmit = async () => {
  const formToValidate =
    activeStep.value === 2 ? stepThreeFormRef.value : activeStep.value === 1 ? stepTwoFormRef.value : stepOneFormRef.value
  if (formToValidate) {
    try {
      await formToValidate.validate()
    } catch {
      return
    }
  }
  successDialog.value = true
}

const goToLogin = () => {
  successDialog.value = false
  router.push({ name: 'login' })
}

watch(
  () => stepOneForm.phone,
  (value) => {
    const phone = String(value ?? '').trim()
    if (phone && /^\\d{11}$/.test(phone)) {
      stepOneFormRef.value?.clearValidate('phone')
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.register-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 32px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: vars.$font-family-base;
}

.register-card {
  width: 100%;
  max-width: 960px;
  border-radius: 24px;
  border: none;
  box-shadow: 0 20px 60px rgba(84, 160, 255, 0.15);
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-header h2 {
  font-size: 28px;
  margin-bottom: 8px;
  color: #1f2d3d;
}

.card-header p {
  color: #909399;
  font-size: 14px;
}

.steps-body {
  margin-top: 32px;
}

section {
  animation: fadeIn 0.3s ease;
}

.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.password-strength span {
  width: 80px;
  color: #909399;
  font-size: 13px;
}

.steps-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .register-card {
    padding: 12px 8px;
  }

  .steps-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

