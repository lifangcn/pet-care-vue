<template>
  <div class="reminders-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>提醒管理</h2>
          <div class="header-actions">
            <el-select v-model="selectedPetId" style="width: 220px" placeholder="选择宠物" @change="loadReminders">
              <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
            </el-select>
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
                <span>时间：{{ formatTime(reminder.schedule_time || reminder.record_time) }}</span>
                <span>提前：{{ reminder.remind_before_minutes || 0 }} 分钟</span>
                <span>重复：{{ getRepeatText(reminder.repeat_type) }}</span>
              </div>
            </div>
            <div class="reminder-actions">
              <div class="reminder-status">
                <el-tag v-if="reminder.is_completed" type="success" size="small">已完成</el-tag>
                <el-tag v-else type="warning" size="small">待办</el-tag>
              </div>
              <div class="action-buttons">
                <el-button
                  v-if="!reminder.is_completed"
                  type="success"
                  size="small"
                  text
                  @click="completeReminder(reminder.id)"
                >
                  完成
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
                  @click="deleteReminder(reminder.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
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
        <el-form-item label="计划时间">
          <el-date-picker v-model="reminderForm.scheduleTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="提前提醒">
          <el-input-number v-model="reminderForm.remindBeforeMinutes" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="重复">
          <el-select v-model="reminderForm.repeatType" style="width: 100%">
            <el-option label="不重复" value="none" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="() => { showAddDialog = false; editingReminderId = null; reminderForm.value = { title: '', description: '', scheduleTime: '', remindBeforeMinutes: 0, repeatType: 'none' } }">取消</el-button>
        <el-button type="primary" @click="saveReminder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createHealthRecord, updateHealthRecord, deleteHealthRecord, completeHealthRecord, fetchHealthRecords, fetchPets } from '@/services/petService'
import type { HealthRecord, Pet, RepeatType } from '@/types/pet'

const pets = ref<Pet[]>([])
const selectedPetId = ref<string | number>('')
const records = ref<HealthRecord[]>([])
const showAddDialog = ref(false)
const editingReminderId = ref<string | number | null>(null)

const reminderForm = ref<{ title: string; description?: string; scheduleTime: string; remindBeforeMinutes: number; repeatType: RepeatType }>({
  title: '',
  description: '',
  scheduleTime: '',
  remindBeforeMinutes: 0,
  repeatType: 'none',
})

const reminders = computed(() => records.value.filter((r) => r.record_type === 'reminder'))

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
    const res = await fetchHealthRecords(String(selectedPetId.value), { record_type: 'reminder' })
    records.value = Array.isArray(res.data?.list) ? res.data.list : (Array.isArray(res.data) ? res.data : [])
  } catch (error) {
    ElMessage.error('加载提醒失败')
  }
}

const saveReminder = async () => {
  if (!selectedPetId.value || !reminderForm.value.scheduleTime) {
    ElMessage.warning('请填写完整信息')
    return
  }
  try {
    if (editingReminderId.value) {
      await updateHealthRecord(editingReminderId.value, {
        pet_id: selectedPetId.value,
        record_type: 'reminder',
        title: reminderForm.value.title,
        description: reminderForm.value.description,
        record_time: reminderForm.value.scheduleTime,
        schedule_time: reminderForm.value.scheduleTime,
        remind_before_minutes: reminderForm.value.remindBeforeMinutes,
        repeat_type: reminderForm.value.repeatType,
      })
      ElMessage.success('更新成功')
    } else {
      await createHealthRecord({
        pet_id: selectedPetId.value,
        record_type: 'reminder',
        title: reminderForm.value.title,
        description: reminderForm.value.description,
        record_time: reminderForm.value.scheduleTime,
        schedule_time: reminderForm.value.scheduleTime,
        remind_before_minutes: reminderForm.value.remindBeforeMinutes,
        repeat_type: reminderForm.value.repeatType,
      })
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    editingReminderId.value = null
    reminderForm.value = { title: '', description: '', scheduleTime: '', remindBeforeMinutes: 0, repeatType: 'none' }
    await loadReminders()
  } catch (error) {
    ElMessage.error(editingReminderId.value ? '更新失败' : '添加失败')
  }
}

const editReminder = (reminder: HealthRecord) => {
  editingReminderId.value = reminder.id
  reminderForm.value = {
    title: reminder.title || '',
    description: reminder.description || '',
    scheduleTime: reminder.schedule_time || reminder.record_time,
    remindBeforeMinutes: reminder.remind_before_minutes || 0,
    repeatType: reminder.repeat_type || 'none',
  }
  showAddDialog.value = true
}

const completeReminder = async (id: string | number) => {
  try {
    await completeHealthRecord(id)
    ElMessage.success('标记完成成功')
    await loadReminders()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteReminder = async (id: string | number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条提醒吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteHealthRecord(id)
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
    none: '不重复',
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    custom: '自定义',
  }
  return map[String(repeatType)] || String(repeatType || 'none')
}

const formatTime = (time: string) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(async () => {
  await loadPets()
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

.reminder-status {
  display: flex;
  align-items: center;
}
</style>
