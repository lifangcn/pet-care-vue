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
            <p>
              {{ pet.breed || '未设置品种' }}
              · {{ typeLabel(pet.type) }}
              · {{ genderLabel(pet.gender) }}
              <span v-if="pet.birthday">· {{ pet.birthday }}</span>
            </p>
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
                <template #avatar-upload="{ field, value, update }">
                  <div class="avatar-upload-wrapper">
                    <el-avatar v-if="value || pet?.avatar" :size="80" :src="value || pet?.avatar" class="avatar-preview" />
                    <el-upload
                      class="avatar-uploader"
                      action="#"
                      :auto-upload="false"
                      :show-file-list="false"
                      :on-change="(file: any) => handleAvatarChange(file, update)"
                      :before-upload="beforeAvatarUpload"
                      accept="image/*"
                      :disabled="!editMode"
                    >
                      <el-button type="primary" :icon="Plus" :disabled="!editMode">选择头像</el-button>
                    </el-upload>
                    <el-button
                      v-if="(value || pet?.avatar) && editMode"
                      type="danger"
                      text
                      size="small"
                      @click="() => { update(''); basicForm.avatar = '' }"
                    >
                      移除
                    </el-button>
                  </div>
                </template>
                <template #gender-radio="{ value, update }">
                  <el-radio-group :model-value="value" @update:model-value="update">
                    <el-radio-button :value="1">公</el-radio-button>
                    <el-radio-button :value="0">母</el-radio-button>
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
                  :timestamp="formatTime(record.record_time)"
                  placement="top"
                >
                  <el-card shadow="hover" class="health-record-card">
                    <div class="health-record-item">
                      <div class="record-header">
                        <div class="record-info">
                          <p v-if="record.record_type === 'weight' && record.value !== null && record.value !== undefined" class="record-field">
                            <el-icon><DataLine /></el-icon>
                            体重：{{ record.value }}kg
                          </p>
                          <p v-if="record.record_type === 'temperature' && record.value !== null && record.value !== undefined" class="record-field">
                            <el-icon><Sunny /></el-icon>
                            体温：{{ record.value }}°C
                          </p>
                          <p v-if="record.record_type === 'medical' && record.medication_info" class="record-field">
                            <el-icon><Warning /></el-icon>
                            用药：{{ record.medication_info }}
                          </p>
                          <p v-if="record.record_type === 'reminder'" class="record-field">
                            <el-icon><Bell /></el-icon>
                            <el-tag v-if="record.is_completed" type="success" size="small">已完成</el-tag>
                            <el-tag v-else type="warning" size="small">待办</el-tag>
                          </p>
                          <p v-if="record.title" class="record-title">{{ record.title }}</p>
                          <p v-if="record.description" class="record-notes">{{ record.description }}</p>
                          <p v-if="record.record_type === 'reminder' && record.schedule_time" class="record-meta">
                            计划时间：{{ formatTime(record.schedule_time) }}
                            <span v-if="record.remind_before_minutes"> | 提前{{ record.remind_before_minutes }}分钟提醒</span>
                          </p>
                        </div>
                        <div class="record-actions">
                          <el-button
                            v-if="record.record_type === 'reminder' && !record.is_completed"
                            type="success"
                            size="small"
                            text
                            @click="completeRecord(record.id)"
                          >
                            完成
                          </el-button>
                          <el-button
                            type="primary"
                            size="small"
                            text
                            @click="editHealthRecord(record)"
                          >
                            编辑
                          </el-button>
                          <el-button
                            type="danger"
                            size="small"
                            text
                            @click="deleteRecord(record.id)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
              <el-empty v-if="healthRecords.length === 0" description="暂无健康记录" />
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
    <el-dialog v-model="healthDialogVisible" :title="editingRecordId ? '编辑健康记录' : '添加健康记录'" width="700px">
      <el-form ref="healthFormRef" :model="healthForm" :rules="healthRules" label-width="100px">
        <el-form-item label="记录类型" prop="record_type">
          <el-select v-model="healthForm.record_type" style="width: 100%">
            <el-option label="体重" value="weight" />
            <el-option label="体温" value="temperature" />
            <el-option label="提醒" value="reminder" />
            <el-option label="用药" value="medical" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录时间" prop="record_time">
          <el-date-picker v-model="healthForm.record_time" type="datetime" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'weight'" label="体重(kg)" prop="value">
          <el-input-number v-model="healthForm.value" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'temperature'" label="体温(°C)" prop="value">
          <el-input-number v-model="healthForm.value" :precision="1" :min="0" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'medical'" label="药品名称" prop="medication_info">
          <el-input v-model="healthForm.medication_info" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'reminder'" label="计划时间" prop="schedule_time">
          <el-date-picker v-model="healthForm.schedule_time" type="datetime" style="width: 100%" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'reminder'" label="提前提醒(分钟)" prop="remind_before_minutes">
          <el-input-number v-model="healthForm.remind_before_minutes" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="healthForm.record_type === 'reminder'" label="重复" prop="repeat_type">
          <el-select v-model="healthForm.repeat_type" style="width: 100%">
            <el-option label="不重复" value="none" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="healthForm.title" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="healthForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="healthDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHealthRecord">保存</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadProps, UploadFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, DataLine, Sunny, Warning, Bell } from '@element-plus/icons-vue'
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
import { fetchPetById, savePet, fetchHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord, completeHealthRecord, uploadPetAvatar } from '@/services/petService'
import type { Pet, HealthRecord, CreateHealthRecordPayload, CreatePetPayload } from '@/types/pet'
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

const healthRecords = ref<HealthRecord[]>([])

const healthDialogVisible = ref(false)
const editingRecordId = ref<string | number | null>(null)

const basicForm = reactive({
  name: '',
  type: '' as string,
  breed: '',
  gender: 1 as 0 | 1,
  birthday: '' as string,
  weight: null as number | null,
  healthNotes: '',
  avatar: '' as string,
})

const healthForm = reactive<CreateHealthRecordPayload>({
  pet_id: '',
  record_type: 'weight',
  title: '',
  description: '',
  record_time: '',
  schedule_time: '',
  remind_before_minutes: 0,
  repeat_type: 'none',
  value: undefined,
  medication_info: '',
})


const breedOptions = ['中华田园犬', '金毛寻回犬', '布偶猫', '英短', '其他']

const basicFormConfig: DynamicFormConfig = {
  labelWidth: '120px',
  fields: [
    {
      type: 'input',
      label: '宠物头像',
      prop: 'avatar',
      slot: 'avatar-upload',
      span: 24,
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
      label: '类型',
      prop: 'type',
      placeholder: '请选择类型',
      options: [
        { label: '狗', value: 'dog' },
        { label: '猫', value: 'cat' },
        { label: '其他', value: 'other' },
      ],
      span: 12,
    },
    {
      type: 'select',
      label: '品种',
      prop: 'breed',
      placeholder: '请选择品种',
      options: breedOptions.map((b) => ({ label: b, value: b })),
      props: { filterable: true },
      span: 12,
    },
    {
      type: 'radio-group',
      label: '性别',
      prop: 'gender',
      slot: 'gender-radio',
      options: [
        { label: '公', value: 1 },
        { label: '母', value: 0 },
      ],
      span: 12,
    },
    {
      type: 'date',
      label: '生日',
      prop: 'birthday',
      placeholder: '请选择生日',
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
      type: 'textarea',
      label: '健康备注',
      prop: 'healthNotes',
      placeholder: '请输入健康备注信息（可选）',
      props: { rows: 3 },
      span: 24,
    },
  ],
}


const genderLabel = (gender: any) => {
  if (gender === 1 || gender === '1') return '公'
  if (gender === 0 || gender === '0') return '母'
  return '-'
}

const typeLabel = (type: any) => {
  if (type === 'dog') return '狗'
  if (type === 'cat') return '猫'
  if (type === 'other') return '其他'
  return type || '未设置类型'
}

const healthRules: FormRules = {
  record_type: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  record_time: [{ required: true, message: '请选择记录时间', trigger: 'change' }],
}


const weightChartOption = computed(() => {
  const dates = healthRecords.value
    .filter((r) => r.record_type === 'weight' && r.value !== null && r.value !== undefined)
    .map((r) => r.record_time)
    .reverse()
  const weights = healthRecords.value
    .filter((r) => r.record_type === 'weight' && r.value !== null && r.value !== undefined)
    .map((r) => r.value as number)
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
    .filter((r) => r.record_type === 'temperature' && r.value !== null && r.value !== undefined)
    .map((r) => r.record_time)
    .reverse()
  const temperatures = healthRecords.value
    .filter((r) => r.record_type === 'temperature' && r.value !== null && r.value !== undefined)
    .map((r) => r.value as number)
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
 * 宠物信息相关函数
 */

/**
 * [API调用] GET /pet/:id
 * 加载宠物详情信息
 */
const loadPet = async () => {
  try {
    loading.value = true
    const { data } = await fetchPetById(petId)
    pet.value = data
    Object.assign(basicForm, {
      name: data.name,
      type: data.type || '',
      breed: data.breed || '',
      gender: (data.gender === 0 ? 0 : 1) as 0 | 1,
      birthday: data.birthday || '',
      weight: data.weight,
      healthNotes: data.health_notes || '',
      avatar: data.avatar || '',
    })
  } catch (error) {
    ElMessage.error('加载宠物信息失败')
    router.back()
  } finally {
    loading.value = false
  }
}

/**
 * [API调用] POST /pet/save
 * 保存宠物基本信息
 */
const saveBasicInfo = async () => {
  if (!basicFormRef.value) return
  const valid = await basicFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const formData = basicFormRef.value.getFormData() as any
    const payload: CreatePetPayload & { id?: string | number } = {
      id: petId,
      name: formData.name,
      type: formData.type || pet.value?.type || '',
      breed: formData.breed || '',
      gender: (formData.gender === 0 ? 0 : 1) as 0 | 1,
      birthday: formData.birthday || null,
      weight: formData.weight,
      health_notes: formData.healthNotes || '',
      avatar: formData.avatar || pet.value?.avatar || '',
    }
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
      type: pet.value.type || '',
      breed: pet.value.breed || '',
      gender: (pet.value.gender === 0 ? 0 : 1) as 0 | 1,
      birthday: pet.value.birthday || '',
      weight: pet.value.weight,
      healthNotes: pet.value.health_notes || '',
      avatar: pet.value.avatar || '',
    })
  }
  editMode.value = false
}

const handleAvatarChange = async (file: UploadFile, update: (val: string) => void) => {
  if (!file.raw || !petId) return
  try {
    const { data } = await uploadPetAvatar(petId, file.raw)
    const url = typeof data === 'string' ? data : (data.avatar || data.url || '')
    update(url)
    basicForm.avatar = url
    ElMessage.success('头像上传成功')
  } catch (e) {
    ElMessage.error('头像上传失败')
  }
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

/**
 * 健康记录相关函数
 */

/**
 * [API调用] GET /healthRecord/:petId
 * 加载健康记录列表
 */
const loadHealthRecords = async () => {
  try {
    const { data } = await fetchHealthRecords(petId)
    const records = Array.isArray(data) ? data : (data?.list || [])
    healthRecords.value = records.sort((a: any, b: any) => new Date(b.record_time).getTime() - new Date(a.record_time).getTime())
  } catch (error) {
    ElMessage.error('加载健康记录失败')
  }
}

const openHealthDialog = () => {
  editingRecordId.value = null
  healthForm.pet_id = petId
  healthForm.record_type = 'weight'
  healthForm.title = ''
  healthForm.description = ''
  healthForm.record_time = ''
  healthForm.schedule_time = ''
  healthForm.remind_before_minutes = 0
  healthForm.repeat_type = 'none'
  healthForm.value = undefined
  healthForm.medication_info = ''
  healthDialogVisible.value = true
}

const editHealthRecord = (record: HealthRecord) => {
  editingRecordId.value = record.id
  healthForm.pet_id = record.pet_id
  healthForm.record_type = record.record_type
  healthForm.title = record.title || ''
  healthForm.description = record.description || ''
  healthForm.record_time = record.record_time
  healthForm.schedule_time = record.schedule_time || ''
  healthForm.remind_before_minutes = record.remind_before_minutes || 0
  healthForm.repeat_type = record.repeat_type || 'none'
  healthForm.value = record.value || undefined
  healthForm.medication_info = record.medication_info || ''
  healthDialogVisible.value = true
}

/**
 * [API调用] POST /healthRecord/save 或 PUT /healthRecord/update/:id
 * 保存健康记录
 */
const saveHealthRecord = async () => {
  if (!healthFormRef.value) return
  const valid = await healthFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    if (editingRecordId.value) {
      await updateHealthRecord(editingRecordId.value, healthForm)
      ElMessage.success('更新成功')
    } else {
      await createHealthRecord(healthForm)
      ElMessage.success('添加成功')
    }
    healthDialogVisible.value = false
    await loadHealthRecords()
  } catch (error) {
    ElMessage.error(editingRecordId.value ? '更新失败' : '添加失败')
  }
}

const completeRecord = async (id: string | number) => {
  try {
    await completeHealthRecord(id)
    ElMessage.success('标记完成成功')
    await loadHealthRecords()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteRecord = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteHealthRecord(id)
    ElMessage.success('删除成功')
    await loadHealthRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}


onMounted(async () => {
  await loadPet()
  await loadHealthRecords()
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

.health-record-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.health-record-item {
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .record-info {
    flex: 1;
    
    .record-field {
      margin: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #606266;
      font-size: 15px;
    }
    
    .record-title {
      margin: 8px 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .record-notes {
      margin-top: 8px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      color: #606266;
      line-height: 1.6;
    }
    
    .record-meta {
      margin-top: 8px;
      font-size: 13px;
      color: #909399;
    }
  }
  
  .record-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
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
</style>

