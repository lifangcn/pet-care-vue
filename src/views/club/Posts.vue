<template>
  <div class="posts-page">
    <!-- 顶部操作栏 -->
    <div class="posts-header">
      <h1>社区</h1>
      <div class="header-actions">
        <el-button type="primary" @click="router.push('/club/activities')">活动</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push('/club/posts/publish')">发布</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <span
          v-for="tab in sortTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: query.sort === tab.value }"
          @click="setSort(tab.value)"
        >
          {{ tab.label }}
        </span>
      </div>

      <el-select v-model="query.postType" placeholder="类型" clearable class="filter-select" @change="reload">
        <el-option label="全部" :value="undefined" />
        <el-option label="好物" value="PRODUCT" />
        <el-option label="服务" value="SERVICE" />
        <el-option label="地点" value="LOCATION" />
        <el-option label="日常" value="DAILY" />
        <el-option label="打卡" value="ACTIVITY_CHECK" />
      </el-select>
    </div>

    <!-- 瀑布流卡片 -->
    <div class="posts-grid" v-loading="loading">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
        @click="router.push(`/club/posts/${post.id}`)"
      >
        <!-- 图片区域 -->
        <div class="post-image" v-if="getPostImage(post)">
          <img :src="getPostImage(post)" :alt="post.title" />
        </div>

        <!-- 内容区域 -->
        <div class="post-content">
          <h3 class="post-title">{{ post.title || '分享' }}</h3>
          <p class="post-excerpt">{{ post.content }}</p>
        </div>

        <!-- 底部信息 -->
        <div class="post-footer">
          <div class="post-tags" v-if="post.labels && post.labels.length > 0">
            <span v-for="label in post.labels.slice(0, 2)" :key="label.id" class="mini-tag">
              {{ label.name }}
            </span>
          </div>
          <div class="post-stats">
            <span v-if="post.likeCount" class="stat-item">👍 {{ post.likeCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="!loading && posts.length > 0">
      <el-button v-if="!noMore" @click="loadMore">加载更多</el-button>
      <span v-else class="no-more">没有更多了</span>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && posts.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>暂无动态</h3>
      <p>来发布第一条动态吧</p>
      <el-button type="primary" @click="router.push('/club/posts/publish')">发布动态</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchPosts } from '@/services/postService'
import type { Post, PostType } from '@/types/club'

const router = useRouter()

const sortTabs = [
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'hot' },
  { label: '评分', value: 'rating' },
]

const query = ref<{
  postType?: PostType
  sort?: 'latest' | 'hot' | 'rating'
  pageNumber: number
  pageSize: number
}>({
  sort: 'latest',
  pageNumber: 1,
  pageSize: 20,
})

const posts = ref<Post[]>([])
const loading = ref(false)
const noMore = ref(false)

const getPostImage = (post: Post): string | null => {
  if (!post.mediaUrls) return null
  return post.mediaUrls[0] || null
}

const setSort = (value: 'latest' | 'hot' | 'rating') => {
  query.value.sort = value
  reload()
}

const load = async (append: boolean) => {
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await fetchPosts(query.value)
    const list = data?.records || []
    if (append) {
      posts.value = [...posts.value, ...list]
    } else {
      posts.value = list
    }
    const totalPage = data?.totalPage
    if (typeof totalPage === 'number') {
      noMore.value = (data.pageNumber || query.value.pageNumber) >= totalPage
    } else {
      noMore.value = list.length < query.value.pageSize
    }
  } catch (e: any) {
    ElMessage.error('加载失败')
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

onMounted(async () => {
  await reload()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;
@use '@/styles/pet-theme.scss' as pet;
@use '@/styles/animations.scss' as anim;

.posts-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 24px;
}

// 顶部操作栏
.posts-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: vars.$pet-charcoal;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: pet.$pet-warm-gray;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: vars.$pet-charcoal;
    background: #F5F0E8;
  }

  &.active {
    color: #fff;
    background: pet.$pet-primary;
  }
}

:deep(.filter-select) {
  width: 140px;
}

// 瀑布流卡片 - 优化响应式：桌面4列、平板3列、手机2列
.posts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.post-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  // Claymorphism 阴影效果
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(212, 163, 115, 0.15);
  transition: all 200ms ease-out;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 12px 32px rgba(224, 122, 95, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(212, 163, 115, 0.25);
  }

  &:active {
    transform: translateY(-2px);
  }
}

.post-image {
  aspect-ratio: 1;
  overflow: hidden;
  background: #F5F0E8;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .post-card:hover & img {
    transform: scale(1.05);
  }
}

.post-content {
  padding: 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: vars.$pet-charcoal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-excerpt {
  margin: 0;
  font-size: 13px;
  color: pet.$pet-warm-gray;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-top: 1px solid #F0F0F0;
}

.post-tags {
  display: flex;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.mini-tag {
  padding: 4px 10px;
  // 使用柔和的品牌色背景
  background: linear-gradient(135deg, rgba(224, 122, 95, 0.08), rgba(212, 163, 115, 0.08));
  border: 1px solid rgba(212, 163, 115, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #8B6F5C;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 150ms ease-out;

  &:hover {
    background: linear-gradient(135deg, rgba(224, 122, 95, 0.15), rgba(212, 163, 115, 0.15));
    border-color: rgba(212, 163, 115, 0.35);
    transform: translateY(-1px);
  }
}

.post-stats {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.stat-item {
  font-size: 12px;
  color: pet.$pet-warm-gray;
}

// 加载更多
.load-more {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

.no-more {
  color: pet.$pet-warm-gray;
  font-size: 14px;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    color: vars.$pet-charcoal;
  }

  p {
    margin: 0 0 20px;
    font-size: 14px;
    color: pet.$pet-warm-gray;
  }
}

// 响应式
@media (max-width: 1200px) {
  .posts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .posts-page {
    padding: 12px 16px;
  }

  .posts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    h1 {
      font-size: 20px;
    }
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;

    .filter-tabs {
      justify-content: center;
    }

    :deep(.filter-select) {
      width: 100%;
    }
  }

  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .post-content {
    padding: 10px 12px;
  }

  .post-title {
    font-size: 14px;
  }

  .post-excerpt {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 480px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
