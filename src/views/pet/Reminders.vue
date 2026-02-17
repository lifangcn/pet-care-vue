<template>
  <div class="reminders-page paw-print top-left">
    <!-- 简洁的打卡栏 -->
    <div class="checkin-bar">
      <div class="checkin-stats">
        <div class="mini-stat">
          <span class="mini-stat-value">{{ checkInStats?.continuousDays ?? 0 }}</span>
          <span class="mini-stat-label">连续天数</span>
        </div>
        <div class="mini-stat">
          <span class="mini-stat-value">{{ checkInStats?.monthCheckInCount ?? 0 }}</span>
          <span class="mini-stat-label">本月打卡</span>
        </div>
      </div>
      <div class="checkin-buttons">
        <button class="checkin-btn glass" :disabled="checkInLoading" @click="handleCheckIn">
          <el-icon v-if="!checkInLoading"><Calendar /></el-icon>
          <el-icon v-else class="is-loading"><Loading /></el-icon>
          今日打卡
        </button>
        <button class="checkin-btn text" @click="showCheckInDialog = true">记录</button>
      </div>
    </div>

    <!-- 提醒管理区域 -->
    <div class="reminders-content">
      <div class="content-header">
        <h2>提醒管理</h2>
        <div class="header-actions">
          <el-select v-model="selectedPetId" style="width: 160px" placeholder="选毛孩子" @change="handlePetChange" size="default">
            <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
          </el-select>
          <el-button :disabled="!selectedPetId" @click="goToExecutions">执行记录</el-button>
          <el-button type="primary" :disabled="!selectedPetId" :icon="Plus" @click="showAddDialog = true">新建</el-button>
        </div>
      </div>

      <div v-if="!selectedPetId" class="empty-state">
        <div class="empty-icon">🐾</div>
        <p>选个毛孩子开始管理提醒吧</p>
      </div>

      <div v-else-if="reminders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>还没有提醒哦，点击"新建"添加一个吧</p>
      </div>

      <div v-else class="reminder-grid">
        <div v-for="reminder in reminders" :key="String(reminder.id)" class="reminder-card" :class="{ inactive: !reminder.isActive }">
          <div class="reminder-card-header">
            <div class="reminder-title-row">
              <h3 class="reminder-title">{{ reminder.title || '未命名提醒' }}</h3>
              <div class="reminder-status-badge" :class="getStatusClass(reminder)">
                {{ getStatusText(reminder) }}
              </div>
            </div>
            <p v-if="reminder.description" class="reminder-desc">{{ reminder.description }}</p>
          </div>

          <div class="reminder-time-info">
            <div class="time-item">
              <span class="time-icon">⏰</span>
              <span class="time-label">{{ formatTimeShort(reminder.recordTime) }}</span>
            </div>
            <div v-if="reminder.scheduleTime" class="time-item">
              <span class="time-icon">📅</span>
              <span class="time-label">{{ formatTimeShort(reminder.scheduleTime) }}</span>
            </div>
          </div>

          <div class="reminder-meta-tags">
            <span class="meta-tag">
              <span class="tag-icon">🔔</span>
              提前{{ reminder.remindBeforeMinutes || 0 }}分钟
            </span>
            <span class="meta-tag">
              <span class="tag-icon">🔁</span>
              {{ getRepeatText(reminder.repeatType) }}
            </span>
            <span v-if="reminder.totalOccurrences" class="meta-tag progress">
              <span class="tag-icon">📊</span>
              {{ reminder.completedCount || 0 }}/{{ reminder.totalOccurrences }}
            </span>
          </div>

          <div class="reminder-card-actions">
            <el-button
              v-if="reminder.isActive"
              type="warning"
              size="small"
              plain
              @click="deactivateReminderHandler(reminder.id)"
            >
              暂停
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              plain
              @click="activateReminderHandler(reminder.id)"
            >
              启用
            </el-button>
            <el-button size="small" @click="editReminder(reminder)">编辑</el-button>
            <el-button type="danger" size="small" plain @click="deleteReminderHandler(reminder.id)">删除</el-button>
          </div>
        </div>
      </div>

      <div v-if="selectedPetId && pagination.totalRow > 0" class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNumber"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.totalRow"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          small
        />
      </div>
    </div>

    <el-dialog v-model="showAddDialog" :title="editingReminderId ? '编辑提醒' : '新建提醒'" width="520px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="reminderForm.title" placeholder="比如：遛狗、喂食..." />
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="reminderForm.description" type="textarea" placeholder="写点备注吧" />
        </el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="reminderForm.recordTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm"
            placeholder="选个时间"
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
            placeholder="选个时间"
            style="width: 100%"
            :shortcuts="dateTimeShortcuts"
            :default-time="new Date(2000, 1, 1, 9, 0, 0)"
            clearable
          />
        </el-form-item>
        <el-form-item label="提前提醒">
          <el-input-number v-model="reminderForm.remindBeforeMinutes" :min="0" style="width: 100%" />
          <span style="margin-left: 8px; color: #999;">分钟</span>
        </el-form-item>
        <el-form-item label="重复">
          <el-select v-model="reminderForm.repeatType" placeholder="怎么重复" style="width: 100%">
            <el-option label="一次就好" value="NONE" />
            <el-option label="每天" value="DAILY" />
            <el-option label="每周" value="WEEKLY" />
            <el-option label="每月" value="MONTHLY" />
            <el-option label="自定义" value="CUSTOM" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelReminderEdit">取消</el-button>
        <el-button type="primary" @click="saveReminder">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showCheckInDialog" title="签到记录" width="640px">
      <div class="checkin-dialog">
        <div class="checkin-dialog-header">
          <el-date-picker
            v-model="checkInMonth"
            type="month"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            style="width: 180px"
            @change="loadCheckInStats"
          />
        </div>
        <div class="checkin-dates" v-if="checkInStats?.checkInDates?.length">
          <el-tag v-for="d in checkInStats.checkInDates" :key="d" type="success" effect="light">{{ d }}</el-tag>
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
import { Calendar, Plus, Loading } from '@element-plus/icons-vue'
import { fetchPets, fetchReminders, createReminder, updateReminder, deleteReminder, activateReminder, deactivateReminder } from '@/services/petService'
import { userCheckIn, fetchCheckInStats, type CheckInStats } from '@/services/userService'
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
const checkInStats = ref<CheckInStats | null>(null)
const showCheckInDialog = ref(false)
const checkInMonth = ref('')
const checkInLoading = ref(false)

const pagination = reactive({
  pageNumber: 1,
  pageSize: 10,
  totalRow: 0,
})

const lastCheckInText = computed(() => {
  if (!checkInStats.value?.lastCheckInDate) return '暂无'
  const date = new Date(checkInStats.value.lastCheckInDate)
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

const loadCheckInStats = async () => {
  try {
    const now = new Date()
    if (!checkInMonth.value) {
      checkInMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }
    const [year, month] = checkInMonth.value.split('-').map((n) => Number(n))
    const res = await fetchCheckInStats({
      year,
      month,
    })
    checkInStats.value = res.data
  } catch (error) {
    console.error('加载打卡统计失败', error)
    checkInStats.value = null
  }
}

const handleCheckIn = async () => {
  checkInLoading.value = true
  try {
    await userCheckIn()
    ElMessage.success('打卡成功')
    await loadCheckInStats()
  } catch (error: any) {
    const message = error?.message || error?.response?.data?.message || '打卡失败'
    ElMessage.error(message)
  } finally {
    checkInLoading.value = false
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

const formatTimeShort = (time: string) => {
  if (!time) return ''
  const date = new Date(time)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

const getStatusClass = (reminder: Reminder) => {
  if (!reminder.isActive) return 'inactive'
  if (reminder.completedCount && reminder.totalOccurrences && reminder.completedCount >= reminder.totalOccurrences) return 'completed'
  return 'active'
}

const getStatusText = (reminder: Reminder) => {
  if (!reminder.isActive) return '已暂停'
  if (reminder.completedCount && reminder.totalOccurrences && reminder.completedCount >= reminder.totalOccurrences) return '已完成'
  return '进行中'
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
    await loadCheckInStats()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.reminders-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

// 简洁打卡栏
.checkin-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FF8A4C 0%, #FFB380 100%);
  border-radius: pet.$pet-radius-md;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(255, 138, 76, 0.25);
}

.checkin-stats {
  display: flex;
  gap: 24px;
}

.mini-stat {
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: #fff;
}

.mini-stat-value {
  font-size: 28px;
  font-weight: 700;
  font-family: vars.$font-family-cute;
}

.mini-stat-label {
  font-size: 13px;
  opacity: 0.95;
}

.checkin-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

// 打卡栏玻璃态按钮
.checkin-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  @include anim.anim-standard;

  &.glass {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.28);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 20px;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.42);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &.text {
    padding: 8px 12px;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    border-radius: 8px;

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.12);
    }
  }
}

// 提醒内容区域
.reminders-content {
  background: #fff;
  border-radius: pet.$pet-radius-md;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(212, 163, 115, 0.12);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 22px;
    font-family: vars.$font-family-cute;
    color: vars.$pet-charcoal;
  }
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
  color: #7F8C8D;
}

// 提醒卡片网格
.reminder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.reminder-card {
  background: #FFFEFA;
  border: 2px solid #E8E8E8;
  border-radius: pet.$pet-radius-md;
  padding: 16px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 20px rgba(255, 138, 76, 0.15);
    border-color: #FFD4A8;
  }

  &.inactive {
    opacity: 0.6;
    background: #F5F5F5;
  }
}

.reminder-card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reminder-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.reminder-title {
  margin: 0;
  font-size: 18px;
  font-family: vars.$font-family-cute;
  color: #2C3E50;
  line-height: 1.3;
  flex: 1;
}

.reminder-status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &.active {
    background: linear-gradient(135deg, #B8E6D4 0%, #81B29A 100%);
    color: #2C3E50;
  }

  &.completed {
    background: linear-gradient(135deg, #FFB3BA 0%, #FF8A80 100%);
    color: #2C3E50;
  }

  &.inactive {
    background: #E0E0E0;
    color: #7F8C8D;
  }
}

.reminder-desc {
  margin: 0;
  font-size: 14px;
  color: #7F8C8D;
  line-height: 1.5;
  font-family: vars.$font-family-body;
}

.reminder-time-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #5D6D7E;
}

.time-icon {
  font-size: 14px;
}

.time-label {
  font-family: vars.$font-family-number;
  font-weight: 500;
}

.reminder-meta-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #FFF3E0;
  border-radius: pet.$pet-radius-sm;
  font-size: 12px;
  color: #5D4037;
  font-family: vars.$font-family-body;

  &.progress {
    background: linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%);
    color: #01579B;
  }
}

.tag-icon {
  font-size: 12px;
}

.reminder-card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px dashed #E0E0E0;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
}

// 签到对话框样式保持不变
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

// 移动端适配
@media (max-width: 768px) {
  .reminders-page {
    padding: 16px;
  }

  .checkin-bar {
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px;
  }

  .checkin-stats {
    width: 100%;
    justify-content: space-around;
  }

  .checkin-buttons {
    width: 100%;
    justify-content: center;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;

    :deep(.el-select) {
      flex: 1;
      min-width: 120px;
    }
  }

  .reminder-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .reminder-card {
    padding: 14px;
  }

  .reminder-title {
    font-size: 16px;
  }

  .reminder-card-actions {
    justify-content: stretch;

    .el-button {
      flex: 1;
      min-width: 0;
    }
  }
}

@media (max-width: 480px) {
  .mini-stat-value {
    font-size: 24px;
  }

  .mini-stat-label {
    font-size: 12px;
  }

  .checkin-buttons {
    flex-direction: column;
    width: 100%;

    .el-button {
      width: 100%;
    }
  }
}
</style>
