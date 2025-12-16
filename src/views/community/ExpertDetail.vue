<template>
  <div class="expert-detail-page">
    <el-card>
      <div class="expert-header">
        <el-avatar :src="expert.avatar" :size="120" />
        <div class="expert-info">
          <h2>{{ expert.name }}</h2>
          <p class="title">{{ expert.title }}</p>
          <div class="tags">
            <el-tag v-for="tag in expert.specialties" :key="tag" size="small">{{ tag }}</el-tag>
          </div>
          <div class="stats">
            <span>评分：{{ expert.rating }}</span>
            <span>咨询数：{{ expert.consultationCount }}</span>
          </div>
        </div>
        <div class="expert-actions">
          <span class="price">¥{{ expert.price }}/次</span>
          <el-button type="primary" size="large" :disabled="!expert.available" @click="startConsultation">
            {{ expert.available ? '立即咨询' : '暂不可用' }}
          </el-button>
        </div>
      </div>
      <div class="expert-content">
        <h3>个人简介</h3>
        <p>{{ expert.description }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchExpertById, createConsultation } from '@/services/serviceService'
import type { Expert } from '@/services/serviceService'

const route = useRoute()
const router = useRouter()
const expert = ref<Expert>({
  id: '',
  name: '',
  avatar: '',
  title: '',
  specialties: [],
  description: '',
  rating: 0,
  consultationCount: 0,
  price: 0,
  available: false,
})

const loadExpert = async () => {
  try {
    const id = route.params.id as string
    const res = await fetchExpertById(id)
    expert.value = res.data
  } catch (error) {
    console.error('加载专家详情失败:', error)
  }
}

const startConsultation = async () => {
  try {
    // TODO: 选择宠物
    const res = await createConsultation({
      expertId: expert.value.id,
      petId: '1',
      type: 'text',
    })
    router.push(`/consultations/${res.data.id}`)
  } catch (error) {
    console.error('创建咨询失败:', error)
  }
}

onMounted(() => {
  loadExpert()
})
</script>

<style scoped lang="scss">
.expert-detail-page {
  padding: 24px;
}

.expert-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}

.expert-info {
  flex: 1;
  h2 {
    margin: 0 0 8px;
  }
  .title {
    margin: 0 0 16px;
    color: #666;
    font-size: 16px;
  }
  .tags {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
  .stats {
    display: flex;
    gap: 24px;
    color: #666;
  }
}

.expert-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  .price {
    font-size: 24px;
    font-weight: bold;
    color: #f56c6c;
  }
}

.expert-content {
  h3 {
    margin: 0 0 16px;
  }
  p {
    margin: 0;
    line-height: 1.8;
    color: #666;
  }
}
</style>
