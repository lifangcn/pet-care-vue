<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="page-header">
        <div class="header-icon">
          <el-icon :size="48"><User /></el-icon>
        </div>
        <h1>完善个人信息</h1>
        <p>让我们更好地了解您</p>
      </div>

      <div class="steps-body">
        <section>
          <el-form
            ref="stepOneFormRef"
            :model="stepOneForm"
            :rules="stepOneRules"
            label-position="top"
          >
            <el-form-item label="头像" prop="avatar">
              <div class="avatar-section">
                <div class="avatar-wrapper">
                  <el-avatar :size="100" :src="displayAvatar" class="avatar-preview">
                    <el-icon :size="50"><User /></el-icon>
                  </el-avatar>
                  <div class="avatar-overlay">
                    <el-upload
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="handleAvatarChange"
                      :before-upload="beforeAvatarUpload"
                      accept="image/*"
                    >
                      <el-button circle :icon="Upload" size="small" />
                    </el-upload>
                  </div>
                </div>
                <div class="avatar-actions">
                  <el-upload
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                    :on-change="handleAvatarChange"
                    :before-upload="beforeAvatarUpload"
                    accept="image/*"
                  >
                    <el-button type="primary" :icon="Upload">更换头像</el-button>
                  </el-upload>
                  <el-button
                    v-if="stepOneForm.avatar"
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
              <el-col :span="24">
                <el-form-item label="地址" prop="address">
                  <el-input v-model="stepOneForm.address" placeholder="请输入地址（可选）" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </section>
      </div>

      <div class="form-actions">
        <el-button type="primary" size="large" @click="handleSubmit" :icon="Check">保存信息</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import type { FormInstance, FormRules, UploadProps, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { User, Upload, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { updateUserProfile, uploadUserAvatar } from '@/services/userService'
import { getUserAvatar } from '@/utils/avatarUtils'

const router = useRouter()
const authStore = useAuthStore()

const stepOneFormRef = ref<FormInstance>()

const stepOneForm = reactive({
  nickname: '',
  avatar: '',
  address: '',
})

// 计算显示的头像（如果未上传，则根据用户名生成）
const displayAvatar = computed(() => {
  const username = stepOneForm.nickname || authStore.user?.nickname || authStore.user?.phone || '用户'
  return getUserAvatar(stepOneForm.avatar, username)
})

// 所有字段都是可选的，不需要必填验证
const stepOneRules: FormRules<typeof stepOneForm> = {}


// 处理头像上传
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
  return true
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
    stepOneForm.address = authStore.user.address || ''
  }
})

/**
 * [API调用] 提交用户信息
 * 调用用户信息更新接口
 */
const handleSubmit = async () => {
  try {
    // 更新用户基础信息（如果有填写）
    if (stepOneForm.nickname || stepOneForm.avatar || stepOneForm.address) {
      try {
        // [API调用] PUT /user/update - 更新用户信息
        await updateUserProfile({
          nickname: stepOneForm.nickname || undefined,
          avatar: stepOneForm.avatar || undefined,
          address: stepOneForm.address || undefined,
        })
        // 更新 store 中的用户信息
        if (authStore.user) {
          authStore.user.nickname = stepOneForm.nickname || authStore.user.nickname
          authStore.user.avatar = stepOneForm.avatar || authStore.user.avatar
          authStore.user.address = stepOneForm.address || authStore.user.address
        }
        ElMessage.success('信息保存成功')
        router.push({ name: 'dashboard' })
      } catch (error) {
        ElMessage.error('保存失败，请稍后重试')
      }
    } else {
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    ElMessage.error('保存失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.profile-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  font-family: vars.$font-family-base;
  overflow-x: hidden;
  box-sizing: border-box;
}

.profile-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  .header-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }
}


.steps-body {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

section {
  animation: fadeIn 0.3s ease;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 30px 0;
  
  .avatar-wrapper {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
    
    .avatar-preview {
      border: 4px solid #f0f2f5;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .avatar-overlay {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 36px;
      height: 36px;
      background: vars.$pet-color-blue;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(64, 158, 255, 0.6);
      }
      
      :deep(.el-button) {
        border: 2px solid #fff;
        background: transparent;
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }
  
  .avatar-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
}

:deep(.el-form-item) {
  margin-bottom: 24px;
  
  .el-form-item__label {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    padding-bottom: 8px;
    letter-spacing: 0.3px;
  }
  
  .el-input__wrapper {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    &.is-focus {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
    }
  }
}


.form-actions {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  margin-top: 24px;
  
  :deep(.el-button) {
    min-width: 200px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
    }
    
    &:active {
      transform: translateY(0);
    }
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


@media (max-width: 768px) {
  .profile-page {
    padding: 20px 16px;
    min-height: auto;
  }
  
  .page-header {
    margin-bottom: 24px;
    
    .header-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 24px;
    }
    
    p {
      font-size: 14px;
    }
  }
  
  .steps-body {
    padding: 24px 20px;
    border-radius: 16px;
  }
  
  .avatar-section {
    padding: 20px 0;
  }
  
  .form-actions {
    :deep(.el-button) {
      width: 100%;
      min-width: auto;
    }
  }
}
</style>
