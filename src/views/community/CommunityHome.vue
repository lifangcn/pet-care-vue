<template>
  <div class="community-home-page">
    <div class="page-header">
      <h1>宠物社区</h1>
      <p>分享您与宠物的美好时光</p>
    </div>

    <div class="post-editor">
      <el-card shadow="hover">
        <el-input
          v-model="postContent"
          type="textarea"
          :rows="4"
          placeholder="分享您与宠物的故事..."
          maxlength="500"
          show-word-limit
        />
        <div class="editor-actions">
          <el-upload
            v-model:file-list="uploadedImages"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :limit="9"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-button
            type="primary"
            :icon="Promotion"
            :loading="publishing"
            @click="handlePublish"
          >
            发布
          </el-button>
        </div>
      </el-card>
    </div>

    <div
      v-infinite-scroll="loadMore"
      :infinite-scroll-disabled="!hasMore || loading"
      :infinite-scroll-distance="100"
      class="posts-container"
    >
      <el-card
        v-for="post in posts"
        :key="post.id"
        shadow="hover"
        class="post-card"
      >
        <div class="post-header">
          <el-avatar :size="48" :src="post.user.avatar" />
          <div class="user-info">
            <div class="user-name">
              {{ post.user.nickname }}
              <el-tag v-if="post.user.verified" type="success" size="small" class="verified-tag">
                <el-icon><Check /></el-icon>
                {{ post.user.verifiedType === 'official' ? '官方' : 'VIP' }}
              </el-tag>
            </div>
            <div class="post-time">{{ formatTime(post.createdAt) }}</div>
          </div>
        </div>

        <div class="post-content">
          <p>{{ post.content }}</p>
          <div v-if="post.media && post.media.length > 0" class="post-media">
            <div
              v-if="post.media.length === 1"
              class="media-single"
            >
              <el-image
                v-if="post.media[0].type === 'image'"
                :src="post.media[0].url"
                fit="cover"
                class="media-image"
                :preview-src-list="[post.media[0].url]"
                preview-teleported
              />
              <video
                v-else
                :src="post.media[0].url"
                controls
                class="media-video"
              />
            </div>
            <div
              v-else
              class="media-grid"
              :class="`grid-${Math.min(post.media.length, 9)}`"
            >
              <div
                v-for="(media, index) in post.media"
                :key="index"
                class="media-item"
              >
                <el-image
                  v-if="media.type === 'image'"
                  :src="media.url"
                  fit="cover"
                  class="media-image"
                  :preview-src-list="post.media.filter(m => m.type === 'image').map(m => m.url)"
                  :initial-index="index"
                  preview-teleported
                />
                <video
                  v-else
                  :src="media.url"
                  controls
                  class="media-video"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="post-actions">
          <el-button
            :type="post.isLiked ? 'danger' : 'default'"
            :icon="post.isLiked ? GoodsFilled : Goods"
            @click="handleLike(post.id)"
          >
            {{ post.likes }}
          </el-button>
          <el-button
            :icon="ChatLineRound"
            @click="toggleComments(post.id)"
          >
            {{ post.comments }}
          </el-button>
          <el-button
            :icon="Share"
            @click="handleShare(post.id)"
          >
            {{ post.shares }}
          </el-button>
        </div>

        <div v-if="showComments[post.id]" class="post-comments">
          <div class="comments-list">
            <div
              v-for="comment in displayedComments(post)"
              :key="comment.id"
              class="comment-item"
            >
              <el-avatar :size="32" :src="comment.user.avatar" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-user">{{ comment.user.nickname }}</span>
                  <span v-if="comment.replyToUser" class="reply-to">
                    回复 @{{ comment.replyToUser.nickname }}
                  </span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
              </div>
            </div>
          </div>

          <div class="comment-input">
            <el-input
              v-model="commentInputs[post.id]"
              type="textarea"
              :rows="2"
              placeholder="写评论..."
              @keyup.ctrl.enter="handleAddComment(post.id)"
            />
            <el-button
              type="primary"
              size="small"
              @click="handleAddComment(post.id)"
            >
              发送
            </el-button>
          </div>

          <div
            v-if="post.comments > displayedComments(post).length"
            class="load-more-comments"
          >
            <el-button
              text
              type="primary"
              @click="loadMoreComments(post.id)"
            >
              展开更多评论 ({{ post.comments - displayedComments(post).length }})
            </el-button>
          </div>
        </div>
      </el-card>

      <div v-if="loading" class="loading-more">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      <div v-if="!hasMore && posts.length > 0" class="no-more">
        没有更多了
      </div>
      <el-empty v-if="!loading && posts.length === 0" description="暂无动态，快来发布第一条吧！" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Promotion, Goods, GoodsFilled, ChatLineRound, Share, Check, Loading } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useCommunityStore } from '@/store/community'
import type { CommunityPost } from '@/types/community'

const communityStore = useCommunityStore()

const postContent = ref('')
const uploadedImages = ref<UploadFile[]>([])
const publishing = ref(false)
const showComments = reactive<Record<string, boolean>>({})
const commentInputs = reactive<Record<string, string>>({})

const posts = computed(() => communityStore.posts)
const loading = computed(() => communityStore.loading)
const hasMore = computed(() => communityStore.hasMore)

const displayedComments = (post: CommunityPost) => {
  if (!post.commentsList) return []
  return post.commentsList.slice(0, 3)
}

const handlePreview = (file: UploadFile) => {
  // 预览图片
}

const handleRemove = (file: UploadFile) => {
  // 移除图片
}

/**
 * [API调用] 发布动态
 * 通过store调用 POST /community/posts 接口
 */
const handlePublish = async () => {
  if (!postContent.value.trim() && uploadedImages.value.length === 0) {
    ElMessage.warning('请输入内容或上传图片')
    return
  }

  try {
    publishing.value = true
    const imageUrls = uploadedImages.value.map((file: UploadFile) => {
      if (file.url) return file.url
      if (file.response && typeof file.response === 'object' && 'url' in file.response) {
        return (file.response as { url: string }).url
      }
      return ''
    }).filter(Boolean)

    // [API调用] 通过store调用 POST /community/posts - 发布新动态
    await communityStore.publishPost({
      content: postContent.value,
      media: imageUrls,
    })

    postContent.value = ''
    uploadedImages.value = []
  } catch (error) {
    console.error(error)
  } finally {
    publishing.value = false
  }
}

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    // [API调用] 通过store调用 GET /community/posts - 加载更多动态
    communityStore.loadPosts(false)
  }
}

/**
 * [API调用] 点赞/取消点赞
 * 通过store调用 POST /community/posts/:id/like 接口
 */
const handleLike = (postId: string) => {
  // [API调用] 通过store调用 POST /community/posts/:id/like - 点赞/取消点赞动态
  communityStore.togglePostLike(postId)
}

const toggleComments = (postId: string) => {
  showComments[postId] = !showComments[postId]
  if (showComments[postId] && !posts.value.find((p) => p.id === postId)?.commentsList) {
    // [API调用] 通过store调用 GET /community/posts/:id/comments - 加载评论
    communityStore.loadPostComments(postId)
  }
}

const loadMoreComments = (postId: string) => {
  // [API调用] 通过store调用 GET /community/posts/:id/comments - 加载更多评论
  communityStore.loadPostComments(postId, true)
}

/**
 * [API调用] 发表评论
 * 通过store调用 POST /community/posts/:id/comments 接口
 */
const handleAddComment = (postId: string) => {
  const content = commentInputs[postId]?.trim()
  if (!content) {
    ElMessage.warning('请输入评论内容')
    return
  }

  // [API调用] 通过store调用 POST /community/posts/:id/comments - 发表评论
  communityStore.addComment(postId, { content })
  commentInputs[postId] = ''
}

const handleShare = (postId: string) => {
  ElMessage.info('分享功能开发中')
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  // [API调用] 通过store调用 GET /community/posts - 初始加载动态列表
  communityStore.loadPosts(true)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.community-home-page {
  padding: 24px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: vars.$font-family-base;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    color: #1f2d3d;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.post-editor {
  margin-bottom: 24px;

  .editor-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
  }
}

.posts-container {
  .post-card {
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .post-header {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    .user-info {
      flex: 1;

      .user-name {
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 8px;

        .verified-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .post-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .post-content {
    margin-bottom: 16px;

    p {
      margin: 0 0 12px;
      line-height: 1.6;
      color: #606266;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .post-media {
      margin-top: 12px;

      .media-single {
        .media-image,
        .media-video {
          width: 100%;
          max-height: 500px;
          border-radius: 8px;
        }
      }

      .media-grid {
        display: grid;
        gap: 8px;
        border-radius: 8px;
        overflow: hidden;

        &.grid-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        &.grid-3,
        &.grid-4 {
          grid-template-columns: repeat(3, 1fr);
        }

        &.grid-5,
        &.grid-6 {
          grid-template-columns: repeat(3, 1fr);
        }

        &.grid-7,
        &.grid-8,
        &.grid-9 {
          grid-template-columns: repeat(3, 1fr);
        }

        .media-item {
          position: relative;
          padding-top: 100%;
          overflow: hidden;

          .media-image,
          .media-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }

  .post-actions {
    display: flex;
    gap: 16px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }

  .post-comments {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .comments-list {
      margin-bottom: 12px;

      .comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .comment-content {
          flex: 1;

          .comment-header {
            margin-bottom: 4px;

            .comment-user {
              font-weight: 600;
              color: #1f2d3d;
              margin-right: 8px;
            }

            .reply-to {
              color: vars.$pet-color-blue;
              font-size: 12px;
            }
          }

          .comment-text {
            margin: 0 0 4px;
            color: #606266;
            line-height: 1.5;
          }

          .comment-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .comment-input {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .load-more-comments {
      text-align: center;
      margin-top: 12px;
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 24px;
    color: #909399;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .community-home-page {
    padding: 16px;
  }

  .post-content .post-media .media-grid {
    gap: 4px;
  }
}
</style>

