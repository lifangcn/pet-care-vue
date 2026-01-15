<template>
  <div class="document-management-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>文档管理</h2>
          <el-button type="primary" :icon="UploadFilled" @click="triggerUpload">上传文档</el-button>
        </div>
      </template>

      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="1"
          accept=".pdf,.doc,.docx,.md,.txt"
          :show-file-list="false"
        >
          <el-button type="primary" :icon="UploadFilled">选择文件</el-button>
          <template #tip>
            <div class="upload-tip">
              支持 PDF、Word、Markdown、TXT 格式，文件大小不超过 50MB
            </div>
          </template>
        </el-upload>
        <div v-if="currentFile" class="file-info">
          <el-icon><Document /></el-icon>
          <span>{{ currentFile.name }}</span>
          <el-button type="primary" size="small" :loading="uploading" @click="confirmUpload">确认上传</el-button>
          <el-button size="small" @click="cancelUpload">取消</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="documents" stripe style="width: 100%">
        <el-table-column prop="name" label="文档名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row.fileUrl" target="_blank" type="primary">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.fileType.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="chunkCount" label="分块数量" width="100" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '已处理' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" text @click="previewDocument(row)">预览</el-button>
              <el-button type="danger" size="small" text @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && documents.length === 0" description="暂无文档" />
    </el-card>

    <el-dialog v-model="previewVisible" title="文档预览" width="80%" :before-close="handlePreviewClose">
      <div v-if="previewDocumentData" class="preview-content">
        <iframe v-if="previewUrl" :src="previewUrl" style="width: 100%; height: 600px; border: none" />
        <div v-else class="preview-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载预览中...</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UploadFilled, Document, Loading } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadFiles } from 'element-plus'
import { uploadDocument, fetchDocuments, deleteDocument, getDocumentPreviewUrl } from '@/services/aiService'
import type { KnowledgeDocument } from '@/types/ai'

const loading = ref(false)
const documents = ref<KnowledgeDocument[]>([])
const uploadRef = ref()
const currentFile = ref<File | null>(null)
const uploading = ref(false)
const previewVisible = ref(false)
const previewDocumentData = ref<KnowledgeDocument | null>(null)
const previewUrl = ref<string>('')

const loadDocuments = async () => {
  try {
    loading.value = true
    const res = await fetchDocuments()
    documents.value = res.data || []
  } catch (error) {
    ElMessage.error('加载文档列表失败')
  } finally {
    loading.value = false
  }
}

const triggerUpload = () => {
  uploadRef.value?.$el.querySelector('input')?.click()
}

const handleFileChange = (file: UploadFile, fileList: UploadFiles) => {
  currentFile.value = file.raw as File
}

const handleFileRemove = () => {
  currentFile.value = null
}

const cancelUpload = () => {
  currentFile.value = null
  uploadRef.value?.clearFiles()
}

const confirmUpload = async () => {
  if (!currentFile.value) return
  await uploadFile(currentFile.value)
}

const uploadFile = async (file: File) => {
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 50MB')
    return
  }

  const allowedTypes = ['.pdf', '.doc', '.docx', '.md', '.txt']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(fileExtension)) {
    ElMessage.error('不支持的文件格式，仅支持 PDF、Word、Markdown、TXT')
    return
  }

  try {
    uploading.value = true
    const res = await uploadDocument(file)
    ElMessage.success('上传成功')
    uploadRef.value?.clearFiles()
    currentFile.value = null
    await loadDocuments()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个文档吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    
    await deleteDocument(id)
    ElMessage.success('删除成功')
    await loadDocuments()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const previewDocument = async (doc: KnowledgeDocument) => {
  try {
    previewDocumentData.value = doc
    const res = await getDocumentPreviewUrl(doc.id)
    previewUrl.value = res.data || doc.fileUrl
    previewVisible.value = true
  } catch (error) {
    ElMessage.error('获取预览地址失败')
    previewUrl.value = doc.fileUrl
    previewVisible.value = true
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handlePreviewClose = () => {
  previewVisible.value = false
  previewUrl.value = ''
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped lang="scss">
.document-management-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .upload-section {
    margin-bottom: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .upload-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #999;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 4px;

      span {
        flex: 1;
        font-size: 14px;
        color: #333;
      }
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .preview-content {
    width: 100%;
    height: 600px;

    .preview-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
      gap: 12px;
    }
  }
}
</style>


