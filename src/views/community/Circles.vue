<template>
  <div class="circles-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>兴趣圈子</h2>
          <el-input v-model="keyword" placeholder="搜索圈子" style="width: 300px" @keyup.enter="loadCircles">
            <template #append>
              <el-button @click="loadCircles">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>
      <div class="circle-list">
        <el-empty v-if="circles.length === 0" description="暂无圈子" />
        <el-card v-for="circle in circles" :key="circle.id" class="circle-item">
          <div class="circle-content">
            <el-image :src="circle.cover" class="circle-cover" />
            <div class="circle-info">
              <h3>{{ circle.name }}</h3>
              <p>{{ circle.description }}</p>
              <div class="circle-stats">
                <span>成员：{{ circle.memberCount }}</span>
                <span>动态：{{ circle.postCount }}</span>
              </div>
            </div>
          </div>
          <div class="circle-actions">
            <el-button v-if="!circle.joined" type="primary" @click="joinCircle(circle.id)">加入圈子</el-button>
            <el-button v-else @click="leaveCircle(circle.id)">退出圈子</el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadCircles"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchCircles, joinCircle, leaveCircle } from '@/services/communityService'
import type { Circle } from '@/services/communityService'

const keyword = ref('')
const circles = ref<Circle[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const loadCircles = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    const res = await fetchCircles(params)
    circles.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载圈子列表失败:', error)
  }
}

const joinCircleHandler = async (id: string) => {
  try {
    await joinCircle(id)
    loadCircles()
  } catch (error) {
    console.error('加入圈子失败:', error)
  }
}

const leaveCircleHandler = async (id: string) => {
  try {
    await leaveCircle(id)
    loadCircles()
  } catch (error) {
    console.error('退出圈子失败:', error)
  }
}

onMounted(() => {
  loadCircles()
})
</script>

<style scoped lang="scss">
.circles-page {
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

.circle-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.circle-item {
  .circle-content {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  .circle-cover {
    width: 120px;
    height: 120px;
    border-radius: 8px;
  }
  .circle-info {
    flex: 1;
    h3 {
      margin: 0 0 8px;
    }
    p {
      margin: 0 0 16px;
      color: #666;
    }
    .circle-stats {
      display: flex;
      gap: 24px;
      color: #999;
      font-size: 14px;
    }
  }
  .circle-actions {
    text-align: right;
  }
}
</style>
