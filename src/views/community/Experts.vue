<template>
  <div class="experts-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>专家与达人</h2>
          <el-input v-model="keyword" placeholder="搜索专家" style="width: 300px" @keyup.enter="loadExperts">
            <template #append>
              <el-button @click="loadExperts">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>
      <el-tabs v-model="activeCategory" @tab-change="loadExperts">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="兽医" name="veterinarian" />
        <el-tab-pane label="美容师" name="groomer" />
        <el-tab-pane label="训导师" name="trainer" />
        <el-tab-pane label="营养师" name="nutritionist" />
      </el-tabs>
      <div class="expert-list">
        <el-empty v-if="experts.length === 0" description="暂无专家" />
        <el-card v-for="expert in experts" :key="expert.id" class="expert-item" @click="$router.push(`/experts/${expert.id}`)">
          <div class="expert-header">
            <el-avatar :src="expert.avatar" :size="64" />
            <div class="expert-info">
              <h3>{{ expert.name }}</h3>
              <p class="title">{{ expert.title }}</p>
              <div class="tags">
                <el-tag v-for="tag in expert.specialties" :key="tag" size="small">{{ tag }}</el-tag>
              </div>
            </div>
            <div class="expert-stats">
              <div class="stat-item">
                <span class="value">{{ expert.rating }}</span>
                <span class="label">评分</span>
              </div>
              <div class="stat-item">
                <span class="value">{{ expert.consultationCount }}</span>
                <span class="label">咨询数</span>
              </div>
            </div>
          </div>
          <p class="description">{{ expert.description }}</p>
          <div class="expert-footer">
            <span class="price">¥{{ expert.price }}/次</span>
            <el-button type="primary" :disabled="!expert.available" @click.stop="startConsultation(expert.id)">
              {{ expert.available ? '立即咨询' : '暂不可用' }}
            </el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadExperts"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchExperts, createConsultation } from '@/services/serviceService'
import type { Expert } from '@/services/serviceService'

const router = useRouter()
const keyword = ref('')
const activeCategory = ref('all')
const experts = ref<Expert[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadExperts = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeCategory.value !== 'all') {
      params.category = activeCategory.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    const res = await fetchExperts(params)
    experts.value = res.data.records || []
    pagination.value.total = res.data.totalRow || 0
  } catch (error) {
    console.error('加载专家列表失败:', error)
  }
}

const startConsultation = async (expertId: string) => {
  try {
    // TODO: 选择宠物
    const res = await createConsultation({
      expertId,
      petId: '1',
      type: 'text',
    })
    router.push(`/consultations/${res.data.id}`)
  } catch (error) {
    console.error('创建咨询失败:', error)
  }
}

onMounted(() => {
  loadExperts()
})
</script>

<style scoped lang="scss">
.experts-page {
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

.expert-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.expert-item {
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.expert-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.expert-info {
  flex: 1;
  h3 {
    margin: 0 0 8px;
  }
  .title {
    margin: 0 0 8px;
    color: #666;
  }
  .tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
}

.expert-stats {
  display: flex;
  gap: 24px;
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    .value {
      font-size: 20px;
      font-weight: bold;
      color: #409eff;
    }
    .label {
      font-size: 12px;
      color: #666;
    }
  }
}

.description {
  margin: 0 0 16px;
  color: #666;
}

.expert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .price {
    font-size: 18px;
    font-weight: bold;
    color: #f56c6c;
  }
}
</style>
