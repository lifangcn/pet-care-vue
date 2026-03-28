<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>积分券管理</h2>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">创建积分券</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="templates" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="券名称" min-width="180" />
        <el-table-column prop="faceValue" label="面值" width="100">
          <template #default="{ row }">
            <span class="font-number">{{ row.faceValue }} 积分</span>
          </template>
        </el-table-column>
        <el-table-column prop="validDays" label="有效期" width="100">
          <template #default="{ row }">
            {{ row.validDays }} 天
          </template>
        </el-table-column>
        <el-table-column label="发放情况" width="150">
          <template #default="{ row }">
            <span class="font-number">{{ row.issuedCount }} / {{ row.totalCount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="perUserLimit" label="每人限领" width="100">
          <template #default="{ row }">
            {{ row.perUserLimit }} 张
          </template>
        </el-table-column>
        <el-table-column prop="sourceType" label="来源" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getSourceTypeLabel(row.sourceType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" size="small" text @click="openEditDialog(row)">编辑</el-button>
              <el-button type="warning" size="small" text @click="openIssueDialog(row)">发放</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && templates.length === 0" description="暂无积分券" />

      <el-pagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadTemplates"
        @current-change="loadTemplates"
      />
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑积分券' : '创建积分券'"
      width="600px"
      :before-close="handleDialogClose"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="券名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入券名称" />
        </el-form-item>
        <el-form-item label="面值(积分)" prop="faceValue">
          <el-input-number v-model="form.faceValue" :min="1" :max="10000" placeholder="请输入面值" />
        </el-form-item>
        <el-form-item label="有效期(天)" prop="validDays">
          <el-input-number v-model="form.validDays" :min="1" :max="365" placeholder="请输入有效期" />
        </el-form-item>
        <el-form-item label="总数量" prop="totalCount">
          <el-input-number v-model="form.totalCount" :min="1" :max="100000" placeholder="请输入总数量" />
        </el-form-item>
        <el-form-item label="每人限领" prop="perUserLimit">
          <el-input-number v-model="form.perUserLimit" :min="1" :max="10" placeholder="请输入每人限领数量" />
        </el-form-item>
        <el-form-item label="来源类型" prop="sourceType">
          <el-select v-model="form.sourceType" placeholder="请选择来源类型">
            <el-option label="系统发放" value="SYSTEM" />
            <el-option label="活动赠送" value="ACTIVITY" />
            <el-option label="新人礼包" value="NEWCOMER" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="issueDialogVisible" title="批量发放积分券" width="600px">
      <div class="issue-tips">
        <el-alert
          title="选择用户进行批量发放"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
      <el-form :model="issueForm" label-width="120px" style="margin-top: 20px">
        <el-form-item label="当前券模板">
          <span>{{ currentTemplate?.name }}</span>
        </el-form-item>
        <el-form-item label="用户ID列表">
          <el-input
            v-model="issueUserIdsInput"
            type="textarea"
            :rows="4"
            placeholder="请输入用户ID，多个用逗号分隔，如：1,2,3,4,5"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="issueDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="issueLoading" @click="handleIssue">发放</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  fetchCouponTemplates,
  createCouponTemplate,
  updateCouponTemplate,
  issueCoupon
} from '@/services/adminCouponService'
import type { PointsCouponTemplate, PointsCouponTemplateRequest } from '@/types/admin'

const loading = ref(false)
const templates = ref<PointsCouponTemplate[]>([])
const pageNumber = ref(1)
const pageSize = ref(20)
const total = ref(0)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const form = ref<PointsCouponTemplateRequest>({
  name: '',
  faceValue: 100,
  validDays: 30,
  totalCount: 100,
  perUserLimit: 1,
  sourceType: 'SYSTEM',
  status: 1
})

const rules: FormRules<PointsCouponTemplateRequest> = {
  name: [{ required: true, message: '请输入券名称', trigger: 'blur' }],
  faceValue: [{ required: true, message: '请输入面值', trigger: 'blur' }],
  validDays: [{ required: true, message: '请输入有效期', trigger: 'blur' }],
  totalCount: [{ required: true, message: '请输入总数量', trigger: 'blur' }],
  perUserLimit: [{ required: true, message: '请输入每人限领数量', trigger: 'blur' }],
  sourceType: [{ required: true, message: '请选择来源类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const editId = ref<number | null>(null)

const issueDialogVisible = ref(false)
const issueLoading = ref(false)
const currentTemplate = ref<PointsCouponTemplate | null>(null)
const issueUserIdsInput = ref('')

const loadTemplates = async () => {
  try {
    loading.value = true
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value
    }
    const { data } = await fetchCouponTemplates(params)
    templates.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    ElMessage.error('加载积分券列表失败')
    console.error('loadTemplates error:', error)
  } finally {
    loading.value = false
  }
}

const getSourceTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    SYSTEM: '系统',
    ACTIVITY: '活动',
    NEWCOMER: '新人'
  }
  return map[type] || type
}

const openCreateDialog = () => {
  isEdit.value = false
  editId.value = null
  form.value = {
    name: '',
    faceValue: 100,
    validDays: 30,
    totalCount: 100,
    perUserLimit: 1,
    sourceType: 'SYSTEM',
    status: 1
  }
  dialogVisible.value = true
}

const openEditDialog = (template: PointsCouponTemplate) => {
  isEdit.value = true
  editId.value = template.id
  form.value = {
    name: template.name,
    faceValue: template.faceValue,
    validDays: template.validDays,
    totalCount: template.totalCount,
    perUserLimit: template.perUserLimit,
    sourceType: template.sourceType as any,
    status: template.status
  }
  dialogVisible.value = true
}

const handleDialogClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    if (isEdit.value && editId.value) {
      await updateCouponTemplate(editId.value, form.value)
      ElMessage.success('编辑成功')
    } else {
      await createCouponTemplate(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadTemplates()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(isEdit.value ? '编辑失败' : '创建失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const openIssueDialog = (template: PointsCouponTemplate) => {
  currentTemplate.value = template
  issueUserIdsInput.value = ''
  issueDialogVisible.value = true
}

const handleIssue = async () => {
  if (!currentTemplate.value) return
  const userIds = issueUserIdsInput.value
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id))
  if (userIds.length === 0) {
    ElMessage.warning('请输入有效的用户ID')
    return
  }
  try {
    issueLoading.value = true
    await issueCoupon(currentTemplate.value.id, { userIds })
    ElMessage.success('发放成功')
    issueDialogVisible.value = false
    await loadTemplates()
  } catch (error) {
    ElMessage.error('发放失败')
  } finally {
    issueLoading.value = false
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadTemplates()
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

  .action-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
  }

  .issue-tips {
    margin-bottom: 8px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.font-number {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
</style>
