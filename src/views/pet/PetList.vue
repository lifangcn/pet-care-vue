<template>
  <div class="pet-page" :class="{ 'single-pet': petStore.filteredPets.length === 1 }">
    <div v-if="petStore.filteredPets.length > 1" class="toolbar">
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

    <!-- 单个宠物时的大卡片展示 -->
    <div v-if="petStore.filteredPets.length === 1" class="single-pet-container paw-print top-left">
      <el-card shadow="never" class="single-pet-card">
        <div class="single-pet-header">
          <div class="pet-title-section">
            <div class="pet-avatar-large">
              <img :src="petStore.filteredPets[0].avatar || ''" :alt="petStore.filteredPets[0].name" />
            </div>
            <div class="pet-title-info">
              <h2 class="pet-name-large">{{ petStore.filteredPets[0].name }}</h2>
              <p class="pet-meta-text">
                {{ petStore.filteredPets[0].breed || '未设置品种' }} · {{ typeLabel(petStore.filteredPets[0].type) }} · {{ genderLabel(petStore.filteredPets[0].gender) }}
              </p>
            </div>
          </div>
          <div class="pet-header-actions">
            <el-button type="primary" :icon="Edit" @click="openEditDialog(petStore.filteredPets[0])">修改</el-button>
            <el-button type="danger" :icon="Delete" @click="confirmDelete(petStore.filteredPets[0].id)">删除</el-button>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="single-pet-detail-card">
        <div class="pet-detail-content">
          <div class="pet-info-brief">
            {{ getPetDetailString(petStore.filteredPets[0]) }}
          </div>
          <div class="pet-view-tabs">
            <el-button :type="activeView === 'basic' ? 'primary' : ''" @click="switchView('basic')">宠物详情</el-button>
            <el-button :type="activeView === 'health' ? 'primary' : ''" @click="switchView('health')">健康记录</el-button>
          </div>
          <div v-if="activeView !== 'basic'" class="content-display-area">
            <div class="health-view-header">
              <el-button-group>
                <el-button :type="healthViewMode === 'list' ? 'primary' : ''" @click="healthViewMode = 'list'">记录列表</el-button>
                <el-button :type="healthViewMode === 'chart' ? 'primary' : ''" @click="healthViewMode = 'chart'">趋势图表</el-button>
              </el-button-group>
            </div>
            <div v-if="healthViewMode === 'list'" class="health-list-view">
              <div class="health-list-header">
                <el-select v-model="healthRecordFilter" placeholder="筛选类型" clearable style="width: 150px; margin-right: 10px" @change="loadHealthRecords">
                  <el-option label="全部" value="" />
                  <el-option label="体重" value="WEIGHT" />
                  <el-option label="体温" value="TEMPERATURE" />
                  <el-option label="用药" value="MEDICAL" />
                </el-select>
                <el-button type="primary" :icon="Plus" @click="openHealthDialog">添加记录</el-button>
              </div>
              <el-table :data="filteredHealthRecords" stripe style="width: 100%">
                <el-table-column prop="recordTime" label="记录时间" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.recordTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="recordType" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getRecordTypeTag(row.recordType)" size="small">
                      {{ getRecordTypeLabel(row.recordType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
                <el-table-column label="数值" width="120">
                  <template #default="{ row }">
                    <span v-if="row.recordType === 'WEIGHT' && row.value !== null && row.value !== undefined">
                      {{ row.value }}kg
                    </span>
                    <span v-else-if="row.recordType === 'TEMPERATURE' && row.value !== null && row.value !== undefined">
                      {{ row.value }}°C
                    </span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="symptom" label="症状" min-width="150" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row.symptom || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="medicationInfo" label="用药" min-width="150" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row.medicationInfo || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="备注" min-width="200" show-overflow-tooltip>
                  <template #default="{ row }">
                    {{ row.description || '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" :icon="Edit" size="small" circle @click="editHealthRecord(row)" />
                    <el-button type="danger" :icon="Delete" size="small" circle @click="deleteRecord(row.id)" />
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="filteredHealthRecords.length === 0" description="暂无健康记录" />
              <div v-if="healthRecordPagination.totalRow > 0" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="healthRecordPagination.pageNumber"
                  v-model:page-size="healthRecordPagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="healthRecordPagination.totalRow"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleHealthRecordSizeChange"
                  @current-change="handleHealthRecordPageChange"
                />
              </div>
            </div>
            <div v-else class="health-chart-view">
              <h3>健康趋势综合图表</h3>
              <v-chart
                v-if="healthViewMode === 'chart'"
                :key="`combined-${healthRecords.length}`"
                class="chart"
                :option="combinedChartOption"
                autoresize
              />
            </div>
          </div>
          <div v-else class="content-display-area">
            <div class="pet-basic-detail">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="宠物名称">{{ petStore.filteredPets[0].name }}</el-descriptions-item>
                <el-descriptions-item label="品种">{{ petStore.filteredPets[0].breed || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="类型">{{ typeLabel(petStore.filteredPets[0].type) }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ genderLabel(petStore.filteredPets[0].gender) }}</el-descriptions-item>
                <el-descriptions-item v-if="petStore.filteredPets[0].birthday" label="生日">{{ petStore.filteredPets[0].birthday }}</el-descriptions-item>
                <el-descriptions-item v-if="petStore.filteredPets[0].weight !== null && petStore.filteredPets[0].weight !== undefined" label="体重">{{ petStore.filteredPets[0].weight }} kg</el-descriptions-item>
                <el-descriptions-item v-if="petStore.filteredPets[0].healthNotes" label="健康备注" :span="2">{{ petStore.filteredPets[0].healthNotes }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 多个宠物时的列表展示 -->
    <el-row v-else-if="petStore.filteredPets.length > 1" :gutter="20">
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
            <div class="icon-actions-top-small">
              <el-button type="primary" :icon="Edit" circle size="small" @click="openEditDialog(pet)" />
              <el-button type="danger" :icon="Delete" circle size="small" @click="confirmDelete(pet.id)" />
            </div>
          </div>
          <div class="pet-body">
            <div class="pet-detail-string">
              {{ getPetDetailString(pet) }}
            </div>
          </div>
          <div class="pet-actions">
            <el-button :type="activePetId === pet.id && activeView === 'basic' ? 'primary' : ''" size="small" @click="selectPet(pet.id, 'basic')">详情</el-button>
            <el-button :type="activePetId === pet.id && activeView === 'health' ? 'primary' : ''" size="small" @click="selectPet(pet.id, 'health')">健康记录</el-button>
          </div>
          <div v-if="activePetId === pet.id && activeView !== 'basic'" class="pet-content-area">
            <div class="health-view-header">
              <el-button-group>
                <el-button :type="healthViewMode === 'list' ? 'primary' : ''" size="small" @click="healthViewMode = 'list'">记录列表</el-button>
                <el-button :type="healthViewMode === 'chart' ? 'primary' : ''" size="small" @click="healthViewMode = 'chart'">趋势图表</el-button>
              </el-button-group>
            </div>
            <div v-if="healthViewMode === 'list'" class="health-list-view">
              <div class="health-list-header">
                <el-select v-model="healthRecordFilter" placeholder="筛选类型" clearable size="small" style="width: 120px; margin-right: 8px" @change="loadHealthRecords">
                  <el-option label="全部" value="" />
                  <el-option label="体重" value="WEIGHT" />
                  <el-option label="体温" value="TEMPERATURE" />
                  <el-option label="用药" value="MEDICAL" />
                </el-select>
                <el-button type="primary" :icon="Plus" size="small" @click="openHealthDialog">添加记录</el-button>
              </div>
              <el-table :data="filteredHealthRecords" stripe size="small" style="width: 100%">
                <el-table-column prop="recordTime" label="时间" width="150">
                  <template #default="{ row }">
                    {{ formatTime(row.recordTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="recordType" label="类型" width="80">
                  <template #default="{ row }">
                    <el-tag :type="getRecordTypeTag(row.recordType)" size="small">
                      {{ getRecordTypeLabel(row.recordType) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="title" label="标题" min-width="100" show-overflow-tooltip />
                <el-table-column label="数值" width="80">
                  <template #default="{ row }">
                    <span v-if="row.recordType === 'WEIGHT' && row.value !== null && row.value !== undefined">
                      {{ row.value }}kg
                    </span>
                    <span v-else-if="row.recordType === 'TEMPERATURE' && row.value !== null && row.value !== undefined">
                      {{ row.value }}°C
                    </span>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" :icon="Edit" size="small" circle @click="editHealthRecord(row)" />
                    <el-button type="danger" :icon="Delete" size="small" circle @click="deleteRecord(row.id)" />
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-if="filteredHealthRecords.length === 0" description="暂无健康记录" :image-size="60" />
            </div>
            <div v-else class="health-chart-view">
              <h4>健康趋势图表</h4>
              <v-chart 
                v-if="healthViewMode === 'chart'"
                :key="`combined-${healthRecords.length}`"
                class="chart-small" 
                :option="combinedChartOption"
                autoresize
              />
            </div>
          </div>
          <div v-else-if="activePetId === pet.id && activeView === 'basic'" class="pet-content-area">
            <div class="pet-basic-detail">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="宠物名称">{{ pet.name }}</el-descriptions-item>
                <el-descriptions-item label="品种">{{ pet.breed || '未设置' }}</el-descriptions-item>
                <el-descriptions-item label="类型">{{ typeLabel(pet.type) }}</el-descriptions-item>
                <el-descriptions-item label="性别">{{ genderLabel(pet.gender) }}</el-descriptions-item>
                <el-descriptions-item v-if="pet.birthday" label="生日">{{ pet.birthday }}</el-descriptions-item>
                <el-descriptions-item v-if="pet.weight !== null && pet.weight !== undefined" label="体重">{{ pet.weight }} kg</el-descriptions-item>
                <el-descriptions-item v-if="pet.healthNotes" label="健康备注" :span="2">{{ pet.healthNotes }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!petStore.loading && petStore.filteredPets.length === 0" description="暂无宠物数据">
      <el-button type="primary" :icon="Plus" @click="openAddDialog">添加第一个宠物</el-button>
    </el-empty>

    <el-button
      v-if="petStore.filteredPets.length > 0"
      :icon="Plus"
      type="primary"
      circle
      size="large"
      class="fab-button"
      @click="openAddDialog"
    />

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
              <el-radio-button :value="null">未知</el-radio-button>
              <el-radio-button value="MALE">公</el-radio-button>
              <el-radio-button value="FEMALE">母</el-radio-button>
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

    <!-- 健康记录对话框 -->
    <el-dialog
      v-model="healthDialogVisible"
      :title="editingRecordId ? '编辑健康记录' : '添加健康记录'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="healthFormRef"
        :model="healthForm"
        :rules="healthFormRules"
        label-width="100px"
      >
        <el-form-item label="记录类型" prop="recordType">
          <el-select v-model="healthForm.recordType" placeholder="请选择记录类型" style="width: 100%">
            <el-option label="体重" value="WEIGHT" />
            <el-option label="体温" value="TEMPERATURE" />
            <el-option label="用药" value="MEDICAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="healthForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item
          v-if="healthForm.recordType === 'WEIGHT' || healthForm.recordType === 'TEMPERATURE'"
          label="数值"
          prop="value"
        >
          <el-input-number
            v-model="healthForm.value"
            :min="0"
            :precision="healthForm.recordType === 'WEIGHT' ? 1 : 1"
            :step="healthForm.recordType === 'WEIGHT' ? 0.5 : 0.1"
            style="width: 100%"
            :placeholder="healthForm.recordType === 'WEIGHT' ? '请输入体重(kg)' : '请输入体温(°C)'"
          />
        </el-form-item>
        <el-form-item label="记录时间" prop="recordTime">
          <el-date-picker
            v-model="healthForm.recordTime"
            type="datetime"
            placeholder="选择记录时间"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
        <el-form-item label="症状" prop="symptom">
          <el-input v-model="healthForm.symptom" type="textarea" :rows="2" placeholder="请输入症状（可选）" />
        </el-form-item>
        <el-form-item label="用药" prop="medicationInfo">
          <el-input v-model="healthForm.medicationInfo" type="textarea" :rows="2" placeholder="请输入用药信息（可选）" />
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="healthForm.description" type="textarea" :rows="3" placeholder="请输入备注（可选）" />
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Plus, Search, UploadFilled, Avatar, Edit, Delete } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus'
type DatePickerShortcuts = Array<{
  text: string
  value: () => Date
}>
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePetStore } from '@/store/pet'
import type { CreatePetPayload, Pet, HealthRecordType } from '@/types/pet'
import { useRouter } from 'vue-router'
import { uploadPetAvatar, fetchHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord } from '@/services/petService'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const petStore = usePetStore()
const router = useRouter()

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const searchValue = ref('')
const formRef = ref<FormInstance>()
const editingPetId = ref<string | number | null>(null)
const pendingAvatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

const activeView = ref<'basic' | 'health'>('basic')
const activePetId = ref<string | number | null>(null)
const healthViewMode = ref<'list' | 'chart'>('list')
const healthRecords = ref<any[]>([])
const healthRecordFilter = ref<string>('')
const healthRecordPagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalRow: 0,
})
const healthDialogVisible = ref(false)
const editingRecordId = ref<string | number | null>(null)
const healthFormRef = ref<FormInstance>()
const healthForm = reactive({
  petId: '',
  recordType: 'WEIGHT' as HealthRecordType,
  title: '',
  description: '',
  recordTime: '',
  value: undefined as number | undefined,
  symptom: '',
  medicationInfo: '',
})

const formState = reactive<Partial<CreatePetPayload>>({
  name: '',
  breed: '',
  type: 'dog',
  gender: null,
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

const healthFormRules: FormRules = {
  recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  recordTime: [{ required: true, message: '请选择记录时间', trigger: 'change' }],
}

const genderLabel = (gender: Pet['gender']) => {
  if (gender === 'MALE') return '公'
  if (gender === 'FEMALE') return '母'
  return '未知'
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
    gender: pet.gender ?? null,
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
    gender: null,
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
    gender: (formState.gender ?? null),
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

const getPetDetailString = (pet: Pet) => {
  const parts: string[] = []
  if (pet.birthday) parts.push(`生日：${pet.birthday}`)
  if (pet.weight !== null && pet.weight !== undefined) parts.push(`体重：${pet.weight}kg`)
  if (pet.healthNotes) parts.push(`健康备注：${pet.healthNotes}`)
  return parts.length > 0 ? parts.join(' | ') : '暂无详细信息'
}

const switchView = (view: 'basic' | 'health') => {
  activeView.value = view
  if (view === 'health' && petStore.filteredPets.length === 1) {
    loadHealthRecords()
  }
}

const selectPet = (id: string | number, view: 'basic' | 'health') => {
  activePetId.value = id
  activeView.value = view
  if (view === 'health') {
    loadHealthRecords()
  }
}

const getCurrentPetId = () => {
  if (petStore.filteredPets.length === 1) {
    return petStore.filteredPets[0].id
  }
  return activePetId.value
}

const loadHealthRecords = async () => {
  const petId = getCurrentPetId()
  if (!petId) return
  
  try {
    const params: any = {
      pageNumber: healthRecordPagination.pageNumber,
      pageSize: healthRecordPagination.pageSize,
    }
    if (healthRecordFilter.value) {
      params.recordType = healthRecordFilter.value
    }
    const { data } = await fetchHealthRecords(petId, params)
    healthRecordPagination.totalRow = data?.totalRow || 0
    
    const records = Array.isArray(data) ? data : (data?.records || [])
    
    healthRecords.value = records.map((record: any) => ({
      ...record,
      recordType: record.recordType,
      recordTime: record.recordTime,
      petId: record.petId,
      medicationInfo: record.medicationInfo,
      value: record.value !== undefined ? record.value : null,
    })).sort((a: any, b: any) => {
      const timeA = a.recordTime
      const timeB = b.recordTime
      return new Date(timeB).getTime() - new Date(timeA).getTime()
    })
  } catch (error) {
    ElMessage.error('加载健康记录失败')
  }
}

const filteredHealthRecords = computed(() => {
  if (!healthRecordFilter.value) {
    return healthRecords.value
  }
  return healthRecords.value.filter(record => record.recordType === healthRecordFilter.value)
})

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getRecordTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    WEIGHT: '体重',
    TEMPERATURE: '体温',
    MEDICAL: '用药',
  }
  return map[type] || type
}

const getRecordTypeTag = (type: string) => {
  const map: Record<string, string> = {
    WEIGHT: 'success',
    TEMPERATURE: 'warning',
    MEDICAL: 'danger',
  }
  return map[type] || ''
}

const openHealthDialog = () => {
  editingRecordId.value = null
  const petId = getCurrentPetId()
  if (!petId) return
  healthForm.petId = String(petId)
  healthForm.recordType = 'WEIGHT'
  healthForm.title = ''
  healthForm.description = ''
  healthForm.recordTime = getCurrentDateTime()
  healthForm.value = undefined
  healthForm.symptom = ''
  healthForm.medicationInfo = ''
  healthDialogVisible.value = true
}

const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const editHealthRecord = (record: any) => {
  editingRecordId.value = record.id
  healthForm.petId = String(record.petId)
  healthForm.recordType = record.recordType || 'WEIGHT'
  healthForm.title = record.title || ''
  healthForm.description = record.description || ''
  healthForm.recordTime = formatDateTime(record.recordTime)
  healthForm.value = (record.value !== null && record.value !== undefined) ? Number(record.value) : undefined
  healthForm.symptom = record.symptom || ''
  healthForm.medicationInfo = record.medicationInfo || ''
  healthDialogVisible.value = true
}

const formatDateTime = (dateTime: string | null | undefined): string => {
  if (!dateTime) return getCurrentDateTime()
  if (dateTime.includes('T')) {
    return dateTime.replace('T', ' ').substring(0, 19)
  }
  if (dateTime.length === 19 && dateTime.includes(' ')) {
    return dateTime
  }
  if (dateTime.length === 16) {
    return dateTime + ':00'
  }
  return dateTime
}

const saveHealthRecord = async () => {
  if (!healthFormRef.value) return
  const valid = await healthFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const petId = getCurrentPetId()
    if (!petId) return
    
    const payload = {
      ...healthForm,
      recordType: healthForm.recordType as 'WEIGHT' | 'TEMPERATURE' | 'MEDICAL',
      petId: Number(healthForm.petId),
    }
    
    if (editingRecordId.value) {
      await updateHealthRecord(petId, editingRecordId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await createHealthRecord(petId, payload)
      ElMessage.success('添加成功')
    }
    healthDialogVisible.value = false
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
    const petId = getCurrentPetId()
    if (!petId) return
    await deleteHealthRecord(petId, id)
    ElMessage.success('删除成功')
    await loadHealthRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleHealthRecordSizeChange = (size: number) => {
  healthRecordPagination.pageSize = size
  healthRecordPagination.pageNumber = 1
  loadHealthRecords()
}

const handleHealthRecordPageChange = (page: number) => {
  healthRecordPagination.pageNumber = page
  loadHealthRecords()
}

const combinedChartOption = computed(() => {
  const allRecords = healthRecords.value || []
  
  const weightRecords = allRecords
    .filter((r: any) => {
      const recordType = r.recordType
      const value = r.value
      return recordType === 'WEIGHT' && value !== null && value !== undefined && value !== ''
    })
    .sort((a: any, b: any) => {
      const timeA = a.recordTime
      const timeB = b.recordTime
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })
  
  const temperatureRecords = allRecords
    .filter((r: any) => {
      const recordType = r.recordType
      const value = r.value
      return recordType === 'TEMPERATURE' && value !== null && value !== undefined && value !== ''
    })
    .sort((a: any, b: any) => {
      const timeA = a.recordTime
      const timeB = b.recordTime
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })
  
  const allDates = new Set<string>()
  weightRecords.forEach((r: any) => {
    const time = r.recordTime
    if (time) {
      const date = new Date(time)
      allDates.add(`${date.getMonth() + 1}/${date.getDate()}`)
    }
  })
  temperatureRecords.forEach((r: any) => {
    const time = r.recordTime
    if (time) {
      const date = new Date(time)
      allDates.add(`${date.getMonth() + 1}/${date.getDate()}`)
    }
  })
  
  const sortedDates = Array.from(allDates).sort((a, b) => {
    const [monthA, dayA] = a.split('/').map(Number)
    const [monthB, dayB] = b.split('/').map(Number)
    if (monthA !== monthB) return monthA - monthB
    return dayA - dayB
  })
  
  const weightData = sortedDates.map(date => {
    const record = weightRecords.find((r: any) => {
      const time = r.recordTime
      if (!time) return false
      const recordDate = new Date(time)
      return `${recordDate.getMonth() + 1}/${recordDate.getDate()}` === date
    })
    return record ? Number(record.value) : null
  })
  
  const temperatureData = sortedDates.map(date => {
    const record = temperatureRecords.find((r: any) => {
      const time = r.recordTime
      if (!time) return false
      const recordDate = new Date(time)
      return `${recordDate.getMonth() + 1}/${recordDate.getDate()}` === date
    })
    return record ? Number(record.value) : null
  })
  
  return {
    title: {
      text: '健康趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['体重 (kg)', '体温 (°C)'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sortedDates,
    },
    yAxis: [
      {
        type: 'value',
        name: '体重 (kg)',
        position: 'left',
      },
      {
        type: 'value',
        name: '体温 (°C)',
        position: 'right',
      },
    ],
    series: [
      {
        name: '体重 (kg)',
        type: 'line',
        yAxisIndex: 0,
        data: weightData,
        smooth: true,
        itemStyle: { color: '#409eff' },
      },
      {
        name: '体温 (°C)',
        type: 'line',
        yAxisIndex: 1,
        data: temperatureData,
        smooth: true,
        itemStyle: { color: '#f56c6c' },
      },
    ],
  }
})

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


watch(() => petStore.filteredPets.length, (newLength) => {
  if (newLength === 1) {
    activeView.value = 'basic'
    activePetId.value = null
  } else if (newLength > 1 && !activePetId.value) {
    activePetId.value = null
    activeView.value = 'basic'
  }
})

onMounted(async () => {
  // [API调用] 通过store调用 GET /pet/list - 获取当前用户的宠物列表
  // 如果 store 中已有数据且不是过期数据，则不会重复请求
  await petStore.loadPets()
  if (petStore.filteredPets.length === 1) {
    activeView.value = 'basic'
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.pet-page {
  padding: 0;
  min-height: 100%;
  font-family: vars.$font-family-body;
}

.single-pet-container {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.single-pet-card {
  border-radius: pet.$pet-radius-lg;
  border: 1px solid rgba(255, 138, 76, 0.2);
  background: linear-gradient(135deg, #fff, #fffbf7);
  box-shadow: pet.$pet-shadow;
}

.single-pet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}

.pet-title-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.pet-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid rgba(255, 138, 76, 0.3);
  box-shadow: 0 4px 12px rgba(255, 138, 76, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pet-title-info {
  flex: 1;
}

.pet-name-large {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  font-family: vars.$font-family-cute;
  color: vars.$pet-charcoal;
  letter-spacing: -0.5px;
}

.pet-meta-text {
  margin: 0;
  color: pet.$pet-warm-gray;
  font-size: 15px;
}

.pet-header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.single-pet-detail-card {
  border-radius: pet.$pet-radius-lg;
  border: 2px solid rgba(255, 138, 76, 0.25);
  box-shadow: pet.$pet-shadow;
}

.pet-detail-content {
  padding: 24px;
}

.pet-info-brief {
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(255, 138, 76, 0.08), rgba(255, 209, 166, 0.08));
  border-radius: pet.$pet-radius-md;
  color: vars.$pet-charcoal;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 138, 76, 0.2);
  font-family: vars.$font-family-body;
}

.pet-view-tabs {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid pet.$pet-border-color;
  margin-bottom: 16px;

  .el-button {
    font-family: vars.$font-family-cute;
    font-weight: 500;
  }
}

.health-view-header {
  margin-bottom: 16px;
  display: flex;
}

.health-list-view {
  .health-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
}

.health-chart-view {
  h3, h4 {
    margin: 0 0 16px;
    color: vars.$pet-charcoal;
  }

  .chart {
    width: 100%;
    height: 360px;
  }

  .chart-small {
    width: 100%;
    height: 280px;
  }
}

.pet-basic-detail {
  padding: 16px 0;
}

.pet-content-area {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.pet-card {
  border-radius: pet.$pet-radius-md;
  border: 1px solid pet.$pet-border-color;
  background: #fff;
  margin-bottom: 12px;
}

.pet-card-header {
  display: flex;
  gap: 16px;
  align-items: center;
  position: relative;

  h3 {
    margin: 0;
    font-size: 18px;
    font-family: vars.$font-family-cute;
    font-weight: 600;
    color: vars.$pet-charcoal;
  }

  p {
    margin: 4px 0;
    color: #888;
    font-size: 14px;
    font-family: vars.$font-family-body;
  }

  .icon-actions-top-small {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    gap: 8px;
  }
}

.pet-body {
  margin-top: 12px;
}

.health-tag {
  font-size: 13px;
}

.pet-actions {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;

  .el-button {
    flex: 1;
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

.fab-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  box-shadow: pet.$pet-shadow;
  @include anim.anim-elastic;

  &:hover {
    box-shadow: pet.$pet-shadow-hover;
  }
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }

  .fab-button {
    right: 16px;
    bottom: 16px;
  }

  .single-pet-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .pet-title-section {
    width: 100%;
  }

  .pet-header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .pet-view-tabs {
    flex-wrap: wrap;
  }
}
</style>

