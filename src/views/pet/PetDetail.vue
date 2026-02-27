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
              <el-form
                ref="basicFormRef"
                :model="basicForm"
                :rules="basicFormRules"
                label-width="120px"
              >
                <el-row :gutter="20">
                  <el-col :span="24">
                    <el-form-item label="宠物头像">
                      <div class="avatar-upload-wrapper">
                        <el-avatar v-if="basicForm.avatar || pet?.avatar" :size="80" :src="basicForm.avatar || pet?.avatar" class="avatar-preview" />
                        <el-upload
                          class="avatar-uploader"
                          action="#"
                          :auto-upload="false"
                          :show-file-list="false"
                          :on-change="(file: any) => handleAvatarChange(file, (val: string) => { basicForm.avatar = val })"
                          :before-upload="beforeAvatarUpload"
                          accept="image/*"
                          :disabled="!editMode"
                        >
                          <el-button type="primary" :icon="Plus" :disabled="!editMode">选择头像</el-button>
                        </el-upload>
                        <el-button
                          v-if="(basicForm.avatar || pet?.avatar) && editMode"
                          type="danger"
                          text
                          size="small"
                          @click="() => { basicForm.avatar = '' }"
                        >
                          移除
                        </el-button>
                      </div>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="宠物名称" prop="name">
                      <el-input
                        v-model="basicForm.name"
                        placeholder="请输入宠物名称"
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="类型" prop="type">
                      <el-select
                        v-model="basicForm.type"
                        placeholder="请选择类型"
                        :disabled="!editMode"
                        style="width: 100%"
                      >
                        <el-option label="狗" value="dog" />
                        <el-option label="猫" value="cat" />
                        <el-option label="其他" value="other" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="品种" prop="breed">
                      <el-select
                        v-model="basicForm.breed"
                        placeholder="请选择品种"
                        :disabled="!editMode"
                        filterable
                        style="width: 100%"
                      >
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
                      <el-radio-group v-if="editMode" v-model="basicForm.gender">
                        <el-radio-button :value="null">未知</el-radio-button>
                        <el-radio-button value="MALE">公</el-radio-button>
                        <el-radio-button value="FEMALE">母</el-radio-button>
                      </el-radio-group>
                      <span v-else class="gender-display">{{ genderLabel(basicForm.gender) }}</span>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="生日" prop="birthday">
                      <el-date-picker
                        v-model="basicForm.birthday"
                        type="date"
                        placeholder="请选择生日"
                        :disabled="!editMode"
                        style="width: 100%"
                        format="YYYY-MM-DD"
                        value-format="YYYY-MM-DD"
                        clearable
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="体重(kg)" prop="weight">
                      <el-input-number
                        v-model="basicForm.weight"
                        :precision="2"
                        :min="0"
                        :disabled="!editMode"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="健康备注" prop="healthNotes">
                      <el-input
                        v-model="basicForm.healthNotes"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入健康备注信息（可选）"
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
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
                <div class="header-actions">
                  <el-select v-model="healthRecordFilter" placeholder="筛选类型" clearable style="width: 150px; margin-right: 10px" @change="loadHealthRecords">
                    <el-option label="全部" value="" />
                    <el-option label="体重" value="WEIGHT" />
                    <el-option label="体温" value="TEMPERATURE" />
                    <el-option label="用药" value="MEDICAL" />
                  </el-select>
                  <el-button type="primary" :icon="Plus" @click="openHealthDialog">添加记录</el-button>
                </div>
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
          </el-tab-pane>

          <el-tab-pane label="健康图表" name="chart">
            <div class="tab-content">
              <div class="chart-container">
                <div class="chart-item">
                  <h3>健康趋势综合图表</h3>
                  <v-chart 
                    v-if="activeTab === 'chart'"
                    :key="`combined-${healthRecords.length}`"
                    class="chart" 
                    :option="combinedChartOption"
                    autoresize
                  />
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
        <el-form-item label="记录类型" prop="recordType">
          <el-select v-model="healthForm.recordType" style="width: 100%">
            <el-option label="体重" value="WEIGHT" />
            <el-option label="体温" value="TEMPERATURE" />
            <el-option label="用药" value="MEDICAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录时间" prop="recordTime">
          <el-date-picker
            v-model="healthForm.recordTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
            placeholder="选择记录时间"
            style="width: 100%"
            :shortcuts="dateTimeShortcuts"
            :default-time="new Date(2000, 1, 1, 9, 0, 0)"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="healthForm.recordType === 'WEIGHT'" label="体重(kg)" prop="value">
          <el-input-number v-model="healthForm.value" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="healthForm.recordType === 'TEMPERATURE'" label="体温(°C)" prop="value">
          <el-input-number v-model="healthForm.value" :precision="1" :min="0" :max="50" style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="healthForm.recordType === 'MEDICAL'" label="症状" prop="symptom">
          <el-input v-model="healthForm.symptom" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item v-if="healthForm.recordType === 'MEDICAL'" label="用药信息" prop="medicationInfo">
          <el-input v-model="healthForm.medicationInfo" type="textarea" :rows="2" />
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FormInstance, FormRules, UploadProps, UploadFile } from 'element-plus'
type DatePickerShortcuts = Array<{
  text: string
  value: () => Date
}>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Plus, DataLine, Sunny, Warning, Delete } from '@element-plus/icons-vue'
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
import { fetchPetById, savePet, fetchHealthRecords, createHealthRecord, updateHealthRecord, deleteHealthRecord, uploadPetAvatar } from '@/services/petService'
import type { Pet, HealthRecord, CreateHealthRecordPayload, CreatePetPayload } from '@/types/pet'

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
const activeTab = ref((route.query.tab as string) || 'basic')
const editMode = ref(false)

const basicFormRef = ref<FormInstance>()
const healthFormRef = ref<FormInstance>()

const healthRecords = ref<HealthRecord[]>([])
const healthRecordFilter = ref<string>('')

const healthRecordPagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalRow: 0,
})

const healthDialogVisible = ref(false)
const editingRecordId = ref<string | number | null>(null)

const basicForm = reactive({
  name: '',
  type: '' as string,
  breed: '',
  gender: null as Pet['gender'],
  birthday: '' as string,
  weight: null as number | null,
  healthNotes: '',
  avatar: '' as string,
})

const healthForm = reactive<CreateHealthRecordPayload & { symptom?: string }>({
  petId: '',
  recordType: 'WEIGHT',
  title: '',
  description: '',
  recordTime: '',
  value: undefined,
  symptom: '',
  medicationInfo: '',
})


const breedOptions = ['中华田园犬', '金毛寻回犬', '布偶猫', '英短', '其他']

const getCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const dateTimeShortcuts: DatePickerShortcuts = [
  {
    text: '今天',
    value: () => {
      const now = new Date()
      return now
    }
  },
  {
    text: '昨天',
    value: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    }
  },
  {
    text: '一周前',
    value: () => {
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      return lastWeek
    }
  },
  {
    text: '一个月前',
    value: () => {
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      return lastMonth
    }
  }
]

const basicFormRules: FormRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
}


const genderLabel = (gender: Pet['gender']) => {
  if (gender === 'MALE') return '公'
  if (gender === 'FEMALE') return '母'
  return '未知'
}

const typeLabel = (type: any) => {
  if (type === 'dog') return '狗'
  if (type === 'cat') return '猫'
  if (type === 'other') return '其他'
  return type || '未设置类型'
}

const getRecordTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    WEIGHT: '体重',
    TEMPERATURE: '体温',
    MEDICAL: '用药',
  }
  return map[type] || type
}

const getRecordTypeTag = (type: string): 'primary' | 'warning' | 'danger' | 'success' | 'info' => {
  const map: Record<string, 'primary' | 'warning' | 'danger' | 'success' | 'info'> = {
    WEIGHT: 'primary',
    TEMPERATURE: 'warning',
    MEDICAL: 'danger',
  }
  return map[type] || 'info'
}

const filteredHealthRecords = computed(() => {
  if (!healthRecordFilter.value) {
    return healthRecords.value
  }
  return healthRecords.value.filter(record => record.recordType === healthRecordFilter.value)
})

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
      const recordDateStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`
      return recordDateStr === date
    })
    return record ? Number(record.value) : null
  })
  
  const temperatureData = sortedDates.map(date => {
    const record = temperatureRecords.find((r: any) => {
      const time = r.recordTime
      if (!time) return false
      const recordDate = new Date(time)
      const recordDateStr = `${recordDate.getMonth() + 1}/${recordDate.getDate()}`
      return recordDateStr === date
    })
    return record ? Number(record.value) : null
  })
  
  const series: any[] = []
  
  if (weightData.some(v => v !== null)) {
    series.push({
      name: '体重',
      type: 'line',
      yAxisIndex: 0,
      data: weightData,
      smooth: true,
      connectNulls: true,
      itemStyle: { color: '#54A0FF' },
      lineStyle: { color: '#54A0FF', width: 2 },
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(84, 160, 255, 0.3)' },
            { offset: 1, color: 'rgba(84, 160, 255, 0.1)' },
          ],
        },
      },
    })
  }
  
  if (temperatureData.some(v => v !== null)) {
    series.push({
      name: '体温',
      type: 'line',
      yAxisIndex: 1,
      data: temperatureData,
      smooth: true,
      connectNulls: true,
      itemStyle: { color: '#FF9F43' },
      lineStyle: { color: '#FF9F43', width: 2 },
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 159, 67, 0.3)' },
            { offset: 1, color: 'rgba(255, 159, 67, 0.1)' },
          ],
        },
      },
    })
  }
  
  if (series.length === 0) {
    return {
      title: {
        text: '健康趋势综合图表',
        left: 'center',
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999',
        },
      },
    }
  }
  
  return {
    title: {
      text: '健康趋势综合图表',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let result = params[0].name + '<br/>'
        params.forEach((param: any) => {
          if (param.value !== null && param.value !== undefined) {
            const unit = param.seriesName === '体重' ? 'kg' : '°C'
            result += `${param.marker}${param.seriesName}: ${param.value}${unit}<br/>`
          }
        })
        return result
      },
    },
    legend: {
      data: series.map(s => s.name),
      top: 30,
      selectedMode: 'multiple',
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: sortedDates,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: 'value',
        name: '体重(kg)',
        position: 'left',
        axisLine: {
          lineStyle: { color: '#54A0FF' },
        },
        axisLabel: {
          formatter: '{value} kg',
        },
      },
      {
        type: 'value',
        name: '体温(°C)',
        position: 'right',
        axisLine: {
          lineStyle: { color: '#FF9F43' },
        },
        axisLabel: {
          formatter: '{value} °C',
        },
      },
    ],
    series,
  }
})

const healthRules: FormRules = {
  recordType: [{ required: true, message: '请选择记录类型', trigger: 'change' }],
  recordTime: [{ required: true, message: '请选择记录时间', trigger: 'change' }],
}


const weightChartOption = computed(() => {
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
  
  const dates = weightRecords.map((r: any) => {
    const time = r.recordTime
    if (!time) return ''
    try {
      const date = new Date(time)
      return `${date.getMonth() + 1}/${date.getDate()}`
    } catch (e) {
      return ''
    }
  })
  
  const weights = weightRecords.map((r: any) => Number(r.value))

  if (dates.length === 0 || weights.length === 0) {
    return {
      title: {
        text: '体重变化',
        left: 'center',
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999',
        },
      },
    }
  }

  const option = {
    title: {
      text: '体重变化',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: ${param.value}kg`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
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
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(84, 160, 255, 0.3)' },
              { offset: 1, color: 'rgba(84, 160, 255, 0.1)' },
            ],
          },
        },
      },
    ],
  }
  
  return option
})

const temperatureChartOption = computed(() => {
  const allRecords = healthRecords.value || []
  
  const temperatureRecords = allRecords
    .filter((r: any) => {
      const recordType = r.record_type || r.recordType
      const value = r.value
      return recordType === 'TEMPERATURE' && value !== null && value !== undefined && value !== ''
    })
    .sort((a: any, b: any) => {
      const timeA = a.record_time || a.recordTime
      const timeB = b.record_time || b.recordTime
      return new Date(timeA).getTime() - new Date(timeB).getTime()
    })
  
  const dates = temperatureRecords.map((r: any) => {
    const time = r.record_time || r.recordTime
    if (!time) return ''
    try {
      const date = new Date(time)
      return `${date.getMonth() + 1}/${date.getDate()}`
    } catch (e) {
      return ''
    }
  })
  
  const temperatures = temperatureRecords.map((r: any) => Number(r.value))

  if (dates.length === 0 || temperatures.length === 0) {
    return {
      title: {
        text: '体温趋势',
        left: 'center',
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '暂无数据',
          fontSize: 16,
          fill: '#999',
        },
      },
    }
  }

  const option = {
    title: {
      text: '体温趋势',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: ${param.value}°C`
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
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
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 159, 67, 0.3)' },
              { offset: 1, color: 'rgba(255, 159, 67, 0.1)' },
            ],
          },
        },
      },
    ],
  }
  
  return option
})


/**
 * 宠物信息相关函数
 */

/**
 * [API调用] GET /pet/info/:id
 * 加载宠物详情信息
 */
const loadPet = async () => {
  try {
    loading.value = true
    const { data } = await fetchPetById(petId)
    pet.value = data
    const healthNotes = (data as any).healthNotes || ''
    const normalizeGender = (g: any): Pet['gender'] => {
      if (g === 'MALE' || g === 'FEMALE') return g
      if (g === true || g === 1 || g === '1') return 'MALE'
      if (g === false || g === 0 || g === '0') return 'FEMALE'
      return null
    }
    Object.assign(basicForm, {
      name: data.name,
      type: data.type || '',
      breed: data.breed || '',
      gender: normalizeGender((data as any).gender),
      birthday: data.birthday || '',
      weight: data.weight,
      healthNotes: healthNotes,
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
    const payload: CreatePetPayload & { id?: string | number } = {
      id: petId,
      name: basicForm.name,
      type: basicForm.type || pet.value?.type || '',
      breed: basicForm.breed || '',
      gender: basicForm.gender ?? null,
      birthday: basicForm.birthday || null,
      weight: basicForm.weight,
      healthNotes: basicForm.healthNotes || '',
      avatar: basicForm.avatar || pet.value?.avatar || '',
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
    const healthNotes = (pet.value as any).healthNotes || ''
    Object.assign(basicForm, {
      name: pet.value.name,
      type: pet.value.type || '',
      breed: pet.value.breed || '',
      gender: ((g: any): Pet['gender'] => {
        if (g === 'MALE' || g === 'FEMALE') return g
        if (g === true || g === 1 || g === '1') return 'MALE'
        if (g === false || g === 0 || g === '0') return 'FEMALE'
        return null
      })((pet.value as any).gender),
      birthday: pet.value.birthday || '',
      weight: pet.value.weight,
      healthNotes: healthNotes,
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
 * [API调用] GET /healthRecord/list
 * 加载健康记录列表
 */
const loadHealthRecords = async () => {
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

const openHealthDialog = () => {
  editingRecordId.value = null
  healthForm.petId = petId
  healthForm.recordType = 'WEIGHT'
  healthForm.title = ''
  healthForm.description = ''
  healthForm.recordTime = getCurrentDateTime()
  healthForm.value = undefined
  healthForm.symptom = ''
  healthForm.medicationInfo = ''
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

const editHealthRecord = (record: HealthRecord) => {
  editingRecordId.value = record.id
  const recordData = record as any
  healthForm.petId = Number(recordData.petId)
  healthForm.recordType = recordData.recordType || 'WEIGHT'
  healthForm.title = recordData.title || ''
  healthForm.description = recordData.description || ''
  healthForm.recordTime = formatDateTime(recordData.recordTime)
  healthForm.value = (recordData.value !== null && recordData.value !== undefined) ? Number(recordData.value) : undefined
  healthForm.symptom = recordData.symptom || ''
  healthForm.medicationInfo = recordData.medicationInfo || ''
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
      await updateHealthRecord(petId, editingRecordId.value, healthForm)
      ElMessage.success('更新成功')
    } else {
      await createHealthRecord(petId, healthForm)
      ElMessage.success('添加成功')
    }
    healthDialogVisible.value = false
    await loadHealthRecords()
  } catch (error) {
    ElMessage.error(editingRecordId.value ? '更新失败' : '添加失败')
  }
}

const deleteRecord = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteHealthRecord(petId, id)
    ElMessage.success('删除成功')
    await loadHealthRecords()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const formatTime = (time: string | null | undefined) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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

watch(healthRecordFilter, () => {
  healthRecordPagination.pageNumber = 1
  loadHealthRecords()
})

watch(activeTab, (newTab) => {
  if (newTab === 'chart' && healthRecords.value.length === 0) {
    loadHealthRecords()
  }
})

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
  
  .header-actions {
    display: flex;
    align-items: center;
  }

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

.gender-display {
  line-height: 32px;
  font-size: 14px;
  color: #606266;
}

.health-record-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.health-record-item {
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  
  .record-type-badge {
    flex-shrink: 0;
  }
  
  .record-info {
    flex: 1;
    min-width: 0;
    
    .record-title {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
    
    .record-content {
      .record-field {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;
        
        .field-label {
          font-weight: 500;
          color: #909399;
        }
        
        .field-value {
          color: #303133;
        }
      }
    }

    .record-notes {
      margin-top: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      color: #606266;
      line-height: 1.6;
      font-size: 14px;
      
      .field-label {
        font-weight: 500;
        color: #909399;
        margin-right: 8px;
      }
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
    min-height: 400px;
  }
  
  .chart-placeholder {
    height: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 16px;
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

