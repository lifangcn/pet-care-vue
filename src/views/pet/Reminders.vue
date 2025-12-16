<template>
  <div class="reminders-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>提醒管理</h2>
          <el-button type="primary" @click="showAddDialog = true">添加提醒</el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab" @tab-change="loadReminders">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="喂食" name="feeding" />
        <el-tab-pane label="疫苗" name="vaccine" />
        <el-tab-pane label="用药" name="medication" />
      </el-tabs>
      <div class="reminder-list">
        <el-empty v-if="reminders.length === 0" description="暂无提醒" />
        <el-card v-for="reminder in reminders" :key="reminder.id" class="reminder-item" :class="{ disabled: !reminder.enabled }">
          <div class="reminder-header">
            <div class="reminder-info">
              <h4>{{ reminder.title }}</h4>
              <p v-if="reminder.description">{{ reminder.description }}</p>
              <div class="reminder-meta">
                <span>宠物：{{ getPetName(reminder.petId) }}</span>
                <span>时间：{{ formatTime(reminder.scheduledTime) }}</span>
                <span>重复：{{ getRepeatText(reminder.repeatType) }}</span>
              </div>
            </div>
            <div class="reminder-status">
              <el-switch v-model="reminder.enabled" @change="toggleReminder(reminder.id, reminder.enabled)" />
              <el-tag v-if="reminder.completed" type="success" size="small">已完成</el-tag>
            </div>
          </div>
          <div class="reminder-actions">
            <el-button v-if="!reminder.completed" type="primary" size="small" @click="completeReminder(reminder.id)">标记完成</el-button>
            <el-button type="text" @click="editReminder(reminder)">编辑</el-button>
            <el-button type="text" @click="deleteReminder(reminder.id)">删除</el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadReminders"
      />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="editing ? '编辑提醒' : '添加提醒'" width="500px">
      <el-form :model="reminderForm" label-width="100px">
        <el-form-item label="提醒类型">
          <el-select v-model="reminderForm.type">
            <el-option label="喂食" value="feeding" />
            <el-option label="疫苗" value="vaccine" />
            <el-option label="用药" value="medication" />
            <el-option label="美容" value="grooming" />
            <el-option label="运动" value="exercise" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="reminderForm.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="reminderForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="宠物">
          <el-select v-model="reminderForm.petId">
            <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒时间">
          <el-date-picker v-model="reminderForm.scheduledTime" type="datetime" />
        </el-form-item>
        <el-form-item label="重复">
          <el-select v-model="reminderForm.repeatType">
            <el-option label="不重复" value="none" />
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveReminder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchReminders, createReminder, updateReminder, deleteReminder, completeReminder, fetchPets } from '@/services/petService'
import type { Reminder } from '@/services/petService'
import type { Pet } from '@/types/pet'

const activeTab = ref('all')
const reminders = ref<Reminder[]>([])
const pets = ref<Pet[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const showAddDialog = ref(false)
const editing = ref(false)
const currentId = ref('')
const reminderForm = ref<{ petId: string; type: string; title: string; description?: string; scheduledTime: string; repeatType: string }>({
  petId: '',
  type: 'feeding',
  title: '',
  description: '',
  scheduledTime: '',
  repeatType: 'none',
})

const loadReminders = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeTab.value !== 'all') {
      params.type = activeTab.value
    }
    const res = await fetchReminders(params)
    reminders.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载提醒失败:', error)
  }
}

const loadPets = async () => {
  try {
    const res = await fetchPets()
    pets.value = res.data || []
  } catch (error) {
    console.error('加载宠物列表失败:', error)
  }
}

const getPetName = (petId: string) => {
  const pet = pets.value.find(p => p.id === petId)
  return pet?.name || petId
}

const getRepeatText = (repeatType: string) => {
  const map: Record<string, string> = {
    none: '不重复',
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
  }
  return map[repeatType] || repeatType
}

const toggleReminder = async (id: string, enabled: boolean) => {
  try {
    await updateReminder(id, { enabled })
    loadReminders()
  } catch (error) {
    console.error('切换提醒状态失败:', error)
  }
}

const completeReminderHandler = async (id: string) => {
  try {
    await completeReminder(id)
    loadReminders()
  } catch (error) {
    console.error('标记完成失败:', error)
  }
}

const editReminder = (reminder: Reminder) => {
  editing.value = true
  currentId.value = reminder.id
  reminderForm.value = {
    petId: reminder.petId,
    type: reminder.type,
    title: reminder.title,
    description: reminder.description || '',
    scheduledTime: reminder.scheduledTime,
    repeatType: reminder.repeatType,
  }
  showAddDialog.value = true
}

const saveReminder = async () => {
  try {
    if (editing.value) {
      await updateReminder(currentId.value, reminderForm.value)
    } else {
      await createReminder(reminderForm.value)
    }
    showAddDialog.value = false
    editing.value = false
    reminderForm.value = {
      petId: '',
      type: 'feeding',
      title: '',
      description: '',
      scheduledTime: '',
      repeatType: 'none',
    }
    loadReminders()
  } catch (error) {
    console.error('保存提醒失败:', error)
  }
}

const deleteReminderHandler = async (id: string) => {
  try {
    await deleteReminder(id)
    loadReminders()
  } catch (error) {
    console.error('删除提醒失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadReminders()
  loadPets()
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

.reminder-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reminder-item {
  &.disabled {
    opacity: 0.6;
  }
}

.reminder-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
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
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.reminder-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
