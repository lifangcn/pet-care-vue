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
            <el-avatar :size="72" :src="pet.avatar" />
            <div class="pet-meta">
              <h3>{{ pet.name }}</h3>
              <p>{{ pet.breed }} · {{ pet.age }} · {{ genderLabel(pet.gender) }}</p>
              <small>上次体检：{{ pet.lastCheck }}</small>
            </div>
          </div>
          <div class="pet-body">
            <el-tag :type="healthTagMap[pet.healthStatus].type" class="health-tag">
              {{ healthTagMap[pet.healthStatus].label }}
            </el-tag>
            <ul>
              <li>生日：{{ pet.birthday }}</li>
              <li>体重：{{ pet.weight }} kg</li>
              <li>绝育：{{ pet.neutered ? '已完成' : '未绝育' }}</li>
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
        v-model="formState"
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
            <el-radio-button label="male">公</el-radio-button>
            <el-radio-button label="female">母</el-radio-button>
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

const formState = reactive<CreatePetPayload>({
  name: '',
  breed: '',
  gender: 'male',
  birthday: '',
  weight: null,
  neutered: false,
  avatar: '',
  healthStatus: 'good',
  vaccineRecord: '',
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
        { label: '公', value: 'male' },
        { label: '母', value: 'female' },
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
      label: '疫苗记录',
      prop: 'vaccineRecord',
      placeholder: '请输入疫苗信息',
      props: { rows: 2 },
    },
    {
      type: 'textarea',
      label: '过敏史',
      prop: 'allergies',
      placeholder: '请输入过敏信息',
      props: { rows: 2 },
    },
  ],
}

const healthTagMap = {
  good: { label: '健康良好', type: 'success' as const },
  warn: { label: '需要注意', type: 'warning' as const },
  bad: { label: '健康偏差', type: 'danger' as const },
}

const genderLabel = (gender: Pet['gender']) => (gender === 'male' ? '公' : '母')

const handleSearch = () => {
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
    gender: pet.gender,
    birthday: pet.birthday,
    weight: pet.weight,
    neutered: pet.neutered,
    avatar: pet.avatar,
    healthStatus: pet.healthStatus,
    vaccineRecord: pet.vaccineRecord,
    allergies: pet.allergies,
  })
  dialogVisible.value = true
}

const resetForm = () => {
  editingPetId.value = null
  Object.assign(formState, {
    name: '',
    breed: '',
    gender: 'male',
    birthday: '',
    weight: null,
    neutered: false,
    avatar: '',
    healthStatus: 'good',
    vaccineRecord: '',
    allergies: '',
  })
  formRef.value?.clearValidate()
}

const buildPayload = (): CreatePetPayload => {
  const data = formRef.value?.getFormData() || formState
  return {
    name: data.name,
    breed: data.breed,
    gender: data.gender,
    birthday: data.birthday,
    weight: data.weight,
    neutered: data.neutered,
    avatar: data.avatar,
    healthStatus: data.healthStatus,
    vaccineRecord: data.vaccineRecord,
    allergies: data.allergies,
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
  if (dialogMode.value === 'create') {
    // [API调用] 通过store调用 POST /pets - 创建新宠物
    await petStore.addPet(payload)
  } else if (editingPetId.value) {
    // [API调用] 通过store调用 PUT /pets/:id - 更新宠物信息
    await petStore.editPet(editingPetId.value, payload)
  }
  dialogVisible.value = false
  resetForm()
}

const confirmDelete = (id: string) => {
  // [API调用] 通过store调用 DELETE /pets/:id - 删除宠物
  petStore.deletePet(id)
}

const viewDetail = (id: string) => {
  router.push(`/pet/${id}`)
}

const handleUploadSuccess = (_: unknown, file: any) => {
  formState.avatar = file?.url || ''
}

const handleBatch = (type: string) => {
  console.log('batch action', type)
}

onMounted(() => {
  // [API调用] 通过store调用 GET /pets - 加载宠物列表
  petStore.loadPets()
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

