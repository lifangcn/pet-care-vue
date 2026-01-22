<template>
  <div class="club-publish-page paw-print top-left">
    <el-card shadow="never">
      <template #header>
        <div class="header">
          <div class="title">发布动态</div>
          <el-button @click="goBack">返回</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="类型" prop="postType">
          <el-select v-model="form.postType" style="width: 240px">
            <el-option label="好物分享" :value="1" />
            <el-option label="服务推荐" :value="2" />
            <el-option label="地点推荐" :value="3" />
            <el-option label="日常分享" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" maxlength="5000" show-word-limit />
        </el-form-item>

        <el-form-item label="媒体URL">
          <el-input
            v-model="mediaUrlText"
            type="textarea"
            :rows="3"
            placeholder="每行一个URL（图片/视频）。如需上传文件，请后端提供上传接口后再接入。"
          />
        </el-form-item>

        <el-form-item label="外部链接">
          <el-input v-model="form.externalLink" maxlength="500" />
        </el-form-item>

        <el-form-item label="价格区间">
          <el-input v-model="form.priceRange" placeholder="如：100-200元" maxlength="50" style="width: 240px" />
        </el-form-item>

        <el-form-item label="地点">
          <div class="location-row">
            <el-input v-model="form.locationInfo.city" placeholder="城市" style="width: 160px" />
            <el-input v-model="form.locationInfo.district" placeholder="区域" style="width: 160px" />
            <el-input v-model="form.locationInfo.address" placeholder="地址" style="width: 360px" />
          </div>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="selectedLabelIds"
            multiple
            filterable
            remote
            clearable
            :remote-method="remoteSearchLabels"
            :loading="labelLoading"
            placeholder="输入关键词联想或选择推荐标签"
            style="width: 520px"
          >
            <el-option-group v-if="commonLabels.length > 0" label="推荐标签">
              <el-option v-for="t in commonLabels" :key="String(t.id)" :label="t.name" :value="t.id">
                <span>{{ t.name }}</span>
                <span v-if="t.color" :style="{ color: t.color, marginLeft: '8px', fontSize: '12px' }">●</span>
              </el-option>
            </el-option-group>
            <el-option v-for="t in labelOptions" :key="String(t.id)" :label="t.name" :value="t.id" />
          </el-select>
          <div v-if="commonLabels.length > 0" class="recommended-labels">
            <span class="label-hint">推荐标签：</span>
            <el-tag
              v-for="label in commonLabels"
              :key="String(label.id)"
              :type="selectedLabelIds.includes(label.id) ? 'success' : 'info'"
              class="label-tag"
              :style="{ borderColor: label.color, color: selectedLabelIds.includes(label.id) ? undefined : label.color }"
              effect="plain"
              @click="toggleLabel(label.id)"
            >
              {{ label.name }}
            </el-tag>
          </div>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { createPost } from '@/services/postService'
import { suggestLabels, fetchLabels } from '@/services/labelService'
import type { CreatePostPayload, Label } from '@/types/club'

const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = ref<CreatePostPayload>({
  postType: 1,
  title: '',
  content: '',
  externalLink: '',
  priceRange: '',
  locationInfo: { city: '', district: '', address: '' },
  mediaUrls: [],
  labelIds: [],
})

const mediaUrlText = ref('')
const selectedLabelIds = ref<Array<string | number>>([])

const labelOptions = ref<Label[]>([])
const labelLoading = ref(false)
const commonLabels = ref<Label[]>([])

const rules = computed<FormRules>(() => ({
  postType: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}))

const normalizeMediaUrls = () => {
  const lines = (mediaUrlText.value || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
  form.value.mediaUrls = lines.map(url => ({ url }))
}

const loadCommonLabels = async () => {
  try {
    const { data } = await fetchLabels({ type: 1 })
    commonLabels.value = data || []
  } catch (e) {
    commonLabels.value = []
  }
}

const toggleLabel = (labelId: string | number) => {
  const index = selectedLabelIds.value.indexOf(labelId)
  if (index > -1) {
    selectedLabelIds.value.splice(index, 1)
  } else {
    selectedLabelIds.value.push(labelId)
  }
}

const remoteSearchLabels = async (keyword: string) => {
  const kw = (keyword || '').trim()
  if (!kw) return
  labelLoading.value = true
  try {
    const { data } = await suggestLabels({ keyword: kw })
    labelOptions.value = data || []
  } finally {
    labelLoading.value = false
  }
}

onMounted(() => {
  loadCommonLabels()
})

const submit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    normalizeMediaUrls()
    form.value.labelIds = selectedLabelIds.value
    await createPost(form.value)
    ElMessage.success('发布成功')
    router.replace('/club/posts')
  } catch (e: any) {
    ElMessage.error(e?.message || '发布失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
@use '@/styles/pet-theme.scss' as pet;

.club-publish-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;

  @include pet.mobile-up(pet.$pet-breakpoint-lg) {
    max-width: 720px;
  }
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .title {
    font-size: 20px;
    font-weight: 700;
    font-family: 'Comic Sans MS', sans-serif;
  }
}

.location-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.recommended-labels {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;

  .label-hint {
    color: #606266;
    font-size: 13px;
    font-weight: 500;
  }

  .label-tag {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>


