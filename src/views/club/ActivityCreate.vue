<template>
  <div class="club-activity-create-page">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">发活动</div>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="form.title" placeholder="给活动起个名字吧" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="说说详情">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="介绍一下活动内容吧" maxlength="5000" show-word-limit />
        </el-form-item>

        <el-form-item label="封面图">
          <el-input v-model="form.coverImage" placeholder="图片链接" maxlength="500" />
        </el-form-item>

        <el-form-item label="活动类型" prop="activityType">
          <el-radio-group v-model="form.activityType">
            <el-radio-button :value="1">线上活动</el-radio-button>
            <el-radio-button :value="2">线下聚会</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="什么时候" prop="activityTime">
          <el-date-picker
            v-model="form.activityTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="选个时间"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item label="什么时候结束">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="结束时间"
            style="width: 260px"
            clearable
          />
        </el-form-item>

        <el-form-item label="在哪儿" v-if="form.activityType === 2">
          <el-input v-model="form.address" placeholder="活动地点" maxlength="500" />
        </el-form-item>

        <el-form-item label="线上链接" v-if="form.activityType === 1">
          <el-input v-model="form.onlineLink" placeholder="活动链接" maxlength="500" />
        </el-form-item>

        <el-form-item label="人数限制">
          <el-input-number v-model="form.maxParticipants" :min="0" :step="1" />
          <span class="hint">0 表示不限</span>
        </el-form-item>

        <el-form-item label="活动标签">
          <el-input v-model="labelsText" placeholder="比如：遛狗,社交,猫咪" />
        </el-form-item>

        <el-form-item label="开启打卡">
          <el-switch v-model="checkInEnabledBool" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submit">发布</el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createActivity } from '@/services/activityService'
import type { CreateActivityPayload } from '@/types/club'

const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = ref<CreateActivityPayload>({
  title: '',
  description: '',
  coverImage: '',
  activityType: 1,
  activityTime: '',
  endTime: '',
  address: '',
  onlineLink: '',
  maxParticipants: 0,
  labels: [],
  checkInEnabled: 1,
})

const labelsText = ref('')
const checkInEnabledBool = computed({
  get: () => (form.value.checkInEnabled ?? 1) === 1,
  set: (v: boolean) => {
    form.value.checkInEnabled = v ? 1 : 0
  },
})

const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  activityType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  activityTime: [{ required: true, message: '请选择活动时间', trigger: 'change' }],
}))

const normalizeLabels = () => {
  const list = (labelsText.value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  form.value.labels = list
}

const submit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    normalizeLabels()
    const { data } = await createActivity(form.value)
    ElMessage.success('创建成功')
    router.replace(`/club/activities/${data.id}`)
  } catch (e: any) {
    ElMessage.error(e?.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.club-activity-create-page {
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
.hint {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}
</style>


