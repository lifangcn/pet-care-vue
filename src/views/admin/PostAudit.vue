<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>帖子审核</h2>
          <div class="header-actions">
            <el-radio-group v-model="auditStatusFilter" size="default" @change="loadPosts">
              <el-radio-button :value="undefined">全部</el-radio-button>
              <el-radio-button value="PENDING">待审核</el-radio-button>
              <el-radio-button value="APPROVED">已通过</el-radio-button>
              <el-radio-button value="REJECTED">已拒绝</el-radio-button>
            </el-radio-group>
            <el-button type="primary" :icon="Refresh" @click="loadPosts">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="posts" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" width="120" />
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.auditStatus)" size="small">
              {{ getStatusLabel(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.auditStatus === 'PENDING'"
                type="success"
                size="small"
                text
                @click="handleAudit(row, 'APPROVED')"
              >
                通过
              </el-button>
              <el-button
                v-if="row.auditStatus === 'PENDING'"
                type="danger"
                size="small"
                text
                @click="handleAudit(row, 'REJECTED')"
              >
                拒绝
              </el-button>
              <el-button type="primary" size="small" text @click="viewDetail(row)">
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && posts.length === 0" description="暂无帖子" />

      <el-pagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadPosts"
        @current-change="loadPosts"
      />
    </el-card>

    <el-dialog v-model="detailVisible" title="帖子详情" width="700px">
      <div v-if="currentPost" class="post-detail">
        <h3>{{ currentPost.title }}</h3>
        <div class="post-meta">
          <span>作者：{{ currentPost.authorName }}</span>
          <span>发布时间：{{ formatTime(currentPost.createdAt) }}</span>
        </div>
        <div class="post-content">{{ currentPost.content }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            v-if="currentPost?.auditStatus === 'PENDING'"
            type="success"
            @click="handleAudit(currentPost, 'APPROVED')"
          >
            通过
          </el-button>
          <el-button
            v-if="currentPost?.auditStatus === 'PENDING'"
            type="danger"
            @click="handleAudit(currentPost, 'REJECTED')"
          >
            拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAdminPostList, auditPost } from '@/services/adminAuditService'
import type { AdminPostItem, AuditStatusOfContent } from '@/services/adminAuditService'

const loading = ref(false)
const posts = ref<AdminPostItem[]>([])
const auditStatusFilter = ref<AuditStatusOfContent | undefined>(undefined)
const pageNumber = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const currentPost = ref<AdminPostItem | null>(null)

const loadPosts = async () => {
  try {
    loading.value = true
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      auditStatus: auditStatusFilter.value
    }
    const { data } = await fetchAdminPostList(params)
    posts.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    ElMessage.error('加载帖子列表失败')
    console.error('loadPosts error:', error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status: AuditStatusOfContent) => {
  const map: Record<AuditStatusOfContent, any> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: AuditStatusOfContent) => {
  const map: Record<AuditStatusOfContent, string> = {
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝'
  }
  return map[status] || '未知'
}

const handleAudit = async (post: AdminPostItem, status: AuditStatusOfContent) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status === 'APPROVED' ? '通过' : '拒绝'}帖子「${post.title}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await auditPost(post.id, status)
    ElMessage.success(`${status === 'APPROVED' ? '通过' : '拒绝'}成功`)
    detailVisible.value = false
    await loadPosts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const viewDetail = (post: AdminPostItem) => {
  currentPost.value = post
  detailVisible.value = true
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped lang="scss">
.admin-page {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .post-detail {
    h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .post-meta {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #999;
      margin-bottom: 16px;
    }

    .post-content {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
