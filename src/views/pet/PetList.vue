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
        placeholder="搜索宠物名称 / 品种 / 健康状态"
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
            <el-avatar :size="72" :src="pet.avatarUrl || pet.avatar" />
            <div class="pet-meta">
              <h3>{{ pet.name }}</h3>
              <p>{{ pet.breed || '未设置品种' }} · {{ typeLabel(pet.type) }} · {{ genderLabel(pet.gender) }}</p>
              <small v-if="pet.lastCheck">上次体检：{{ pet.lastCheck }}</small>
              <small v-else>暂无体检记录</small>
            </div>
          </div>
          <div class="pet-body">
            <el-tag :type="healthTagMap[pet.healthStatus || 'good'].type" class="health-tag">
              {{ healthTagMap[pet.healthStatus || 'good'].label }}
            </el-tag>
            <ul>
              <li v-if="pet.birthday">生日：{{ pet.birthday }}</li>
              <li v-if="pet.weight !== null && pet.weight !== undefined">体重：{{ pet.weight }} kg</li>
              <li>绝育：{{ (pet.isSterilized ?? pet.neutered) ? '已完成' : '未绝育' }}</li>
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
      <DynamicForm
        ref="formRef"
        :config="petFormConfig"
        :model-value="formState"
        @update:model-value="(val) => Object.assign(formState, val)"
        @validate="handleValidate"
      >
        <template #avatar-upload="{ field, value, update }">
          <el-upload
            class="avatar-uploader"
            drag
            :on-success="(res: any) => { update(res.url || ''); handleUploadSuccess(null, res) }"
            :auto-upload="false"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将头像拖拽到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 JPG/PNG，最大 2MB</div>
            </template>
          </el-upload>
        </template>
        <template #gender-radio="{ field, value, update }">
          <el-radio-group :model-value="value" @update:model-value="update">
            <el-radio-button :value="0">未知</el-radio-button>
            <el-radio-button :value="1">公</el-radio-button>
            <el-radio-button :value="2">母</el-radio-button>
          </el-radio-group>
        </template>
      </DynamicForm>
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
import type { FormInstance } from 'element-plus'
import { ElMessageBox } from 'element-plus'
import { usePetStore } from '@/store/pet'
import type { CreatePetPayload, Pet } from '@/types/pet'
import { useRouter } from 'vue-router'
import DynamicForm from '@/components/shared/DynamicForm.vue'
import type { DynamicFormConfig } from '@/types/form'

const petStore = usePetStore()
const router = useRouter()

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const searchValue = ref('')
const formRef = ref<InstanceType<typeof DynamicForm>>()
const editingPetId = ref<string | null>(null)

const formState = reactive<Partial<CreatePetPayload>>({
  name: '',
  breed: '',
  type: 1,
  gender: 0,
  birthday: '',
  weight: null,
  neutered: false,
  avatar: '',
  healthStatus: 'good',
  healthNotes: '',
  allergies: '',
})

const breedOptions = ['布偶猫', '英短', '金毛', '哈士奇', '柴犬', '兔子', '其他']

// 表单配置
const petFormConfig: DynamicFormConfig = {
  labelWidth: '96px',
  fields: [
    {
      type: 'input',
      label: '宠物头像',
      prop: 'avatar',
      slot: 'avatar-upload',
    },
    {
      type: 'input',
      label: '宠物名称',
      prop: 'name',
      placeholder: '请输入宠物名称',
      rules: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
      span: 12,
    },
    {
      type: 'select',
      label: '宠物类型',
      prop: 'type',
      options: [
        { label: '狗', value: 1 },
        { label: '猫', value: 2 },
        { label: '其他', value: 3 },
      ],
      rules: [{ required: true, message: '请选择宠物类型', trigger: 'change' }],
      span: 12,
    },
    {
      type: 'select',
      label: '品种',
      prop: 'breed',
      placeholder: '选择或输入品种',
      options: breedOptions.map((item) => ({ label: item, value: item })),
      rules: [{ required: true, message: '请选择品种', trigger: 'change' }],
      props: { filterable: true },
      span: 12,
    },
    {
      type: 'radio-group',
      label: '性别',
      prop: 'gender',
      options: [
        { label: '未知', value: 0 },
        { label: '公', value: 1 },
        { label: '母', value: 2 },
      ],
      span: 12,
      slot: 'gender-radio',
    },
    {
      type: 'date',
      label: '生日',
      prop: 'birthday',
      placeholder: '选择生日',
      rules: [{ required: true, message: '请选择生日', trigger: 'change' }],
      span: 12,
    },
    {
      type: 'number',
      label: '体重(kg)',
      prop: 'weight',
      rules: [{ required: true, message: '请输入体重', trigger: 'change' }],
      props: { min: 0, precision: 1, step: 0.5 },
      span: 12,
    },
    {
      type: 'switch',
      label: '绝育情况',
      prop: 'neutered',
      props: { activeText: '已绝育', inactiveText: '未绝育' },
      span: 12,
    },
    {
      type: 'select',
      label: '健康状态',
      prop: 'healthStatus',
      options: [
        { label: '良好', value: 'good' },
        { label: '注意', value: 'warn' },
        { label: '偏差', value: 'bad' },
      ],
      rules: [{ required: true, message: '请选择健康状态', trigger: 'change' }],
      span: 12,
    },
    {
      type: 'textarea',
      label: '健康备注',
      prop: 'healthNotes',
      placeholder: '请输入健康备注信息（可选）',
      props: { rows: 2 },
    },
    {
      type: 'textarea',
      label: '过敏信息',
      prop: 'allergies',
      placeholder: '请输入过敏信息（可选）',
      props: { rows: 2 },
    },
  ],
}

const healthTagMap = {
  good: { label: '健康良好', type: 'success' as const },
  warn: { label: '需要注意', type: 'warning' as const },
  bad: { label: '健康偏差', type: 'danger' as const },
}

const genderLabel = (gender: Pet['gender']) => {
  if (gender === 1) return '公'
  if (gender === 2) return '母'
  return '未知'
}

const typeLabel = (type: Pet['type']) => {
  if (type === 1) return '狗'
  if (type === 2) return '猫'
  return '其他'
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
    breed: pet.breed,
    type: pet.type,
    gender: pet.gender,
    birthday: pet.birthday,
    weight: pet.weight,
    neutered: pet.isSterilized ?? pet.neutered ?? false,
    avatar: pet.avatarUrl || pet.avatar || '',
    healthStatus: pet.healthStatus || 'good',
    healthNotes: pet.healthNotes || '',
    allergies: pet.allergyInfo || pet.allergies || '',
  })
  dialogVisible.value = true
}

const resetForm = () => {
  editingPetId.value = null
  Object.assign(formState, {
    name: '',
    breed: '',
    type: 1, // 默认狗
    gender: 0, // 默认未知
    birthday: '',
    weight: null,
    neutered: false,
    avatar: '',
    healthStatus: 'good',
    healthNotes: '',
    allergies: '',
  })
  formRef.value?.clearValidate()
}

const buildPayload = (): CreatePetPayload => {
  const data = formRef.value?.getFormData() || formState
  return {
    id: editingPetId.value || undefined, // 有id则为更新
    name: data.name,
    breed: data.breed,
    type: data.type || 1,
    gender: data.gender || 0,
    birthday: data.birthday,
    weight: data.weight,
    isSterilized: data.neutered ?? false,
    neutered: data.neutered ?? false, // 兼容字段
    avatarUrl: data.avatar,
    avatar: data.avatar, // 兼容字段
    healthStatus: data.healthStatus || 'good',
    healthNotes: data.healthNotes || '',
    allergyInfo: data.allergies || '',
    allergies: data.allergies || '', // 兼容字段
  }
}

const handleValidate = (isValid: boolean) => {
  // 表单验证回调
}

const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  
  const payload = buildPayload()
  // [API调用] 通过store调用 POST /pets/save - 保存宠物信息（新增或更新）
  // 保存成功后 store 会自动更新本地状态，无需重新加载
  await petStore.savePet(payload)
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
      // [API调用] 通过store调用 POST /pets/remove/{id} - 删除宠物
      await petStore.deletePet(id)
      // 删除操作已在 store 中更新本地状态，无需重新加载
    })
    .catch(() => {
      // 用户取消
    })
}

const viewDetail = (id: string) => {
  router.push(`/pet/${id}`)
}

const handleUploadSuccess = (_: unknown, file: any) => {
  formState.avatar = file?.url || ''
}

const handleBatch = (type: string) => {
  // TODO: 实现批量操作功能
}

onMounted(async () => {
  // [API调用] 通过store调用 GET /pets/list - 获取当前用户的宠物列表
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

@media (max-width: 768px) {
  .pet-page {
    padding: 16px;
  }

  .search-input {
    width: 100%;
  }
}
</style>

