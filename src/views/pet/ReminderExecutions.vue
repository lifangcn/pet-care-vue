<template>
  <div class="reminder-executions-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>提醒执行记录</h2>
          <div class="header-actions">
            <el-select v-model="filters.petId" style="width: 220px" placeholder="选择宠物" clearable @change="loadExecutions">
              <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
            </el-select>
            <el-select v-model="filters.status" style="width: 150px; margin-left: 12px" placeholder="执行状态" clearable @change="loadExecutions">
              <el-option label="待处理" value="PENDING" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已逾期" value="OVERDUE" />
            </el-select>
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm"
              style="width: 380px; margin-left: 12px"
              @change="handleDateRangeChange"
            />
          </div>
        </div>
      </template>

      <div class="execution-list">
        <el-empty v-if="executions.length === 0 && !loading" description="暂无执行记录" />
        <el-card v-for="execution in executions" :key="String(execution.id)" class="execution-item" shadow="hover">
          <div class="execution-header">
            <div class="execution-info">
              <div class="execution-title">
                <el-tag :type="getStatusType(execution.status)" size="small">{{ getStatusText(execution.status) }}</el-tag>
                <span class="execution-time">计划时间：{{ formatTime(execution.scheduleTime) }}</span>
              </div>
              <div v-if="execution.actualTime" class="execution-meta">
                <span>实际时间：{{ formatTime(execution.actualTime) }}</span>
              </div>
              <div v-if="execution.completionNotes" class="execution-notes">
                <el-icon><Document /></el-icon>
                <span>{{ execution.completionNotes }}</span>
              </div>
              <div class="execution-meta">
                <span>通知时间：{{ formatTime(execution.notificationTime) }}</span>
                <el-tag v-if="execution.isRead" type="success" size="small">已读</el-tag>
                <el-tag v-else type="info" size="small">未读</el-tag>
              </div>
            </div>
            <div class="execution-actions">
              <el-button
                v-if="execution.status === 'PENDING'"
                type="primary"
                size="small"
                @click="handleComplete(execution)"
              >
                标记完成
              </el-button>
              <el-button
                v-if="!execution.isRead"
                type="info"
                size="small"
                text
                @click="handleMarkAsRead(execution.id)"
              >
                标记已读
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNumber"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.totalRow"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="completeDialogVisible" title="完成提醒" width="500px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="完成备注">
          <el-input
            v-model="completeForm.completionNotes"
            type="textarea"
            :rows="4"
            placeholder="请输入完成备注（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { fetchPets } from '@/services/petService'
import { fetchReminderExecutions, completeReminderExecution, markExecutionAsRead } from '@/services/petService'
import type { Pet, ReminderExecution, ReminderExecutionStatus } from '@/types/pet'

const loading = ref(false)
const pets = ref<Pet[]>([])
const executions = ref<ReminderExecution[]>([])
const dateRange = ref<[string, string] | null>(null)

const filters = reactive({
  petId: undefined as string | number | undefined,
  status: undefined as ReminderExecutionStatus | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined,
})

const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalRow: 0,
})

const completeDialogVisible = ref(false)
const currentExecution = ref<ReminderExecution | null>(null)
const completeForm = reactive({
  completionNotes: '',
})

const loadPets = async () => {
  try {
    const res = await fetchPets()
    pets.value = res.data || []
  } catch (error) {
    ElMessage.error('加载宠物列表失败')
  }
}

const loadExecutions = async () => {
  try {
    loading.value = true
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    }
    if (filters.petId) {
      params.petId = filters.petId
    }
    if (filters.status) {
      params.status = filters.status
    }
    if (filters.startTime) {
      params.startTime = filters.startTime
    }
    if (filters.endTime) {
      params.endTime = filters.endTime
    }

    const res = await fetchReminderExecutions(params)
    executions.value = res.data.records || []
    pagination.totalRow = res.data.totalRow || 0
  } catch (error) {
    ElMessage.error('加载执行记录失败')
  } finally {
    loading.value = false
  }
}

const handleDateRangeChange = (dates: [string, string] | null) => {
  if (dates) {
    filters.startTime = dates[0]
    filters.endTime = dates[1]
  } else {
    filters.startTime = undefined
    filters.endTime = undefined
  }
  pagination.pageNumber = 1
  loadExecutions()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNumber = 1
  loadExecutions()
}

const handlePageChange = (page: number) => {
  pagination.pageNumber = page
  loadExecutions()
}

const handleComplete = (execution: ReminderExecution) => {
  currentExecution.value = execution
  completeForm.completionNotes = ''
  completeDialogVisible.value = true
}

const confirmComplete = async () => {
  if (!currentExecution.value) return

  try {
    await completeReminderExecution(currentExecution.value.id, {
      completionNotes: completeForm.completionNotes || undefined,
    })
    ElMessage.success('标记完成成功')
    completeDialogVisible.value = false
    loadExecutions()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleMarkAsRead = async (id: string | number) => {
  try {
    await markExecutionAsRead(id)
    ElMessage.success('标记已读成功')
    loadExecutions()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getStatusType = (status: ReminderExecutionStatus) => {
  const map: Record<ReminderExecutionStatus, string> = {
    PENDING: 'warning',
    COMPLETED: 'success',
    OVERDUE: 'danger',
  }
  return map[status] || 'info'
}

const getStatusText = (status: ReminderExecutionStatus) => {
  const map: Record<ReminderExecutionStatus, string> = {
    PENDING: '待处理',
    COMPLETED: '已完成',
    OVERDUE: '已逾期',
  }
  return map[status] || status
}

const formatTime = (time: string | undefined) => {
  if (!time) return ''
  try {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return time
  }
}

onMounted(() => {
  loadPets()
  loadExecutions()
})
</script>

<style scoped lang="scss">
.reminder-executions-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
    }
  }

  .execution-list {
    margin-top: 20px;
  }

  .execution-item {
    margin-bottom: 16px;

    .execution-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .execution-info {
      flex: 1;

      .execution-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .execution-time {
          font-weight: 500;
          color: #333;
        }
      }

      .execution-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 8px;
        font-size: 14px;
        color: #666;
      }

      .execution-notes {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 8px;
        padding: 8px;
        background: #f5f7fa;
        border-radius: 4px;
        font-size: 14px;
        color: #666;
      }
    }

    .execution-actions {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

