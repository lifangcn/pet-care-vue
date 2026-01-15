<template>
  <div class="reminders-page">
    <el-card class="checkin-stats-card">
      <div class="checkin-stats">
        <div class="stat-item">
          <div class="stat-value">{{ checkinStats?.monthCheckinCount ?? '-' }}</div>
          <div class="stat-label">本月打卡</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value highlight">{{ checkinStats?.continuousDays ?? '-' }}</div>
          <div class="stat-label">连续打卡</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-value">{{ lastCheckinText }}</div>
          <div class="stat-label">上次打卡</div>
        </div>
        <div class="checkin-action">
          <el-button type="primary" :icon="Calendar" @click="handleCheckin" :loading="checkinLoading">今日打卡</el-button>
          <el-button @click="showCheckinDialog = true" :disabled="!checkinStats">签到记录</el-button>
        </div>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <div class="header">
          <h2>提醒管理</h2>
          <div class="header-actions">
            <el-select v-model="selectedPetId" style="width: 220px" placeholder="选择宠物" @change="handlePetChange">
              <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
            </el-select>
            <el-button :disabled="!selectedPetId" @click="goToExecutions">查看执行记录</el-button>
            <el-button type="primary" :disabled="!selectedPetId" @click="showAddDialog = true">添加提醒</el-button>
          </div>
        </div>
      </template>
      <div class="reminder-list">
        <el-empty v-if="!selectedPetId" description="请选择宠物" />
        <el-empty v-else-if="reminders.length === 0" description="暂无提醒" />
        <el-card v-for="reminder in reminders" :key="String(reminder.id)" class="reminder-item">
          <div class="reminder-header">
            <div class="reminder-info">
              <h4>{{ reminder.title || '未命名提醒' }}</h4>
              <p v-if="reminder.description">{{ reminder.description }}</p>
              <div class="reminder-meta">
                <span>记录时间：{{ formatTime(reminder.recordTime) }}</span>
                <span v-if="reminder.scheduleTime">计划时间：{{ formatTime(reminder.scheduleTime) }}</span>
                <span>提前：{{ reminder.remindBeforeMinutes || 0 }} 分钟</span>
                <span>重复：{{ getRepeatText(reminder.repeatType) }}</span>
                <span v-if="reminder.totalOccurrences">进度：{{ reminder.completedCount || 0 }}/{{ reminder.totalOccurrences }}</span>
              </div>
            </div>
            <div class="reminder-actions">
              <div class="reminder-status">
                <el-tag v-if="!reminder.isActive" type="info" size="small">已停用</el-tag>
                <el-tag v-else-if="reminder.completedCount && reminder.totalOccurrences && reminder.completedCount >= reminder.totalOccurrences" type="success" size="small">已完成</el-tag>
                <el-tag v-else type="warning" size="small">进行中</el-tag>
              </div>
              <div class="action-buttons">
                <el-button
                  v-if="reminder.isActive"
                  type="warning"
                  size="small"
                  text
                  @click="deactivateReminderHandler(reminder.id)"
                >
                  停用
                </el-button>
                <el-button
                  v-else
                  type="success"
                  size="small"
                  text
                  @click="activateReminderHandler(reminder.id)"
                >
                  激活
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="editReminder(reminder)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="deleteReminderHandler(reminder.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div v-if="selectedPetId && pagination.totalRow > 0" class="pagination-wrapper">
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

    <el-dialog v-model="showAddDialog" :title="editingReminderId ? '编辑提醒' : '添加提醒'" width="520px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="reminderForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="reminderForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="reminderForm.recordTime"
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
        <el-form-item label="计划时间">
          <el-date-picker
            v-model="reminderForm.scheduleTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
            placeholder="选择计划时间"
            style="width: 100%"
            :shortcuts="dateTimeShortcuts"
            :default-time="new Date(2000, 1, 1, 9, 0, 0)"
            clearable
          />
        </el-form-item>
        <el-form-item label="提前提醒(分钟)">
          <el-input-number v-model="reminderForm.remindBeforeMinutes" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="重复">
          <el-select v-model="reminderForm.repeatType" style="width: 100%">
            <el-option label="不重复" value="NONE" />
            <el-option label="每天" value="DAILY" />
            <el-option label="每周" value="WEEKLY" />
            <el-option label="每月" value="MONTHLY" />
            <el-option label="自定义" value="CUSTOM" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelReminderEdit">取消</el-button>
        <el-button type="primary" @click="saveReminder">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCheckinDialog" title="签到记录" width="640px">
      <div class="checkin-dialog">
        <div class="checkin-dialog-header">
          <el-date-picker
            v-model="checkinMonth"
            type="month"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            style="width: 180px"
            @change="loadCheckinStats"
          />
        </div>
        <div class="checkin-dates" v-if="checkinStats?.checkinDates?.length">
          <el-tag v-for="d in checkinStats.checkinDates" :key="d" type="success" effect="light">{{ d }}</el-tag>
        </div>
        <el-empty v-else description="暂无签到记录" :image-size="80" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { fetchPets, fetchReminders, createReminder, updateReminder, deleteReminder, activateReminder, deactivateReminder } from '@/services/petService'
import { userCheckin, fetchCheckinStats, type CheckinStats } from '@/services/userService'
import type { Reminder, Pet, RepeatType } from '@/types/pet'

const router = useRouter()

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

const dateTimeShortcuts = [
  {
    text: '今天',
    value: () => {
      const now = new Date()
      return now
    }
  },
  {
    text: '明天',
    value: () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
  },
  {
    text: '一周后',
    value: () => {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    }
  },
  {
    text: '一个月后',
    value: () => {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      return nextMonth
    }
  }
]

const pets = ref<Pet[]>([])
const selectedPetId = ref<string | number>('')
const reminders = ref<Reminder[]>([])
const showAddDialog = ref(false)
const editingReminderId = ref<string | number | null>(null)
const checkinStats = ref<CheckinStats | null>(null)
const showCheckinDialog = ref(false)
const checkinMonth = ref('')
const checkinLoading = ref(false)

const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalRow: 0,
})

const lastCheckinText = computed(() => {
  if (!checkinStats.value?.lastCheckinDate) return '暂无'
  const date = new Date(checkinStats.value.lastCheckinDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff < 7) return `${diff}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
})

const reminderForm = ref<{ title: string; description?: string; recordTime: string; scheduleTime: string; remindBeforeMinutes: number; repeatType: RepeatType }>({
  title: '',
  description: '',
  recordTime: getCurrentDateTime(),
  scheduleTime: getCurrentDateTime(),
  remindBeforeMinutes: 0,
  repeatType: 'NONE',
})

const loadPets = async () => {
  const res = await fetchPets()
  pets.value = res.data || []
  if (!selectedPetId.value && pets.value.length > 0) {
    selectedPetId.value = pets.value[0].id
    await loadReminders()
  }
}

const loadReminders = async () => {
  if (!selectedPetId.value) return
  try {
    const res = await fetchReminders({
      petId: selectedPetId.value,
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    })
    reminders.value = Array.isArray(res.data?.records) ? res.data.records : []
    pagination.totalRow = res.data?.totalRow || 0
  } catch (error) {
    ElMessage.error('加载提醒失败')
  }
}

const loadCheckinStats = async () => {
  try {
    const now = new Date()
    if (!checkinMonth.value) {
      checkinMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }
    const [year, month] = checkinMonth.value.split('-').map((n) => Number(n))
    const res = await fetchCheckinStats({
      year,
      month,
    })
    checkinStats.value = res.data
  } catch (error) {
    console.error('加载打卡统计失败', error)
    checkinStats.value = null
  }
}

const handleCheckin = async () => {
  checkinLoading.value = true
  try {
    await userCheckin()
    ElMessage.success('打卡成功')
    await loadCheckinStats()
  } catch (error: any) {
    const message = error?.message || error?.response?.data?.message || '打卡失败'
    ElMessage.error(message)
  } finally {
    checkinLoading.value = false
  }
}

const handlePetChange = () => {
  loadReminders()
}

const cancelReminderEdit = () => {
  showAddDialog.value = false
  editingReminderId.value = null
  reminderForm.value = { title: '', description: '', recordTime: getCurrentDateTime(), scheduleTime: getCurrentDateTime(), remindBeforeMinutes: 0, repeatType: 'NONE' }
}

const saveReminder = async () => {
  if (!selectedPetId.value || !reminderForm.value.recordTime || !reminderForm.value.scheduleTime) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    if (editingReminderId.value) {
      await updateReminder(editingReminderId.value, {
        petId: Number(selectedPetId.value),
        sourceType: 'MANUAL',
        title: reminderForm.value.title,
        description: reminderForm.value.description,
        recordTime: reminderForm.value.recordTime,
        scheduleTime: reminderForm.value.scheduleTime,
        remindBeforeMinutes: reminderForm.value.remindBeforeMinutes,
        repeatType: reminderForm.value.repeatType,
      })
      ElMessage.success('更新成功')
    } else {
      await createReminder({
        petId: Number(selectedPetId.value),
        sourceType: 'MANUAL',
        title: reminderForm.value.title,
        description: reminderForm.value.description,
        recordTime: reminderForm.value.recordTime,
        scheduleTime: reminderForm.value.scheduleTime,
        remindBeforeMinutes: reminderForm.value.remindBeforeMinutes,
        repeatType: reminderForm.value.repeatType,
      })
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    editingReminderId.value = null
    reminderForm.value = { title: '', description: '', recordTime: getCurrentDateTime(), scheduleTime: getCurrentDateTime(), remindBeforeMinutes: 0, repeatType: 'NONE' }
    await loadReminders()
  } catch (error) {
    ElMessage.error(editingReminderId.value ? '更新失败' : '添加失败')
  }
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

const editReminder = (reminder: Reminder) => {
  editingReminderId.value = reminder.id
  reminderForm.value = {
    title: reminder.title || '',
    description: reminder.description || '',
    recordTime: formatDateTime(reminder.recordTime),
    scheduleTime: formatDateTime(reminder.scheduleTime || reminder.recordTime),
    remindBeforeMinutes: reminder.remindBeforeMinutes || 0,
    repeatType: reminder.repeatType || 'NONE',
  }
  showAddDialog.value = true
}

const activateReminderHandler = async (id: string | number) => {
  try {
    await activateReminder(id)
    ElMessage.success('激活成功')
    await loadReminders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deactivateReminderHandler = async (id: string | number) => {
  try {
    await deactivateReminder(id)
    ElMessage.success('停用成功')
    await loadReminders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteReminderHandler = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条提醒吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteReminder(id)
    ElMessage.success('删除成功')
    await loadReminders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getRepeatText = (repeatType: any) => {
  const map: Record<string, string> = {
    NONE: '不重复',
    DAILY: '每天',
    WEEKLY: '每周',
    MONTHLY: '每月',
    CUSTOM: '自定义',
  }
  return map[String(repeatType)] || String(repeatType || 'NONE')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNumber = 1
  loadReminders()
}

const handlePageChange = (page: number) => {
  pagination.pageNumber = page
  loadReminders()
}

const goToExecutions = () => {
  router.push('/reminder/executions')
}

onMounted(async () => {
  try {
    await loadPets()
  } finally {
    await loadCheckinStats()
  }
})
</script>

<style scoped lang="scss">
.reminders-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.reminder-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.reminder-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.reminder-info {
  flex: 1;
  h4 {
    margin: 0 0 8px;
  }
  p {
    margin: 0 0 8px;
    color: #666;
  }
  .reminder-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #999;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reminder-status {
  display: flex;
  align-items: center;
}

.checkin-stats-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.checkin-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  color: #fff;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;

  &.highlight {
    color: #ffd700;
  }
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
}

.checkin-action {
  margin-left: 24px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.checkin-dialog {
  .checkin-dialog-header {
    margin-bottom: 16px;
  }

  .checkin-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style>
