<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="page-header">
        <h1>完善个人信息</h1>
        <p>所有信息均可跳过</p>
      </div>

      <div class="steps-indicator">
        <div class="step-item" :class="{ active: activeStep === 0, completed: activeStep > 0 }">
          <div class="step-number">1</div>
          <span class="step-title">基础信息</span>
        </div>
        <div class="step-divider"></div>
        <div class="step-item" :class="{ active: activeStep === 1 }">
          <div class="step-number">2</div>
          <span class="step-title">宠物信息</span>
        </div>
      </div>

      <div class="steps-body">
        <section v-show="activeStep === 0">
          <el-form
            ref="stepOneFormRef"
            :model="stepOneForm"
            :rules="stepOneRules"
            label-position="top"
          >
            <el-form-item label="头像" prop="avatar">
              <div class="avatar-section">
                <el-avatar :size="80" :src="displayAvatar" class="avatar-preview">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <div class="avatar-actions">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleAvatarChange"
                    :before-upload="beforeAvatarUpload"
                    accept="image/*"
                  >
                    <el-button size="small" :icon="Upload">上传</el-button>
                  </el-upload>
                  <el-button
                    v-if="stepOneForm.avatar"
                    size="small"
                    text
                    type="danger"
                    @click="removeAvatar"
                  >
                    移除
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="stepOneForm.nickname" placeholder="请输入昵称（可选）" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="stepOneForm.gender">
                    <el-radio :value="1">男</el-radio>
                    <el-radio :value="2">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="生日" prop="birthday">
                  <el-date-picker
                    v-model="stepOneForm.birthday"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </section>

        <section v-show="activeStep === 1">
          <div class="pets-section">
            <div class="pets-header">
              <h3>我的宠物</h3>
              <el-button type="primary" :icon="Plus" @click="addPet">添加宠物</el-button>
            </div>
            
            <div v-if="pets.length === 0" class="empty-pets">
              <el-empty description="暂无宠物，点击上方按钮添加" :image-size="100" />
            </div>

            <div v-else class="pets-list">
              <div
                v-for="(pet, index) in pets"
                :key="index"
                class="pet-card"
              >
                <div class="pet-card-header">
                  <el-avatar :size="48" :src="pet.avatarUrl || pet.avatar" />
                  <div class="pet-info">
                    <h4>{{ pet.name || '未命名' }}</h4>
                    <p>{{ pet.breed || '未设置品种' }}</p>
                  </div>
                  <el-button
                    text
                    type="danger"
                    :icon="Delete"
                    @click="removePet(index)"
                    class="delete-btn"
                  />
                </div>
                <el-form label-position="top" class="pet-form">
                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-form-item label="宠物类型">
                        <el-select v-model="pet.type" placeholder="选择类型" style="width: 100%">
                          <el-option label="狗" :value="1" />
                          <el-option label="猫" :value="2" />
                          <el-option label="其他" :value="3" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="宠物名称">
                        <el-input v-model="pet.name" placeholder="输入名称" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="12">
                    <el-col :span="12">
                      <el-form-item label="宠物品种">
                        <el-input v-model="pet.breed" placeholder="输入品种" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="宠物生日">
                        <el-date-picker
                          v-model="pet.birthday"
                          type="date"
                          placeholder="选择日期"
                          style="width: 100%"
                          value-format="YYYY-MM-DD"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="form-actions">
        <el-button :disabled="activeStep === 0" text @click="prevStep">上一步</el-button>
        <div class="actions-right">
          <el-button v-if="activeStep < 1" type="primary" @click="nextStep">下一步</el-button>
          <template v-else>
            <el-button text @click="skipAll">跳过</el-button>
            <el-button type="primary" @click="handleSubmit">完成</el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { FormInstance, FormRules, UploadProps, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Plus, Delete, User, Upload } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { updateUserProfile } from '@/services/userService'
import { savePet } from '@/services/petService'
import type { CreatePetPayload } from '@/types/pet'
import { getUserAvatar } from '@/utils/avatarUtils'

const router = useRouter()
const authStore = useAuthStore()
const activeStep = ref(0)

const stepOneFormRef = ref<FormInstance>()

const stepOneForm = reactive({
  nickname: '',
  gender: 0 as 0 | 1 | 2, // 0-其他 1-男 2-女
  birthday: '',
  avatar: '',
})

// 计算显示的头像（如果未上传，则根据用户名生成）
const displayAvatar = computed(() => {
  const username = stepOneForm.nickname || authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(stepOneForm.avatar, username)
})

// 宠物列表（支持多个）
const pets = reactive<Array<Partial<CreatePetPayload>>>([])

// 所有字段都是可选的，不需要必填验证
const stepOneRules: FormRules<typeof stepOneForm> = {}

const nextStep = () => {
  activeStep.value = Math.min(activeStep.value + 1, 1)
}

const prevStep = () => {
  activeStep.value = Math.max(activeStep.value - 1, 0)
}

const skipAll = () => {
  router.push({ name: 'dashboard' })
}

// 处理头像上传
const handleAvatarChange = (file: UploadFile) => {
  if (!file.raw) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      // 将图片转为 base64 或上传到服务器
      // 这里先使用 base64，实际应该上传到服务器获取 URL
      stepOneForm.avatar = e.target.result as string
      ElMessage.success('头像上传成功')
    }
  }
  reader.readAsDataURL(file.raw)
}

// 上传前的校验
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
  return false // 阻止自动上传，使用手动处理
}

// 移除头像
const removeAvatar = () => {
  stepOneForm.avatar = ''
  ElMessage.success('已移除自定义头像，将使用默认头像')
}

// 初始化用户信息
onMounted(async () => {
  // 如果有用户信息，加载现有数据
  if (authStore.user) {
    stepOneForm.nickname = authStore.user.nickname || ''
    stepOneForm.avatar = authStore.user.avatar || ''
    if (authStore.user.gender) {
      stepOneForm.gender = authStore.user.gender === 'male' ? 1 : authStore.user.gender === 'female' ? 2 : 0
    }
    if (authStore.user.birthday) {
      stepOneForm.birthday = authStore.user.birthday
    }
  }
})

// 添加宠物
const addPet = () => {
  pets.push({
    type: 1, // 默认狗
    name: '',
    breed: '',
    gender: 0, // 默认未知
    birthday: '',
    weight: null,
    isSterilized: false,
    avatarUrl: '',
    healthStatus: 'good',
  })
}

// 移除宠物
const removePet = (index: number) => {
  pets.splice(index, 1)
}

/**
 * [API调用] 提交用户信息
 * 分别调用用户信息更新和宠物保存接口
 */
const handleSubmit = async () => {
  try {
    // 1. 更新用户基础信息（如果有填写）
    if (stepOneForm.nickname || stepOneForm.birthday || stepOneForm.gender !== 0 || stepOneForm.avatar) {
      try {
        // [API调用] PUT /users/profile - 更新用户信息
        await updateUserProfile({
          nickname: stepOneForm.nickname || undefined,
          gender: stepOneForm.gender !== 0 ? stepOneForm.gender : undefined,
          birthday: stepOneForm.birthday || undefined,
          avatar: stepOneForm.avatar || undefined,
        })
        // 更新 store 中的用户信息
        if (authStore.user) {
          authStore.user.nickname = stepOneForm.nickname || authStore.user.nickname
          authStore.user.avatar = stepOneForm.avatar || authStore.user.avatar
        }
      } catch (error) {
        // 不阻止流程继续
      }
    }

    // 2. 保存所有宠物信息（如果有填写）
    if (pets.length > 0) {
      const savePromises = pets
        .filter((pet) => pet.name || pet.breed) // 只保存有名称或品种的宠物
        .map((pet) => {
          const petPayload: CreatePetPayload = {
            name: pet.name || '未命名',
            breed: pet.breed || '',
            type: (pet.type as 1 | 2 | 3) || 1,
            gender: (pet.gender as 0 | 1 | 2) || 0,
            birthday: pet.birthday || new Date().toISOString().split('T')[0],
            weight: pet.weight || null,
            isSterilized: pet.isSterilized ?? false,
            avatarUrl: pet.avatarUrl || '',
            healthStatus: pet.healthStatus || 'good',
            allergyInfo: pet.allergyInfo || '',
            healthNotes: pet.healthNotes || '',
          }
          // [API调用] POST /pets/save - 保存宠物信息
          return savePet(petPayload)
        })

      try {
        await Promise.all(savePromises)
      } catch (error) {
        // 不阻止流程继续
      }
    }

    ElMessage.success('信息保存成功')
    router.push({ name: 'dashboard' })
  } catch (error) {
    ElMessage.error('保存失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.profile-page {
  width: 100%;
  background: #fff;
  padding: 20px;
  display: flex;
  justify-content: center;
  font-family: vars.$font-family-base;
  overflow-x: hidden;
  box-sizing: border-box;
}

.profile-container {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 20px;
    font-weight: 600;
    color: #1f2d3d;
    margin: 0 0 4px;
  }
  
  p {
    font-size: 12px;
    color: #909399;
    margin: 0;
  }
}

.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  gap: 16px;
  
  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    
    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f0f2f5;
      color: #909399;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .step-title {
      font-size: 14px;
      color: #909399;
      transition: all 0.3s;
    }
    
    &.active {
      .step-number {
        background: vars.$pet-color-blue;
        color: #fff;
      }
      
      .step-title {
        color: vars.$pet-color-blue;
        font-weight: 500;
      }
    }
    
    &.completed {
      .step-number {
        background: #67c23a;
        color: #fff;
      }
    }
  }
  
  .step-divider {
    width: 60px;
    height: 2px;
    background: #e4e7ed;
    margin-top: -16px;
  }
}

.steps-body {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

section {
  animation: fadeIn 0.3s ease;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .avatar-preview {
    flex-shrink: 0;
    border: 2px solid #e4e7ed;
  }
  
  .avatar-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

:deep(.el-form-item) {
  margin-bottom: 16px;
  
  .el-form-item__label {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    padding-bottom: 6px;
  }
}

.pets-section {
  .pets-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2d3d;
    }
  }

  .empty-pets {
    padding: 40px 0;
    text-align: center;
  }
  
  .pets-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .pet-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 20px;
    background: #fafafa;
    
    .pet-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e7ed;
      
      .pet-info {
        flex: 1;
        
        h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #1f2d3d;
        }
        
        p {
          margin: 0;
          font-size: 13px;
          color: #909399;
        }
      }
      
      .delete-btn {
        color: #f56c6c;
      }
    }
    
    .pet-form {
      :deep(.el-form-item) {
        margin-bottom: 16px;
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  
  .actions-right {
    display: flex;
    gap: 12px;
  }
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

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-radio) {
  margin-right: 16px;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
    padding-bottom: 40px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
  
  .steps-body {
    padding: 20px;
  }
  
  .steps-indicator {
    margin-bottom: 24px;
    gap: 8px;
    
    .step-divider {
      width: 30px;
    }
    
    .step-title {
      font-size: 12px;
    }
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: flex-start;
    
    .avatar-actions {
      flex-direction: row;
    }
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
    
    .actions-right {
      width: 100%;
      
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
