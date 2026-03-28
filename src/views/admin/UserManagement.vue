<template>
  <div class="admin-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>用户管理</h2>
          <div class="header-actions">
            <el-input
              v-model="keyword"
              placeholder="搜索用户名/手机号"
              clearable
              style="width: 240px"
              @keyup.enter="loadUsers"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" :icon="Refresh" @click="loadUsers">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="users" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar || ''">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 1 ? 'success' : 'danger'" size="small">
              {{ row.enabled === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isAdmin" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isAdmin ? 'warning' : 'info'" size="small">
              {{ row.isAdmin ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.enabled === 1"
                type="danger"
                size="small"
                text
                @click="handleToggleEnabled(row, false)"
              >
                禁用
              </el-button>
              <el-button
                v-else
                type="success"
                size="small"
                text
                @click="handleToggleEnabled(row, true)"
              >
                启用
              </el-button>
              <el-button
                v-if="!row.isAdmin"
                type="warning"
                size="small"
                text
                @click="handleToggleRole(row, true)"
              >
                设为管理员
              </el-button>
              <el-button
                v-else
                type="info"
                size="small"
                text
                @click="handleToggleRole(row, false)"
              >
                取消管理员
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && users.length === 0" description="暂无用户" />

      <el-pagination
        v-model:current-page="pageNumber"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="loadUsers"
        @current-change="loadUsers"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Refresh, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAdminUserList, updateUserEnabled, updateUserRole } from '@/services/adminUserService'
import type { AdminUserResponse } from '@/types/admin'

const loading = ref(false)
const users = ref<AdminUserResponse[]>([])
const keyword = ref('')
const pageNumber = ref(1)
const pageSize = ref(20)
const total = ref(0)

const loadUsers = async () => {
  try {
    loading.value = true
    const params = {
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    }
    const { data } = await fetchAdminUserList(params)
    users.value = data?.records || []
    total.value = data?.total || 0
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    console.error('loadUsers error:', error)
  } finally {
    loading.value = false
  }
}

const handleToggleEnabled = async (user: AdminUserResponse, enabled: boolean) => {
  try {
    await ElMessageBox.confirm(
      `确定要${enabled ? '启用' : '禁用'}用户「${user.nickname || user.username}」吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await updateUserEnabled(user.id, { enabled })
    ElMessage.success(`${enabled ? '启用' : '禁用'}成功`)
    await loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${enabled ? '启用' : '禁用'}失败`)
    }
  }
}

const handleToggleRole = async (user: AdminUserResponse, isAdmin: boolean) => {
  try {
    await ElMessageBox.confirm(
      `确定要${isAdmin ? '设为' : '取消'}用户「${user.nickname || user.username}」的管理员权限吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await updateUserRole(user.id, { isAdmin })
    ElMessage.success(`${isAdmin ? '设置' : '取消'}管理员成功`)
    await loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
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
}
</style>
