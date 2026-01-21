<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <h2>设置</h2>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="推送通知" name="notification">
          <el-form label-width="120px">
            <el-form-item label="系统通知">
              <el-switch v-model="settings.systemNotification" />
            </el-form-item>
            <el-form-item label="订单通知">
              <el-switch v-model="settings.orderNotification" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="隐私设置" name="privacy">
          <el-form label-width="120px">
            <el-form-item label="个人资料可见">
              <el-radio-group v-model="settings.profileVisible">
                <el-radio label="public">公开</el-radio>
                <el-radio label="friends">仅好友</el-radio>
                <el-radio label="private">私密</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="允许搜索">
              <el-switch v-model="settings.allowSearch" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="其他" name="other">
          <el-form label-width="120px">
            <el-form-item label="清除缓存">
              <el-button @click="clearCache">清除缓存</el-button>
            </el-form-item>
            <el-form-item label="反馈与客服">
              <el-button @click="showFeedback = true">意见反馈</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="actions">
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </el-card>

    <el-dialog v-model="showFeedback" title="意见反馈" width="500px">
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedback = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('notification')
const showFeedback = ref(false)
const settings = ref({
  systemNotification: true,
  orderNotification: true,
  profileVisible: 'public',
  allowSearch: true,
})
const feedbackForm = ref({
  content: '',
  contact: '',
})

const saveSettings = () => {
  // [API调用] PUT /user/settings - 保存用户设置（待后端提供）
  ElMessage.success('设置已保存')
}

const clearCache = () => {
  localStorage.clear()
  sessionStorage.clear()
  ElMessage.success('缓存已清除')
}

const submitFeedback = () => {
  // [API调用] POST /feedback - 提交用户反馈（待后端提供）
  ElMessage.success('反馈已提交')
  showFeedback.value = false
  feedbackForm.value = { content: '', contact: '' }
}

onMounted(() => {
  // [API调用] GET /user/settings - 加载用户设置（待后端提供）
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: 24px;
}

.actions {
  margin-top: 24px;
  text-align: right;
}
</style>
