<template>
  <div class="club-detail-page">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">动态详情</div>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated />

      <template v-else>
        <div class="post-title">{{ post?.title || '-' }}</div>
        <div class="post-meta">
          <el-tag size="small" effect="plain">{{ typeLabel(post?.postType) }}</el-tag>
          <span v-if="locationAddress" class="meta-text">{{ locationAddress }}</span>
          <span class="meta-text">{{ formatTime(post?.createdAt) }}</span>
        </div>

        <div v-if="mediaList.length" class="media">
          <el-carousel height="260px" indicator-position="outside">
            <el-carousel-item v-for="(m, idx) in mediaList" :key="idx">
              <img v-if="!isVideo(m)" :src="m" class="media-img" />
              <video v-else class="media-video" controls :src="m" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="content">
          {{ post?.content || '-' }}
        </div>

        <div class="actions">
          <el-button :loading="likeLoading" @click="handleLike">
            点赞 {{ post?.likeCount || 0 }}
          </el-button>
          <div class="rating">
            <span class="rating-label">评分</span>
            <el-rate v-model="myRating" :max="5" :allow-half="false" @change="handleRate" />
            <span class="rating-text">
              {{ Number(post?.ratingAvg || 0).toFixed(1) }}（{{ post?.ratingCount || 0 }}）
            </span>
          </div>
        </div>

        <div v-if="labels.length" class="tags">
          <el-tag v-for="t in labels" :key="String(t.id)" effect="plain">{{ t.name }}</el-tag>
        </div>

        <div v-if="post?.externalLink" class="ext">
          <el-link :href="post.externalLink" target="_blank" type="primary">{{ post.externalLink }}</el-link>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchPostById, likePost, ratePost } from '@/services/postService'
import type { Label, Post } from '@/types/club'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const likeLoading = ref(false)
const post = ref<Post | null>(null)
const myRating = ref<number>(0)

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

const mediaList = computed<string[]>(() => {
  const raw: any = (post.value as any)?.mediaUrls
  const obj = parseMaybeJson(raw)
  if (Array.isArray(obj)) return obj
  return []
})

const labels = computed<Label[]>(() => {
  const raw: any = (post.value as any)?.labels
  if (Array.isArray(raw)) return raw
  return []
})

const locationAddress = computed(() => {
  return (post.value as any)?.locationAddress || ''
})

const typeLabel = (t?: number) => {
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

const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg)$/i.test(url)
}

const load = async () => {
  const id = route.params.id as string
  if (!id) return
  loading.value = true
  try {
    const { data } = await fetchPostById(id)
    post.value = data
    myRating.value = Number((data as any)?.userRatingValue ?? 0) || 0
    
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleLike = async () => {
  const id = route.params.id as string
  if (!id) return
  likeLoading.value = true
  try {
    await likePost(id)
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '点赞失败')
  } finally {
    likeLoading.value = false
  }
}

const handleRate = async (val: number) => {
  const id = route.params.id as string
  if (!id) return
  const ratingValue = Math.max(1, Math.min(5, Math.round(val))) as 1 | 2 | 3 | 4 | 5
  try {
    await ratePost(id, { ratingValue })
    ElMessage.success('评分成功')
    await load()
  } catch (e: any) {
    ElMessage.error(e?.message || '评分失败')
  }
}

const goBack = () => {
  router.back()
}

onMounted(load)
</script>

<style scoped lang="scss">
.club-detail-page {
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
.post-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.post-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.meta-text {
  color: #909399;
  font-size: 12px;
}
.media {
  margin: 12px 0 18px;
}
.media-img,
.media-video {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
}
.content {
  color: #303133;
  white-space: pre-wrap;
  line-height: 1.8;
}
.actions {
  margin-top: 16px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}
.rating {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rating-label {
  color: #606266;
}
.rating-text {
  color: #909399;
  font-size: 12px;
}
.tags {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ext {
  margin-top: 14px;
}
</style>


