<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>数据同步</h2>
          <el-button :icon="Refresh" @click="loadIndexStatus">刷新状态</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-card class="status-card">
            <template #header>
              <div class="card-header">
                <span>索引状态</span>
                <el-tag :type="indexStatus ? 'success' : 'danger'" size="small">
                  {{ indexStatus ? '正常' : '异常' }}
                </el-tag>
              </div>
            </template>
            <div v-if="indexStatusData" class="status-content">
              <div class="status-item">
                <span class="label">文档总数：</span>
                <span class="value font-number">{{ indexStatusData.totalDocs || 0 }}</span>
              </div>
              <div class="status-item">
                <span class="label">最后同步时间：</span>
                <span class="value">{{ indexStatusData.lastSyncTime ? formatTime(indexStatusData.lastSyncTime) : '-' }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无状态数据" />
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>帖子同步</span>
              </div>
            </template>
            <div class="action-content">
              <p>将数据库中的帖子数据同步到 Elasticsearch 索引</p>
              <div class="action-buttons">
                <el-button type="primary" :loading="syncingPosts" @click="handleSyncPostsFull">
                  全量同步
                </el-button>
                <el-button :loading="syncingPosts" @click="handleSyncPostsIncremental">
                  增量同步
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="action-card">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>索引管理</span>
              </div>
            </template>
            <div class="action-content">
              <p>重建 Elasticsearch 索引（慎用，会清空现有数据）</p>
              <div class="action-buttons">
                <el-button type="danger" :loading="rebuildingIndex" @click="handleRebuildIndex">
                  重建索引
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <el-card>
        <template #header>
          <div class="card-header">
            <span>操作日志</span>
          </div>
        </template>
        <div class="log-list">
          <div v-if="logs.length === 0" class="log-empty">
            <el-empty description="暂无操作日志" :image-size="60" />
          </div>
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            <el-tag :type="log.type" size="small">{{ log.typeLabel }}</el-tag>
            <span class="log-message">{{ log.message }}</span>
            <span class="log-time">{{ log.time }}</span>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, Document, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  syncPostsFull,
  syncPostsIncremental,
  fetchIndexStatus,
  rebuildIndex
} from '@/services/adminAiService'

const indexStatus = ref(false)
const indexStatusData = ref<any>(null)
const syncingPosts = ref(false)
const rebuildingIndex = ref(false)

interface LogItem {
  type: 'success' | 'warning' | 'info' | 'danger'
  typeLabel: string
  message: string
  time: string
}

const logs = ref<LogItem[]>([])

const addLog = (type: LogItem['type'], message: string) => {
  const typeLabels: Record<LogItem['type'], string> = {
    success: '成功',
    warning: '警告',
    info: '信息',
    danger: '错误'
  }
  logs.value.unshift({
    type,
    typeLabel: typeLabels[type],
    message,
    time: new Date().toLocaleString('zh-CN')
  })
  if (logs.value.length > 50) {
    logs.value.pop()
  }
}

const loadIndexStatus = async () => {
  try {
    const { data } = await fetchIndexStatus()
    indexStatusData.value = data
    indexStatus.value = !!data
  } catch (error) {
    indexStatus.value = false
    indexStatusData.value = null
    addLog('danger', '获取索引状态失败')
    console.error('loadIndexStatus error:', error)
  }
}

const handleSyncPostsFull = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要执行全量同步吗？这可能需要较长时间。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    syncingPosts.value = true
    addLog('info', '开始全量同步帖子...')
    await syncPostsFull()
    ElMessage.success('全量同步任务已提交')
    addLog('success', '全量同步任务已提交')
    await loadIndexStatus()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('全量同步失败')
      addLog('danger', '全量同步失败')
    }
  } finally {
    syncingPosts.value = false
  }
}

const handleSyncPostsIncremental = async () => {
  try {
    syncingPosts.value = true
    addLog('info', '开始增量同步帖子...')
    await syncPostsIncremental()
    ElMessage.success('增量同步任务已提交')
    addLog('success', '增量同步任务已提交')
    await loadIndexStatus()
  } catch (error) {
    ElMessage.error('增量同步失败')
    addLog('danger', '增量同步失败')
  } finally {
    syncingPosts.value = false
  }
}

const handleRebuildIndex = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重建索引吗？这将清空现有索引数据并重新创建！',
      '警告',
      {
        confirmButtonText: '确定重建',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    rebuildingIndex.value = true
    addLog('warning', '开始重建索引...')
    await rebuildIndex()
    ElMessage.success('重建索引任务已提交')
    addLog('success', '重建索引任务已提交')
    await loadIndexStatus()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('重建索引失败')
      addLog('danger', '重建索引失败')
    }
  } finally {
    rebuildingIndex.value = false
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadIndexStatus()
  addLog('info', '页面已加载')
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
  }

  .status-card,
  .action-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .status-content {
    display: flex;
    gap: 40px;

    .status-item {
      .label {
        color: #909399;
        margin-right: 8px;
      }
      .value {
        font-weight: 600;
      }
    }
  }

  .action-content {
    p {
      color: #606266;
      margin: 0 0 16px 0;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }

  .log-list {
    max-height: 400px;
    overflow-y: auto;

    .log-empty {
      padding: 40px 0;
    }

    .log-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .log-message {
        flex: 1;
        font-size: 14px;
        color: #303133;
      }

      .log-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.font-number {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
</style>
