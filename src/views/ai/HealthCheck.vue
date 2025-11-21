<template>
  <div class="health-check-page">
    <div class="page-header">
      <h1>AI健康检查</h1>
      <p>智能分析宠物健康状况，提供专业建议</p>
    </div>

    <el-card class="check-container" shadow="hover">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="选择宠物" description="选择需要检查的宠物" />
        <el-step title="输入症状" description="描述宠物的症状" />
        <el-step title="AI分析" description="智能分析中..." />
        <el-step title="结果报告" description="查看分析结果" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤1: 选择宠物 -->
        <div v-show="currentStep === 0" class="step-panel">
          <h3>选择需要检查的宠物</h3>
          <el-form :model="form" label-width="120px">
            <el-form-item label="选择宠物" required>
              <el-select v-model="form.petId" placeholder="请选择宠物" style="width: 100%">
                <el-option
                  v-for="pet in userPets"
                  :key="pet.id"
                  :label="`${pet.name} (${pet.breed})`"
                  :value="pet.id"
                >
                  <div class="pet-option">
                    <el-avatar :size="32" :src="pet.avatar" />
                    <span>{{ pet.name }} ({{ pet.breed }})</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div class="step-actions">
            <el-button type="primary" :disabled="!form.petId" @click="nextStep">下一步</el-button>
          </div>
        </div>

        <!-- 步骤2: 输入症状 -->
        <div v-show="currentStep === 1" class="step-panel">
          <h3>请描述宠物的症状</h3>
          <el-form ref="symptomFormRef" :model="form" :rules="symptomRules" label-width="120px">
            <el-form-item label="常见症状" prop="symptoms">
              <el-checkbox-group v-model="form.symptoms">
                <el-checkbox
                  v-for="symptom in commonSymptoms"
                  :key="symptom.id"
                  :label="symptom.id"
                >
                  {{ symptom.name }}
                </el-checkbox>
              </el-checkbox-group>
              <div v-if="commonSymptoms.length === 0" class="loading-symptoms">
                <el-icon class="is-loading"><Loading /></el-icon>
                加载症状列表...
              </div>
            </el-form-item>
            <el-form-item label="详细描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="6"
                placeholder="请详细描述宠物的症状、行为变化、持续时间等信息..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-form>
          <div class="step-actions">
            <el-button @click="prevStep">上一步</el-button>
            <el-button
              type="primary"
              :disabled="form.symptoms.length === 0 && !form.description.trim()"
              @click="handleSubmit"
            >
              开始分析
            </el-button>
          </div>
        </div>

        <!-- 步骤3: AI分析 -->
        <div v-show="currentStep === 2" class="step-panel analysis-panel">
          <div class="analysis-content">
            <el-icon class="analysis-icon is-loading" :size="64"><Loading /></el-icon>
            <h3>AI正在分析中...</h3>
            <p>请稍候，我们正在为您分析宠物的健康状况</p>
            <el-progress
              :percentage="analysisProgress"
              :status="analysisProgress === 100 ? 'success' : undefined"
              :stroke-width="8"
              striped
              :striped-flow="analysisProgress < 100"
            />
            <div class="analysis-tips">
              <p v-for="(tip, index) in analysisTips" :key="index" :class="{ active: currentTipIndex === index }">
                {{ tip }}
              </p>
            </div>
          </div>
        </div>

        <!-- 步骤4: 结果报告 -->
        <div v-show="currentStep === 3" class="step-panel">
          <div v-if="checkResult" class="result-content">
            <h3>健康检查报告</h3>
            <div class="result-header">
              <el-avatar :size="64" :src="selectedPet?.avatar" />
              <div class="pet-info">
                <h4>{{ checkResult.petName }}</h4>
                <p>检查时间：{{ formatTime(checkResult.createdAt) }}</p>
              </div>
            </div>

            <el-alert
              :title="checkResult.urgencyMessage"
              :type="urgencyTypeMap[checkResult.urgency].type"
              :closable="false"
              show-icon
              class="urgency-alert"
            />

            <div class="result-section">
              <h4>
                <el-icon><Document /></el-icon>
                症状描述
              </h4>
              <div class="symptoms-list">
                <el-tag
                  v-for="symptomId in checkResult.symptoms"
                  :key="symptomId"
                  class="symptom-tag"
                >
                  {{ getSymptomName(symptomId) }}
                </el-tag>
              </div>
              <p v-if="checkResult.description" class="description-text">{{ checkResult.description }}</p>
            </div>

            <div class="result-section">
              <h4>
                <el-icon><Warning /></el-icon>
                可能的原因
              </h4>
              <ul class="result-list">
                <li v-for="(cause, index) in checkResult.possibleCauses" :key="index">{{ cause }}</li>
              </ul>
            </div>

            <div class="result-section">
              <h4>
                <el-icon><InfoFilled /></el-icon>
                建议措施
              </h4>
              <ol class="result-list">
                <li v-for="(suggestion, index) in checkResult.suggestions" :key="index">{{ suggestion }}</li>
              </ol>
            </div>

            <div class="result-actions">
              <el-button type="primary" :icon="Calendar" @click="handleBookService">预约专业检查</el-button>
              <el-button :icon="RefreshRight" @click="handleRestart">重新检查</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loading, Document, Warning, InfoFilled, Calendar, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElLoading } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchCommonSymptoms, submitHealthCheck } from '@/services/aiService'
import { usePetStore } from '@/store/pet'
import type { HealthCheckForm, HealthCheckResult, CommonSymptom } from '@/types/ai'
import type { Pet } from '@/types/pet'

const router = useRouter()
const petStore = usePetStore()

const currentStep = ref(0)
const commonSymptoms = ref<CommonSymptom[]>([])
const checkResult = ref<HealthCheckResult | null>(null)
const analysisProgress = ref(0)
const currentTipIndex = ref(0)

const symptomFormRef = ref<FormInstance>()

const form = reactive<HealthCheckForm>({
  petId: '',
  symptoms: [],
  description: '',
})

const userPets = computed(() => petStore.pets)

const selectedPet = computed(() => {
  return petStore.pets.find((pet) => pet.id === form.petId)
})

const urgencyTypeMap = {
  low: { type: 'success', label: '轻微' },
  medium: { type: 'info', label: '一般' },
  high: { type: 'warning', label: '严重' },
  emergency: { type: 'error', label: '紧急' },
}

const analysisTips = [
  '正在分析症状特征...',
  '匹配相似病例...',
  '评估健康风险...',
  '生成专业建议...',
]

const symptomRules: FormRules<HealthCheckForm> = {
  symptoms: [
    {
      validator: (_rule, value, callback) => {
        if (value.length === 0 && !form.description.trim()) {
          callback(new Error('请至少选择一个症状或输入详细描述'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  description: [
    {
      validator: (_rule, value, callback) => {
        if (form.symptoms.length === 0 && !value.trim()) {
          callback(new Error('请至少选择一个症状或输入详细描述'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

/**
 * [API调用] GET /ai/symptoms
 * 加载常见症状列表
 */
const loadCommonSymptoms = async () => {
  try {
    // [API调用] GET /ai/symptoms - 获取常见症状列表
    const { data } = await fetchCommonSymptoms()
    commonSymptoms.value = data
  } catch (error) {
    ElMessage.error('加载症状列表失败')
    console.error(error)
  }
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

/**
 * [API调用] POST /ai/health-check
 * 提交健康检查并开始AI分析
 */
const handleSubmit = async () => {
  if (!symptomFormRef.value) return

  const valid = await symptomFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 显示全屏加载
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在提交检查请求...',
    background: 'rgba(0, 0, 0, 0.7)',
  })

  try {
    // 进入分析步骤
    currentStep.value = 2
    analysisProgress.value = 0
    currentTipIndex.value = 0

    // 模拟分析进度
    const progressInterval = setInterval(() => {
      if (analysisProgress.value < 90) {
        analysisProgress.value += Math.random() * 15
        if (analysisProgress.value > 90) {
          analysisProgress.value = 90
        }
      }
    }, 500)

    const tipInterval = setInterval(() => {
      currentTipIndex.value = (currentTipIndex.value + 1) % analysisTips.length
    }, 2000)

    // [API调用] POST /ai/health-check - 提交AI健康检查
    const { data } = await submitHealthCheck(form)

    clearInterval(progressInterval)
    clearInterval(tipInterval)
    analysisProgress.value = 100
    currentTipIndex.value = analysisTips.length - 1

    // 等待一下让进度条完成
    await new Promise((resolve) => setTimeout(resolve, 500))

    checkResult.value = data
    currentStep.value = 3
  } catch (error) {
    ElMessage.error('分析失败，请重试')
    console.error(error)
    currentStep.value = 1
  } finally {
    loadingInstance.close()
  }
}

const getSymptomName = (symptomId: string) => {
  const symptom = commonSymptoms.value.find((s) => s.id === symptomId)
  return symptom ? symptom.name : symptomId
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleBookService = () => {
  router.push('/service/booking')
}

const handleRestart = () => {
  currentStep.value = 0
  form.petId = ''
  form.symptoms = []
  form.description = ''
  checkResult.value = null
  analysisProgress.value = 0
  currentTipIndex.value = 0
  symptomFormRef.value?.clearValidate()
}

onMounted(async () => {
  await petStore.loadPets()
  await loadCommonSymptoms()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.health-check-page {
  padding: 24px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: vars.$font-family-base;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    color: #1f2d3d;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.check-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px;
}

.step-content {
  margin-top: 48px;
  min-height: 400px;
}

.step-panel {
  padding: 24px 0;

  h3 {
    margin: 0 0 24px;
    font-size: 20px;
    color: #1f2d3d;
    text-align: center;
  }
}

.pet-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.loading-symptoms {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  padding: 16px;
}

.analysis-panel {
  .analysis-content {
    text-align: center;
    padding: 48px 24px;

    .analysis-icon {
      margin-bottom: 24px;
      color: vars.$pet-color-blue;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 24px;
      color: #1f2d3d;
    }

    p {
      margin: 0 0 32px;
      color: #909399;
    }

    .el-progress {
      margin-bottom: 32px;
    }

    .analysis-tips {
      margin-top: 32px;

      p {
        margin: 8px 0;
        color: #909399;
        font-size: 14px;
        opacity: 0.5;
        transition: all 0.3s;

        &.active {
          opacity: 1;
          color: vars.$pet-color-blue;
          font-weight: 600;
        }
      }
    }
  }
}

.result-content {
  h3 {
    margin: 0 0 24px;
    font-size: 24px;
    color: #1f2d3d;
    text-align: center;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .pet-info {
      h4 {
        margin: 0 0 4px;
        font-size: 18px;
        color: #1f2d3d;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }

  .urgency-alert {
    margin-bottom: 24px;
  }

  .result-section {
    margin-bottom: 32px;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px;
      font-size: 18px;
      color: #1f2d3d;

      .el-icon {
        color: vars.$pet-color-blue;
      }
    }

    .symptoms-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;

      .symptom-tag {
        margin: 0;
      }
    }

    .description-text {
      margin: 16px 0 0;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 6px;
      color: #606266;
      line-height: 1.6;
    }

    .result-list {
      margin: 0;
      padding-left: 24px;
      color: #606266;
      line-height: 2;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .result-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid #e4e7ed;
  }
}

@media (max-width: 768px) {
  .check-container {
    padding: 16px;
  }

  .step-content {
    margin-top: 24px;
    min-height: 300px;
  }

  .result-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>

