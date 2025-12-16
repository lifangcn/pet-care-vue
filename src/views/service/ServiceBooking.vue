<template>
  <div class="service-booking-page">
    <div class="page-header">
      <h1>服务预约</h1>
      <p>为您的宠物选择专业的护理服务</p>
    </div>

    <div class="filter-section">
      <div class="category-filter">
        <span class="filter-label">服务分类：</span>
        <el-radio-group v-model="selectedCategory" @change="handleCategoryChange">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="medical">医疗</el-radio-button>
          <el-radio-button label="beauty">美容</el-radio-button>
          <el-radio-button label="accommodation">住宿</el-radio-button>
          <el-radio-button label="training">训练</el-radio-button>
          <el-radio-button label="grooming">洗护</el-radio-button>
        </el-radio-group>
      </div>

      <div class="view-toggle">
        <span class="toggle-label">列表模式</span>
        <el-switch v-model="isMapMode" active-text="地图模式" inactive-text="列表模式" />
      </div>
    </div>

    <div v-if="!isMapMode" class="providers-list">
      <el-row :gutter="20">
        <el-col
          v-for="provider in filteredProviders"
          :key="provider.id"
          :xs="24"
          :sm="12"
          :lg="8"
        >
          <el-card shadow="hover" class="provider-card" @click="openBookingDialog(provider)">
            <div class="provider-header">
              <el-avatar :size="64" :src="provider.avatar" />
              <div class="provider-info">
                <h3 class="provider-name">{{ provider.name }}</h3>
                <div class="provider-rating">
                  <el-rate :model-value="provider.rating" disabled show-score text-color="#ff9900" />
                  <span class="distance">{{ formatDistance(provider.distance) }}</span>
                </div>
              </div>
            </div>
            <div class="provider-details">
              <p class="address">
                <el-icon><Location /></el-icon>
                {{ provider.address }}
              </p>
              <div v-if="provider.businessHours" class="business-hours">
                <el-icon><Clock /></el-icon>
                {{ provider.businessHours }}
              </div>
            </div>
            <div class="provider-services">
              <div class="services-header">服务项目：</div>
              <div class="services-list">
                <el-tag
                  v-for="service in provider.services.slice(0, 3)"
                  :key="service.id"
                  size="small"
                  class="service-tag"
                >
                  {{ service.name }} ¥{{ service.price }}
                </el-tag>
                <el-tag v-if="provider.services.length > 3" size="small" type="info">
                  +{{ provider.services.length - 3 }} 项
                </el-tag>
              </div>
            </div>
            <div class="provider-actions">
              <el-button type="primary" @click.stop="openBookingDialog(provider)">立即预约</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="!loading && filteredProviders.length === 0" description="暂无服务商" />
    </div>

    <div v-else class="map-container">
      <div id="map-container" class="map-wrapper">
        <!-- 地图占位，后续可集成百度地图等 -->
        <div class="map-placeholder">
          <el-icon :size="64"><MapLocation /></el-icon>
          <p>地图模式</p>
          <p class="map-hint">点击服务商卡片查看位置</p>
          <div class="map-markers">
            <div
              v-for="provider in filteredProviders"
              :key="provider.id"
              class="map-marker"
              @click="openBookingDialog(provider)"
            >
              <el-avatar :size="32" :src="provider.avatar" />
              <span class="marker-name">{{ provider.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约表单对话框 -->
    <el-dialog
      v-model="bookingDialogVisible"
      :title="`预约服务 - ${selectedProvider?.name || ''}`"
      width="600px"
      destroy-on-close
    >
      <DynamicForm
        ref="bookingFormRef"
        :config="bookingFormConfig"
        :model-value="bookingForm"
        @update:model-value="(val) => Object.assign(bookingForm, val)"
      >
        <template #service-checkbox="{ value, update }">
          <el-checkbox-group :model-value="value" @update:model-value="update">
            <el-checkbox
              v-for="service in availableServices"
              :key="service.id"
              :label="service.id"
            >
              {{ service.name }}
              <span class="service-price">¥{{ service.price }}</span>
              <span v-if="service.duration" class="service-duration">({{ service.duration }}分钟)</span>
            </el-checkbox>
          </el-checkbox-group>
        </template>
        <template #pet-select="{ value, update }">
          <el-select :model-value="value" @update:model-value="update" placeholder="请选择宠物" style="width: 100%">
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
        </template>
      </DynamicForm>

      <template #footer>
        <el-button @click="bookingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitBooking">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Location, Clock, MapLocation } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { fetchProviders, createBooking } from '@/services/serviceService'
import { usePetStore } from '@/store/pet'
import type { ServiceProvider, ServiceItem, BookingForm, ServiceCategory } from '@/types/service'
import DynamicForm from '@/components/shared/DynamicForm.vue'
import type { DynamicFormConfig } from '@/types/form'

const petStore = usePetStore()

const loading = ref(false)
const providers = ref<ServiceProvider[]>([])
const selectedCategory = ref<string>('all')
const isMapMode = ref(false)
const bookingDialogVisible = ref(false)
const selectedProvider = ref<ServiceProvider | null>(null)
const availableServices = ref<ServiceItem[]>([])

const bookingFormRef = ref<InstanceType<typeof DynamicForm>>()
const bookingForm = reactive<BookingForm>({
  providerId: '',
  serviceIds: [],
  date: '',
  time: '',
  petId: '',
  notes: '',
})

const userPets = computed(() => petStore.pets)

const filteredProviders = computed(() => {
  if (selectedCategory.value === 'all') {
    return providers.value
  }
  return providers.value.filter((provider) =>
    provider.services.some((service) => service.category === selectedCategory.value),
  )
})

const bookingFormConfig = computed<DynamicFormConfig>(() => ({
  labelWidth: '100px',
  fields: [
    {
      type: 'checkbox-group',
      label: '服务项目',
      prop: 'serviceIds',
      slot: 'service-checkbox',
      rules: [{ required: true, message: '请至少选择一个服务项目', trigger: 'change' }],
      span: 24,
    },
    {
      type: 'date',
      label: '预约日期',
      prop: 'date',
      placeholder: '选择预约日期',
      rules: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
      props: {
        disabledDate: (time: Date) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return time.getTime() < today.getTime()
        },
      },
      span: 24,
    },
    {
      type: 'time',
      label: '预约时间',
      prop: 'time',
      placeholder: '选择预约时间',
      rules: [{ required: true, message: '请选择预约时间', trigger: 'change' }],
      props: {
        format: 'HH:mm',
        valueFormat: 'HH:mm',
      },
      span: 24,
    },
    {
      type: 'select',
      label: '选择宠物',
      prop: 'petId',
      placeholder: '请选择宠物',
      slot: 'pet-select',
      rules: [{ required: true, message: '请选择宠物', trigger: 'change' }],
      span: 24,
    },
    {
      type: 'textarea',
      label: '备注',
      prop: 'notes',
      placeholder: '请输入备注信息（选填）',
      props: { rows: 4 },
      span: 24,
    },
  ],
}))

/**
 * [API调用] GET /services/providers
 * 加载服务商列表
 */
const loadProviders = async () => {
  try {
    loading.value = true
    // [API调用] GET /services/providers - 获取服务商列表
    const { data } = await fetchProviders()
    providers.value = data
  } catch (error) {
    ElMessage.error('加载服务商失败')
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = () => {
  // 分类变化时重新加载服务商列表
  loadProviders()
}

const openBookingDialog = async (provider: ServiceProvider) => {
  selectedProvider.value = provider
  bookingForm.providerId = provider.id
  bookingForm.serviceIds = []
  bookingForm.date = ''
  bookingForm.time = ''
  bookingForm.petId = ''
  bookingForm.notes = ''

  // 使用服务商提供的服务项目
  availableServices.value = provider.services
  bookingDialogVisible.value = true
}


const formatDistance = (distance: number) => {
  if (distance < 1000) {
    return `${distance}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}

/**
 * [API调用] POST /services/bookings
 * 提交预约表单
 */
const handleSubmitBooking = async () => {
  if (!bookingFormRef.value) return

  const valid = await bookingFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    const formData = bookingFormRef.value.getFormData()
    // 使用MessageBox确认预约
    await ElMessageBox.confirm(
      `确认预约以下服务？\n服务商：${selectedProvider.value?.name}\n日期：${formData.date}\n时间：${formData.time}`,
      '确认预约',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info',
      },
    )

    // [API调用] POST /services/bookings - 创建服务预约
    await createBooking(formData as BookingForm)
    ElMessage.success('预约成功！')
    bookingDialogVisible.value = false
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('预约失败，请重试')
    }
  }
}

onMounted(async () => {
  await petStore.loadPets()
  await loadProviders()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.service-booking-page {
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

.filter-section {
  background: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .category-filter {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .filter-label {
      font-weight: 600;
      color: #606266;
    }
  }

  .view-toggle {
    display: flex;
    align-items: center;
    gap: 12px;

    .toggle-label {
      color: #606266;
      font-size: 14px;
    }
  }
}

.providers-list {
  .provider-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .provider-header {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .provider-info {
        flex: 1;

        .provider-name {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1f2d3d;
        }

        .provider-rating {
          display: flex;
          align-items: center;
          gap: 12px;

          .distance {
            color: #909399;
            font-size: 14px;
          }
        }
      }
    }

    .provider-details {
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;

      .address,
      .business-hours {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
        color: #606266;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .provider-services {
      margin-bottom: 16px;

      .services-header {
        font-weight: 600;
        color: #606266;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .services-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .service-tag {
          margin: 0;
        }
      }
    }

    .provider-actions {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.map-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.map-wrapper {
  width: 100%;
  height: 600px;
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #606266;

  p {
    margin: 16px 0 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .map-hint {
    font-size: 14px;
    color: #909399;
  }

  .map-markers {
    margin-top: 32px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;

    .map-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .marker-name {
        font-size: 12px;
        color: #606266;
        font-weight: 600;
      }
    }
  }
}

.pet-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-price {
  color: vars.$pet-color-orange;
  font-weight: 600;
  margin-left: 8px;
}

.service-duration {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .map-wrapper {
    height: 400px;
  }
}
</style>

