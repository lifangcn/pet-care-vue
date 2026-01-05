<template>
  <div class="pet-page">
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" :icon="Plus" @click="openAddDialog">添加宠物</el-button>
        <el-dropdown>
          <el-button type="info" plain>
            批量操作
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleBatch('health')">批量健康评估</el-dropdown-item>
              <el-dropdown-item @click="handleBatch('remind')">批量提醒</el-dropdown-item>
              <el-dropdown-item divided @click="handleBatch('delete')">批量删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-input
        v-model="searchValue"
        placeholder="搜索宠物名称 / 品种 / 类型"
        clearable
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-row :gutter="20">
      <el-col
        v-for="pet in petStore.filteredPets"
        :key="pet.id"
        :xs="24"
        :sm="12"
        :lg="8"
      >
        <el-card shadow="hover" class="pet-card">
          <div class="pet-card-header">
            <el-avatar :size="72" :src="pet.avatar || ''" />
            <div class="pet-meta">
              <h3>{{ pet.name }}</h3>
              <p>{{ pet.breed || '未设置品种' }} · {{ typeLabel(pet.type) }} · {{ genderLabel(pet.gender) }}</p>
            </div>
          </div>
          <div class="pet-body">
            <ul>
              <li v-if="pet.birthday">生日：{{ pet.birthday }}</li>
              <li v-if="pet.weight !== null && pet.weight !== undefined">体重：{{ pet.weight }} kg</li>
              <li v-if="pet.healthNotes">健康备注：{{ pet.healthNotes }}</li>
            </ul>
          </div>
          <div class="pet-actions">
            <el-button text type="primary" @click="openEditDialog(pet)">编辑</el-button>
            <el-button text type="danger" @click="confirmDelete(pet.id)">删除</el-button>
            <el-button text @click="viewDetail(pet.id)">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!petStore.loading && petStore.filteredPets.length === 0" description="暂无宠物数据" />

    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '添加宠物' : '编辑宠物'"
      width="640px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formState"
        :rules="petFormRules"
        label-width="96px"
      >
        <el-form-item label="宠物头像">
          <div class="avatar-upload-wrapper">
            <el-avatar v-if="avatarPreview || formState.avatar" :size="80" :src="avatarPreview || formState.avatar" class="avatar-preview" />
            <el-upload
              class="avatar-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file: any) => handleAvatarChange(file, (val: string) => { formState.avatar = val })"
              :before-upload="beforeAvatarUpload"
              accept="image/*"
            >
              <el-button type="primary" :icon="UploadFilled">选择头像</el-button>
            </el-upload>
            <el-button
              v-if="avatarPreview || formState.avatar"
              type="danger"
              text
              size="small"
              @click="handleRemoveAvatar((val: string) => { formState.avatar = val })"
            >
              移除
            </el-button>
          </div>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="name">
              <el-input v-model="formState.name" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宠物类型" prop="type">
              <el-select v-model="formState.type" placeholder="请选择宠物类型" style="width: 100%">
                <el-option label="狗" value="dog" />
                <el-option label="猫" value="cat" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种" prop="breed">
              <el-select v-model="formState.breed" placeholder="选择或输入品种" filterable style="width: 100%">
                <el-option
                  v-for="breed in breedOptions"
                  :key="breed"
                  :label="breed"
                  :value="breed"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formState.gender">
                <el-radio-button :value="0">未知</el-radio-button>
                <el-radio-button :value="1">公</el-radio-button>
                <el-radio-button :value="2">母</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="formState.birthday"
                type="date"
                placeholder="选择生日"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :shortcuts="dateShortcuts"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重(kg)" prop="weight">
              <el-input-number v-model="formState.weight" :min="0" :precision="1" :step="0.5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="健康备注" prop="healthNotes">
              <el-input v-model="formState.healthNotes" type="textarea" :rows="2" placeholder="请输入健康备注信息（可选）" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, ArrowDown, Search, UploadFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus'
import type { DatePickerShortcuts } from 'element-plus/es/components/date-picker/src/date-picker'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePetStore } from '@/store/pet'
import type { CreatePetPayload, Pet } from '@/types/pet'
import { useRouter } from 'vue-router'
import { uploadPetAvatar } from '@/services/petService'

const petStore = usePetStore()
const router = useRouter()

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const searchValue = ref('')
const formRef = ref<FormInstance>()
const editingPetId = ref<string | number | null>(null)
const pendingAvatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

const formState = reactive<Partial<CreatePetPayload>>({
  name: '',
  breed: '',
  type: 'dog',
  gender: 1,
  birthday: null,
  weight: null,
  avatar: '',
  healthNotes: '',
})

const breedOptions = ['布偶猫', '英短', '金毛', '哈士奇', '柴犬', '兔子', '其他']

const dateShortcuts: DatePickerShortcuts = [
  {
    text: '今天',
    value: () => new Date()
  },
  {
    text: '一年前',
    value: () => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 1)
      return date
    }
  },
  {
    text: '两年前',
    value: () => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 2)
      return date
    }
  },
  {
    text: '三年前',
    value: () => {
      const date = new Date()
      date.setFullYear(date.getFullYear() - 3)
      return date
    }
  }
]

const petFormRules: FormRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择宠物类型', trigger: 'change' }],
  breed: [{ required: true, message: '请选择品种', trigger: 'change' }],
}

const genderLabel = (gender: Pet['gender']) => {
  if (gender === 1) return '公'
  if (gender === 0) return '母'
  return '-'
}

const typeLabel = (type: Pet['type']) => {
  if (type === 'dog') return '狗'
  if (type === 'cat') return '猫'
  if (type === 'other') return '其他'
  return type || '未设置类型'
}

const handleSearch = () => {
  // 前端过滤，不需要调用 API
  petStore.setSearch(searchValue.value)
}

const openAddDialog = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (pet: Pet) => {
  dialogMode.value = 'edit'
  editingPetId.value = pet.id
  Object.assign(formState, {
    name: pet.name,
    breed: pet.breed || '',
    type: pet.type || 'dog',
    gender: pet.gender ?? 1,
    birthday: pet.birthday || null,
    weight: pet.weight,
    avatar: pet.avatar || '',
    healthNotes: pet.healthNotes || '',
  })
  dialogVisible.value = true
}

const resetForm = () => {
  editingPetId.value = null
  pendingAvatarFile.value = null
  avatarPreview.value = ''
  Object.assign(formState, {
    name: '',
    breed: '',
    type: 'dog',
    gender: 1,
    birthday: null,
    weight: null,
    avatar: '',
    healthNotes: '',
  })
  formRef.value?.clearValidate()
}

const buildPayload = (): CreatePetPayload => {
  return {
    id: editingPetId.value || undefined,
    name: formState.name,
    breed: formState.breed || '',
    type: formState.type || 'dog',
    gender: (formState.gender === 0 ? 0 : 1) as 0 | 1,
    birthday: formState.birthday || null,
    weight: formState.weight,
    avatar: formState.avatar,
    healthNotes: formState.healthNotes || '',
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  const payload = buildPayload()
  // [API调用] 通过store调用 POST /pet/save - 保存宠物信息（新增或更新）
  // 保存成功后 store 会自动更新本地状态，无需重新加载
  const savedPet = await petStore.savePet(payload)
  
  if (pendingAvatarFile.value && savedPet?.id) {
    try {
      const { data } = await uploadPetAvatar(savedPet.id, pendingAvatarFile.value)
      const url = typeof data === 'string' ? data : (data.avatar || data.url || '')
      await petStore.savePet({ ...payload, id: savedPet.id, avatar: url })
      pendingAvatarFile.value = null
    } catch (e) {
      ElMessage.error('头像上传失败')
    }
  }
  
  dialogVisible.value = false
  resetForm()
}

const confirmDelete = (id: string | number) => {
  ElMessageBox.confirm('确定要删除这只宠物吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      // [API调用] 通过store调用 POST /pet/remove/{id} - 删除宠物
      await petStore.deletePet(id)
      // 删除操作已在 store 中更新本地状态，无需重新加载
    })
    .catch(() => {
      // 用户取消
    })
}

const viewDetail = (id: string | number) => {
  router.push(`/pet/${id}`)
}

const handleAvatarChange = async (file: UploadFile, update: (val: string) => void) => {
  if (!file.raw) return
  
  if (editingPetId.value) {
    try {
      const { data } = await uploadPetAvatar(editingPetId.value, file.raw)
      const url = typeof data === 'string' ? data : (data.avatar || data.url || '')
      update(url)
      formState.avatar = url
      avatarPreview.value = ''
      pendingAvatarFile.value = null
      ElMessage.success('头像上传成功')
    } catch (e) {
      ElMessage.error('头像上传失败')
    }
  } else {
    pendingAvatarFile.value = file.raw
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

const handleRemoveAvatar = (update: (val: string) => void) => {
  update('')
  formState.avatar = ''
  avatarPreview.value = ''
  pendingAvatarFile.value = null
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

const handleBatch = (type: string) => {
  // TODO: 实现批量操作功能
}

onMounted(async () => {
  // [API调用] 通过store调用 GET /pet/list - 获取当前用户的宠物列表
  // 如果 store 中已有数据且不是过期数据，则不会重复请求
  await petStore.loadPets()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.pet-page {
  padding: 24px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: vars.$font-family-base;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 320px;
}

.pet-card {
  border-radius: 20px;
  border: none;
  margin-bottom: 16px;
}

.pet-card-header {
  display: flex;
  gap: 16px;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 20px;
  }

  p {
    margin: 4px 0;
    color: #909399;
  }

  small {
    color: #c0c4cc;
  }
}

.pet-body {
  margin-top: 16px;

  ul {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;

    li {
      color: #606266;
      line-height: 1.8;
    }
  }
}

.health-tag {
  font-size: 13px;
}

.pet-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.avatar-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  
  .avatar-preview {
    border: 2px solid #e4e7ed;
  }
  
  .avatar-uploader {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .pet-page {
    padding: 16px;
  }

  .search-input {
    width: 100%;
  }
}
</style>

