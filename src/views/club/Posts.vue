<template>
  <div class="club-posts-page">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">内容广场</div>
          <div class="actions">
            <el-button type="primary" :icon="Plus" @click="goPublish">发布动态</el-button>
            <el-button :icon="Flag" @click="goActivities">活动打卡</el-button>
          </div>
        </div>
      </template>

      <div class="filters">
        <el-select v-model="query.postType" placeholder="类型" clearable style="width: 160px" @change="reload">
          <el-option label="好物分享" :value="1" />
          <el-option label="服务推荐" :value="2" />
          <el-option label="地点推荐" :value="3" />
          <el-option label="日常分享" :value="4" />
          <el-option label="活动打卡" :value="5" />
        </el-select>

        <el-select v-model="query.sort" placeholder="排序" clearable style="width: 160px" @change="reload">
          <el-option label="最新" value="latest" />
          <el-option label="最热" value="hot" />
          <el-option label="评分最高" value="rating" />
        </el-select>

        <el-input v-model="query.city" placeholder="城市" clearable style="width: 200px" @change="reload" />

        <el-select
          v-model="query.labelId"
          filterable
          remote
          clearable
          placeholder="标签"
          :remote-method="remoteSearchLabels"
          :loading="labelLoading"
          style="width: 240px"
          @change="reload"
        >
          <el-option v-for="t in labelOptions" :key="String(t.id)" :label="t.name" :value="t.id" />
        </el-select>
      </div>

      <div v-if="hotLabels.length" class="hot-tags">
        <span class="hot-tags-label">热门标签：</span>
        <el-tag
          v-for="t in hotLabels"
          :key="String(t.id)"
          class="tag"
          effect="plain"
          @click="selectHotLabel(t.id)"
        >
          {{ t.name }}
        </el-tag>
      </div>

      <div class="list">
        <el-empty v-if="!loading && posts.length === 0" description="暂无内容" />

        <el-card v-for="p in posts" :key="String(p.id)" class="post-item" shadow="hover" @click="goDetail(p.id)">
          <div class="post-title">{{ p.title || typeLabel(p.postType) }}</div>
          <div class="post-content">{{ p.content || '-' }}</div>
          <div class="post-meta">
            <div class="meta-left">
              <el-tag size="small" effect="plain">{{ typeLabel(p.postType) }}</el-tag>
              <span v-if="getCity(p)" class="meta-text">{{ getCity(p) }}</span>
              <span v-if="p.ratingAvg" class="meta-text">评分：{{ Number(p.ratingAvg).toFixed(1) }}</span>
              <span v-if="p.likeCount" class="meta-text">点赞：{{ p.likeCount }}</span>
            </div>
            <div class="meta-right">
              <span class="meta-text">{{ formatTime(p.createdAt) }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <div class="pager">
        <el-button :loading="loading" :disabled="noMore" @click="loadMore">
          {{ noMore ? '没有更多了' : '加载更多' }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Flag } from '@element-plus/icons-vue'
import { fetchPosts } from '@/services/postService'
import { fetchHotLabels, suggestLabels } from '@/services/labelService'
import type { Label, Post } from '@/types/club'

const router = useRouter()

const query = ref<{
  postType?: number
  labelId?: string | number
  city?: string
  sort?: 'latest' | 'hot' | 'rating'
  pageNumber: number
  pageSize: number
}>({
  pageNumber: 1,
  pageSize: 10,
})

const posts = ref<Post[]>([])
const loading = ref(false)
const noMore = ref(false)

const hotLabels = ref<Label[]>([])
const labelOptions = ref<Label[]>([])
const labelLoading = ref(false)

const typeLabel = (t: number) => {
  if (t === 1) return '好物分享'
  if (t === 2) return '服务推荐'
  if (t === 3) return '地点推荐'
  if (t === 4) return '日常分享'
  if (t === 5) return '活动打卡'
  return '动态'
}

const formatTime = (v?: string) => {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return d.toLocaleString('zh-CN')
}

const parseMaybeJson = (v: any) => {
  if (!v) return null
  if (typeof v === 'object') return v
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch (e) {
      return null
    }
  }
  return null
}

const getCity = (p: Post) => {
  const obj: any = parseMaybeJson((p as any).locationInfo)
  return obj?.city || ''
}

const load = async (append: boolean) => {
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await fetchPosts(query.value)
    const list = data?.records || []
    if (append) posts.value = posts.value.concat(list)
    else posts.value = list
    const totalPage = data?.totalPage
    if (typeof totalPage === 'number') {
      noMore.value = (data.pageNumber || query.value.pageNumber) >= totalPage
    } else {
      noMore.value = list.length < query.value.pageSize
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const reload = async () => {
  query.value.pageNumber = 1
  noMore.value = false
  await load(false)
}

const loadMore = async () => {
  if (noMore.value) return
  query.value.pageNumber += 1
  await load(true)
}

const goDetail = (id: string | number) => {
  router.push(`/club/posts/${id}`)
}

const goPublish = () => {
  router.push('/club/posts/publish')
}

const goActivities = () => {
  router.push('/club/activities')
}

const selectHotLabel = (id: string | number) => {
  query.value.labelId = id
  reload()
}

const remoteSearchLabels = async (keyword: string) => {
  const kw = (keyword || '').trim()
  if (!kw) return
  labelLoading.value = true
  try {
    const { data } = await suggestLabels({ keyword: kw })
    labelOptions.value = data || []
  } finally {
    labelLoading.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await fetchHotLabels()
    hotLabels.value = data || []
  } catch (e) {
    hotLabels.value = []
  }
  await reload()
})
</script>

<style scoped lang="scss">
.club-posts-page {
  padding: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.hot-tags {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.hot-tags-label {
  color: #909399;
  font-size: 13px;
}
.tag {
  cursor: pointer;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.post-item {
  cursor: pointer;
}
.post-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}
.post-content {
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}
.post-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.meta-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.meta-text {
  color: #909399;
  font-size: 12px;
}
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>


