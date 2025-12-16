import { defineStore } from 'pinia'
import { fetchPosts, createPost, toggleLike, fetchPostComments, createComment } from '@/services/communityService'
import type { CommunityPost, CreatePostPayload, PostComment } from '@/types/community'
import { ElMessage } from 'element-plus'

interface CommunityState {
  posts: CommunityPost[]
  loading: boolean
  hasMore: boolean
  page: number
  pageSize: number
}

export const useCommunityStore = defineStore('community', {
  state: (): CommunityState => ({
    posts: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
  }),
  actions: {
    /**
     * [API调用] 加载动态列表
     * 调用 GET /community/posts 接口获取动态列表
     * @param {boolean} refresh - 是否刷新（重置分页）
     */
    async loadPosts(refresh: boolean = false) {
      if (this.loading) return

      try {
        this.loading = true
        if (refresh) {
          this.page = 1
          this.posts = []
          this.hasMore = true
        }

        // [API调用] GET /community/posts - 获取动态列表
        const { data } = await fetchPosts({
          page: this.page,
          pageSize: this.pageSize,
        })

        if (refresh) {
          this.posts = data.data
        } else {
          this.posts.push(...data.data)
        }

        this.hasMore = data.data.length === this.pageSize
        if (this.hasMore) {
          this.page += 1
        }
      } catch (error) {
        ElMessage.error('加载动态失败')
      } finally {
        this.loading = false
      }
    },
    /**
     * [API调用] 发布动态
     * 调用 POST /community/posts 接口创建新动态
     * @param {CreatePostPayload} payload - 动态创建数据
     */
    async publishPost(payload: CreatePostPayload) {
      try {
        // [API调用] POST /community/posts - 发布新动态
        const { data } = await createPost(payload)
        this.posts.unshift(data)
        ElMessage.success('发布成功')
      } catch (error) {
        ElMessage.error('发布失败')
      }
    },
    /**
     * [API调用] 点赞/取消点赞
     * 调用 POST /community/posts/:id/like 接口切换点赞状态
     * @param {string} id - 动态ID
     */
    async togglePostLike(id: string) {
      try {
        // [API调用] POST /community/posts/:id/like - 点赞/取消点赞动态
        const { data } = await toggleLike(id)
        const post = this.posts.find((p) => p.id === id)
        if (post) {
          post.isLiked = data.isLiked
          post.likes = data.likes
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    },
    /**
     * [API调用] 加载评论
     * 调用 GET /community/posts/:id/comments 接口获取评论列表
     * @param {string} id - 动态ID
     * @param {boolean} loadMore - 是否加载更多
     */
    async loadPostComments(id: string, loadMore: boolean = false) {
      try {
        const post = this.posts.find((p) => p.id === id)
        if (!post) return

        const currentPage = loadMore ? (post.commentsList?.length || 0) / 10 + 1 : 1

        // [API调用] GET /community/posts/:id/comments - 获取动态评论列表
        const { data } = await fetchPostComments(id, {
          page: currentPage,
          pageSize: 10,
        })

        if (loadMore && post.commentsList) {
          post.commentsList.push(...data.data)
        } else {
          post.commentsList = data.data
        }
      } catch (error) {
        ElMessage.error('加载评论失败')
      }
    },
    /**
     * [API调用] 发表评论
     * 调用 POST /community/posts/:id/comments 接口创建评论
     * @param {string} id - 动态ID
     * @param {Object} payload - 评论数据
     */
    async addComment(id: string, payload: { content: string; replyTo?: string }) {
      try {
        // [API调用] POST /community/posts/:id/comments - 发表评论
        const { data } = await createComment(id, payload)
        const post = this.posts.find((p) => p.id === id)
        if (post) {
          if (!post.commentsList) {
            post.commentsList = []
          }
          post.commentsList.push(data)
          post.comments += 1
        }
        ElMessage.success('评论成功')
      } catch (error) {
        ElMessage.error('评论失败')
      }
    },
  },
})

