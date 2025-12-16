<template>
  <div class="diaries-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>成长日记</h2>
          <el-button type="primary" @click="showAddDialog = true">写日记</el-button>
        </div>
      </template>
      <el-tabs v-model="activePet" @tab-change="loadDiaries">
        <el-tab-pane v-for="pet in pets" :key="pet.id" :label="pet.name" :name="pet.id" />
      </el-tabs>
      <div class="diary-list">
        <el-empty v-if="diaries.length === 0" description="暂无日记" />
        <el-card v-for="diary in diaries" :key="diary.id" class="diary-item">
          <div class="diary-header">
            <h3>{{ diary.title }}</h3>
            <span class="time">{{ formatTime(diary.createdAt) }}</span>
          </div>
          <div class="diary-content">
            <p>{{ diary.content }}</p>
            <div v-if="diary.images && diary.images.length > 0" class="diary-images">
              <el-image v-for="(img, idx) in diary.images" :key="idx" :src="img" class="diary-image" />
            </div>
          </div>
          <div class="diary-footer">
            <el-button type="text" @click="editDiary(diary)">编辑</el-button>
            <el-button type="text" @click="deleteDiary(diary.id)">删除</el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadDiaries"
      />
    </el-card>

    <el-dialog v-model="showAddDialog" :title="editing ? '编辑日记' : '写日记'" width="600px">
      <el-form :model="diaryForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="diaryForm.title" />
        </el-form-item>
        <el-form-item label="宠物">
          <el-select v-model="diaryForm.petId">
            <el-option v-for="pet in pets" :key="pet.id" :label="pet.name" :value="pet.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="diaryForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload action="#" list-type="picture-card" :auto-upload="false">
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDiary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { fetchDiaries, createDiary } from '@/services/petService'
import { fetchPets } from '@/services/petService'
import type { Diary, CreateDiaryPayload } from '@/types/pet'
import type { Pet } from '@/types/pet'

const activePet = ref('')
const diaries = ref<Diary[]>([])
const pets = ref<Pet[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const showAddDialog = ref(false)
const editing = ref(false)
const currentId = ref('')
const diaryForm = ref<CreateDiaryPayload>({
  petId: '',
  title: '',
  content: '',
  images: [],
})

const loadPets = async () => {
  try {
    const res = await fetchPets()
    pets.value = res.data || []
    if (pets.value.length > 0 && !activePet.value) {
      activePet.value = pets.value[0].id
    }
  } catch (error) {
    console.error('加载宠物列表失败:', error)
  }
}

const loadDiaries = async () => {
  if (!activePet.value) return
  try {
    const res = await fetchDiaries(activePet.value)
    diaries.value = res.data || []
  } catch (error) {
    console.error('加载日记失败:', error)
  }
}

const editDiary = (diary: Diary) => {
  editing.value = true
  currentId.value = diary.id
  diaryForm.value = {
    petId: diary.petId,
    title: diary.title,
    content: diary.content,
    images: diary.images || [],
  }
  showAddDialog.value = true
}

const saveDiary = async () => {
  try {
    await createDiary(diaryForm.value)
    showAddDialog.value = false
    editing.value = false
    diaryForm.value = {
      petId: activePet.value,
      title: '',
      content: '',
      images: [],
    }
    loadDiaries()
  } catch (error) {
    console.error('保存日记失败:', error)
  }
}

const deleteDiary = async (id: string) => {
  // TODO: 调用删除接口
  loadDiaries()
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPets()
  loadDiaries()
})
</script>

<style scoped lang="scss">
.diaries-page {
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

.diary-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-item {
  .diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h3 {
      margin: 0;
    }
    .time {
      color: #999;
      font-size: 12px;
    }
  }
  .diary-content {
    margin-bottom: 16px;
    p {
      margin: 0 0 16px;
      line-height: 1.8;
    }
    .diary-images {
      display: flex;
      gap: 8px;
      .diary-image {
        width: 120px;
        height: 120px;
      }
    }
  }
  .diary-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}
</style>
