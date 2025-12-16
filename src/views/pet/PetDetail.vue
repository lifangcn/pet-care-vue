<template>
  <div class="pet-detail-page">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
        <el-skeleton-item variant="h1" style="width: 40%" />
        <el-skeleton-item variant="text" style="width: 60%" />
      </template>
      <template #default>
        <div v-if="pet" class="pet-header">
          <el-avatar :size="120" :src="pet.avatar" />
          <div class="pet-info">
            <h1>{{ pet.name }}</h1>
            <p>{{ pet.breed }} · {{ pet.age }} · {{ genderLabel(pet.gender) }}</p>
            <el-tag :type="healthTagMap[pet.healthStatus || 'good'].type" size="large">
              {{ healthTagMap[pet.healthStatus || 'good'].label }}
            </el-tag>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="tab-content">
              <div class="tab-header">
                <h3>宠物档案</h3>
                <el-button type="primary" :icon="Edit" @click="editMode = !editMode">
                  {{ editMode ? '取消编辑' : '编辑信息' }}
                </el-button>
              </div>
              <DynamicForm
                ref="basicFormRef"
                :config="basicFormConfig"
                :model-value="basicForm"
                @update:model-value="(val) => Object.assign(basicForm, val)"
                :disabled="!editMode"
              >
                <template #gender-radio="{ value, update }">
                  <el-radio-group :model-value="value" @update:model-value="update">
                    <el-radio-button label="male">公</el-radio-button>
                    <el-radio-button label="female">母</el-radio-button>
                  </el-radio-group>
                </template>
              </DynamicForm>
              <div v-if="editMode" class="form-actions">
                <el-button type="primary" @click="saveBasicInfo">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="健康记录" name="health">
            <div class="tab-content">
              <div class="tab-header">
                <h3>健康记录</h3>
                <el-button type="primary" :icon="Plus" @click="openHealthDialog">添加记录</el-button>
              </div>
              <el-timeline>
                <el-timeline-item
                  v-for="record in healthRecords"
                  :key="record.id"
                  :timestamp="record.date"
                  placement="top"
                >
                  <el-card shadow="hover">
                    <div class="health-record-item">
                      <div class="record-info">
                        <p v-if="record.weight" class="record-field">
                          <el-icon><DataLine /></el-icon>
                          体重：{{ record.weight }}kg
                        </p>
                        <p v-if="record.temperature" class="record-field">
                          <el-icon><Sunny /></el-icon>
                          体温：{{ record.temperature }}°C
                        </p>
                        <p v-if="record.symptoms" class="record-field">
                          <el-icon><Warning /></el-icon>
                          症状：{{ record.symptoms }}
                        </p>
                        <p v-if="record.notes" class="record-notes">{{ record.notes }}</p>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-if="healthRecords.length === 0" description="暂无健康记录" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="成长日记" name="diary">
            <div class="tab-content">
              <div class="tab-header">
                <h3>成长日记</h3>
                <el-button type="primary" :icon="Plus" @click="openDiaryDialog">添加日记</el-button>
              </div>
              <el-row :gutter="16">
                <el-col v-for="diary in diaries" :key="diary.id" :xs="24" :sm="12" :lg="8">
                  <el-card shadow="hover" class="diary-card">
                    <div class="diary-images" v-if="diary.images.length > 0">
                      <el-image
                        v-for="(img, idx) in diary.images.slice(0, 3)"
                        :key="idx"
                        :src="img"
                        fit="cover"
                        lazy
                        class="diary-image"
                      />
                    </div>
                    <div class="diary-content">
                      <h4>{{ diary.title }}</h4>
                      <p>{{ diary.content }}</p>
                      <div class="diary-date">{{ diary.date }}</div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
              <el-empty v-if="diaries.length === 0" description="暂无成长日记" />
            </div>
          </el-tab-pane>

          <el-tab-pane label="健康图表" name="chart">
            <div class="tab-content">
              <div class="chart-container">
                <div class="chart-item">
                  <h3>体重变化曲线</h3>
                  <v-chart class="chart" :option="weightChartOption" />
                </div>
                <div class="chart-item">
                  <h3>体温趋势</h3>
                  <v-chart class="chart" :option="temperatureChartOption" />
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-skeleton>

    <!-- 健康记录对话框 -->
    <el-dialog v-model="healthDialogVisible" title="添加健康记录" width="600px">
      <el-form ref="healthFormRef" :model="healthForm" :rules="healthRules" label-width="100px">
        <el-form-item label="记录日期" prop="date">
          <el-date-picker v-model="healthForm.date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="体重(kg)" prop="weight">
          <el-input-number v-model="healthForm.weight" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="体温(°C)" prop="temperature">
          <el-input-number v-model="healthForm.temperature" :precision="1" :min="0" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="症状" prop="symptoms">
          <el-input v-model="healthForm.symptoms" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="healthForm.notes" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="healthDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHealthRecord">保存</el-button>
      </template>
    </el-dialog>

    <!-- 成长日记对话框 -->
    <el-dialog v-model="diaryDialogVisible" title="添加成长日记" width="700px">
      <el-form ref="diaryFormRef" :model="diaryForm" :rules="diaryRules" label-width="100px">
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="diaryForm.date" type="date" style="width: 100%" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="diaryForm.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="diaryForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            v-model:file-list="diaryForm.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="diaryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDiary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Edit, Plus, DataLine, Sunny, Warning } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart, { THEME_KEY } from 'vue-echarts'
import { fetchPetById, savePet, fetchHealthRecords, createHealthRecord, fetchDiaries, createDiary } from '@/services/petService'
import type { Pet, HealthRecord, Diary, CreateHealthRecordPayload, CreateDiaryPayload, CreatePetPayload } from '@/types/pet'
import DynamicForm from '@/components/shared/DynamicForm.vue'
import type { DynamicFormConfig } from '@/types/form'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const route = useRoute()
const router = useRouter()
const petId = route.params.id as string

const loading = ref(true)
const pet = ref<Pet | null>(null)
const activeTab = ref('basic')
const editMode = ref(false)

const basicFormRef = ref<InstanceType<typeof DynamicForm>>()
const healthFormRef = ref<FormInstance>()
const diaryFormRef = ref<FormInstance>()

const healthRecords = ref<HealthRecord[]>([])
const diaries = ref<Diary[]>([])

const healthDialogVisible = ref(false)
const diaryDialogVisible = ref(false)

const basicForm = reactive({
  name: '',
  breed: '',
  gender: 'male' as 'male' | 'female',
  birthday: '',
  weight: null as number | null,
  neutered: false,
  allergies: '',
  healthNotes: '',
})

const healthForm = reactive<CreateHealthRecordPayload>({
  petId: '',
  date: '',
  weight: undefined,
  temperature: undefined,
  symptoms: '',
  notes: '',
})

const diaryForm = reactive<CreateDiaryPayload & { images: UploadFile[] }>({
  petId: '',
  title: '',
  content: '',
  images: [],
  date: '',
})

const breedOptions = [
  { label: '中华田园犬', value: 'native-dog' },
  { label: '金毛寻回犬', value: 'golden' },
  { label: '布偶猫', value: 'ragdoll' },
  { label: '英短', value: 'british-shorthair' },
  { label: '其他', value: 'other' },
]

const basicFormConfig: DynamicFormConfig = {
  labelWidth: '120px',
  fields: [
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
      placeholder: '请选择品种',
      options: breedOptions.map((b) => ({ label: b.label, value: b.value })),
      rules: [{ required: true, message: '请选择品种', trigger: 'change' }],
      props: { filterable: true },
      span: 12,
    },
    {
      type: 'radio-group',
      label: '性别',
      prop: 'gender',
      slot: 'gender-radio',
      options: [
        { label: '公', value: 'male' },
        { label: '母', value: 'female' },
      ],
      rules: [{ required: true, message: '请选择性别', trigger: 'change' }],
      span: 12,
    },
    {
      type: 'date',
      label: '生日',
      prop: 'birthday',
      placeholder: '请选择生日',
      rules: [{ required: true, message: '请选择生日', trigger: 'change' }],
      span: 12,
    },
    {
      type: 'number',
      label: '体重(kg)',
      prop: 'weight',
      placeholder: '请输入体重',
      props: { precision: 2, min: 0, style: { width: '100%' } },
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
      type: 'textarea',
      label: '过敏信息',
      prop: 'allergies',
      placeholder: '请输入过敏信息（可选）',
      props: { rows: 3 },
      span: 24,
    },
    {
      type: 'textarea',
      label: '健康备注',
      prop: 'healthNotes',
      placeholder: '请输入健康备注信息（可选）',
      props: { rows: 3 },
      span: 24,
    },
  ],
}

const healthTagMap: Record<string, { type: 'success' | 'warning' | 'danger'; label: string }> = {
  good: { type: 'success', label: '良好' },
  warn: { type: 'warning', label: '注意' },
  bad: { type: 'danger', label: '差' },
}

const genderLabel = (gender: any) => {
  if (gender === 'male' || gender === 1) return '公'
  if (gender === 'female' || gender === 2) return '母'
  return '未知'
}


const healthRules: FormRules = {
  date: [{ required: true, message: '请选择记录日期', trigger: 'change' }],
}

const diaryRules: FormRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

const weightChartOption = computed(() => {
  const dates = healthRecords.value
    .filter((r) => r.weight)
    .map((r) => r.date)
    .reverse()
  const weights = healthRecords.value
    .filter((r) => r.weight)
    .map((r) => r.weight!)
    .reverse()

  return {
    title: {
      text: '体重变化',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: '体重(kg)',
    },
    series: [
      {
        name: '体重',
        type: 'line',
        data: weights,
        smooth: true,
        itemStyle: { color: '#54A0FF' },
      },
    ],
  }
})

const temperatureChartOption = computed(() => {
  const dates = healthRecords.value
    .filter((r) => r.temperature)
    .map((r) => r.date)
    .reverse()
  const temperatures = healthRecords.value
    .filter((r) => r.temperature)
    .map((r) => r.temperature!)
    .reverse()

  return {
    title: {
      text: '体温趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: '体温(°C)',
    },
    series: [
      {
        name: '体温',
        type: 'line',
        data: temperatures,
        smooth: true,
        itemStyle: { color: '#FF9F43' },
      },
    ],
  }
})

/**
 * [API调用] GET /pets/:id
 * 加载宠物详情信息
 */
const loadPet = async () => {
  try {
    loading.value = true
    // [API调用] GET /pets/:id - 获取宠物详情
    const { data } = await fetchPetById(petId)
    pet.value = data
    Object.assign(basicForm, {
      name: data.name,
      breed: data.breed,
      gender: data.gender === 1 ? 'male' : data.gender === 2 ? 'female' : 'male',
      birthday: data.birthday,
      weight: data.weight,
      neutered: data.isSterilized ?? data.neutered ?? false,
      allergies: data.allergyInfo || data.allergies || '',
      healthNotes: data.healthNotes || '',
    })
  } catch (error) {
    ElMessage.error('加载宠物信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

/**
 * [API调用] GET /pets/:petId/health-records
 * 加载健康记录列表
 */
const loadHealthRecords = async () => {
  try {
    // [API调用] GET /pets/:petId/health-records - 获取健康记录列表
    const { data } = await fetchHealthRecords(petId)
    healthRecords.value = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    ElMessage.error('加载健康记录失败')
  }
}

/**
 * [API调用] GET /pets/:petId/diaries
 * 加载成长日记列表
 */
const loadDiaries = async () => {
  try {
    // [API调用] GET /pets/:petId/diaries - 获取成长日记列表
    const { data } = await fetchDiaries(petId)
    diaries.value = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    ElMessage.error('加载成长日记失败')
  }
}

/**
 * [API调用] PUT /pets/:id
 * 保存宠物基本信息
 */
const saveBasicInfo = async () => {
  if (!basicFormRef.value) return
  const valid = await basicFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const formData = basicFormRef.value.getFormData() as any
    // 构建保存的 payload，转换字段格式
    const payload: CreatePetPayload & { id?: string | number } = {
      id: petId,
      name: formData.name,
      breed: formData.breed,
      type: pet.value?.type || 1,
      gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 2 : 0,
      birthday: formData.birthday,
      weight: formData.weight,
      isSterilized: formData.neutered ?? false,
      neutered: formData.neutered ?? false,
      avatarUrl: pet.value?.avatarUrl || pet.value?.avatar || '',
      healthStatus: pet.value?.healthStatus || 'good',
      healthNotes: formData.healthNotes || '',
      allergyInfo: formData.allergies || '',
    }
    // [API调用] POST /pets/save - 保存宠物信息（更新）
    await savePet(payload)
    ElMessage.success('保存成功')
    editMode.value = false
    await loadPet()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const cancelEdit = () => {
  if (pet.value) {
    Object.assign(basicForm, {
      name: pet.value.name,
      breed: pet.value.breed,
      gender: pet.value.gender === 1 ? 'male' : pet.value.gender === 2 ? 'female' : 'male',
      birthday: pet.value.birthday,
      weight: pet.value.weight,
      neutered: pet.value.isSterilized ?? pet.value.neutered ?? false,
      allergies: pet.value.allergyInfo || pet.value.allergies || '',
      healthNotes: pet.value.healthNotes || '',
    })
  }
  editMode.value = false
}

const openHealthDialog = () => {
  healthForm.petId = petId
  healthForm.date = ''
  healthForm.weight = undefined
  healthForm.temperature = undefined
  healthForm.symptoms = ''
  healthForm.notes = ''
  healthDialogVisible.value = true
}

/**
 * [API调用] POST /health-records
 * 保存健康记录
 */
const saveHealthRecord = async () => {
  if (!healthFormRef.value) return
  const valid = await healthFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    // [API调用] POST /health-records - 创建健康记录
    await createHealthRecord(healthForm)
    ElMessage.success('添加成功')
    healthDialogVisible.value = false
    await loadHealthRecords()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const openDiaryDialog = () => {
  diaryForm.petId = petId
  diaryForm.title = ''
  diaryForm.content = ''
  diaryForm.images = []
  diaryForm.date = ''
  diaryDialogVisible.value = true
}

/**
 * [API调用] POST /diaries
 * 保存成长日记
 */
const saveDiary = async () => {
  if (!diaryFormRef.value) return
  const valid = await diaryFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const imageUrls = diaryForm.images.map((file: UploadFile) => {
      if (typeof file === 'string') return file
      if (file.url) return file.url
      if (file.response && typeof file.response === 'object' && 'url' in file.response) {
        return (file.response as { url: string }).url
      }
      return ''
    }).filter(Boolean) as string[]

    // [API调用] POST /diaries - 创建成长日记
    await createDiary({
      petId: diaryForm.petId,
      title: diaryForm.title,
      content: diaryForm.content,
      images: imageUrls,
      date: diaryForm.date,
    })
    ElMessage.success('添加成功')
    diaryDialogVisible.value = false
    await loadDiaries()
  } catch (error) {
    ElMessage.error('添加失败')
  }
}

const handlePreview = (file: UploadFile) => {
  // 预览图片逻辑
}

const handleRemove = (file: UploadFile) => {
  // 移除图片逻辑
}

onMounted(async () => {
  await loadPet()
  await loadHealthRecords()
  await loadDiaries()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.pet-detail-page {
  padding: 24px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: vars.$font-family-base;
}

.pet-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .pet-info {
    h1 {
      margin: 0 0 8px;
      font-size: 28px;
      color: #1f2d3d;
    }

    p {
      margin: 0 0 12px;
      color: #909399;
    }
  }
}

.detail-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab-content {
  padding-top: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #1f2d3d;
  }
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

.health-record-item {
  .record-info {
    .record-field {
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
    }

    .record-notes {
      margin-top: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      color: #606266;
    }
  }
}

.diary-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  .diary-images {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    .diary-image {
      width: 100px;
      height: 100px;
      border-radius: 6px;
    }
  }

  .diary-content {
    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #1f2d3d;
    }

    p {
      margin: 0 0 8px;
      color: #606266;
      font-size: 14px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .diary-date {
      color: #909399;
      font-size: 12px;
    }
  }
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.chart-item {
  h3 {
    margin: 0 0 16px;
    font-size: 18px;
    color: #1f2d3d;
  }

  .chart {
    height: 400px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .pet-header {
    flex-direction: column;
    text-align: center;
  }

  .chart-item .chart {
    height: 300px;
  }
}
</style>

