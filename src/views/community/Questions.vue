<template>
  <div class="questions-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>问答求助</h2>
          <el-button type="primary" @click="showAskDialog = true">提问</el-button>
        </div>
      </template>
      <el-tabs v-model="activeCategory" @tab-change="loadQuestions">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="健康" name="health" />
        <el-tab-pane label="喂养" name="feeding" />
        <el-tab-pane label="训练" name="training" />
      </el-tabs>
      <div class="question-list">
        <el-empty v-if="questions.length === 0" description="暂无问题" />
        <el-card v-for="question in questions" :key="question.id" class="question-item" @click="$router.push(`/questions/${question.id}`)">
          <div class="question-header">
            <div class="author-info">
              <el-avatar :src="question.authorAvatar" />
              <div>
                <h4>{{ question.title }}</h4>
                <span class="author">{{ question.authorName }}</span>
              </div>
            </div>
            <el-tag size="small">{{ question.category }}</el-tag>
          </div>
          <p class="question-content">{{ question.content }}</p>
          <div class="question-footer">
            <div class="tags">
              <el-tag v-for="tag in question.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
            </div>
            <div class="stats">
              <span>浏览 {{ question.viewCount }}</span>
              <span>回答 {{ question.answerCount }}</span>
            </div>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="loadQuestions"
      />
    </el-card>

    <el-dialog v-model="showAskDialog" title="提问" width="600px">
      <el-form :model="questionForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="questionForm.title" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="questionForm.category">
            <el-option label="健康" value="health" />
            <el-option label="喂养" value="feeding" />
            <el-option label="训练" value="training" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="questionForm.content" type="textarea" :rows="5" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="questionForm.tags" placeholder="用逗号分隔" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAskDialog = false">取消</el-button>
        <el-button type="primary" @click="submitQuestion">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchQuestions, createQuestion } from '@/services/communityService'
import type { Question } from '@/services/communityService'

const activeCategory = ref('all')
const questions = ref<Question[]>([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })
const showAskDialog = ref(false)
const questionForm = ref({
  title: '',
  content: '',
  category: 'health',
  tags: '',
})

const loadQuestions = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
    }
    if (activeCategory.value !== 'all') {
      params.category = activeCategory.value
    }
    const res = await fetchQuestions(params)
    questions.value = res.data.data || []
    pagination.value.total = res.data.total || 0
  } catch (error) {
    console.error('加载问题列表失败:', error)
  }
}

const submitQuestion = async () => {
  try {
    await createQuestion({
      title: questionForm.value.title,
      content: questionForm.value.content,
      category: questionForm.value.category,
      tags: questionForm.value.tags.split(',').filter(t => t.trim()),
    })
    showAskDialog.value = false
    questionForm.value = { title: '', content: '', category: 'health', tags: '' }
    loadQuestions()
  } catch (error) {
    console.error('提交问题失败:', error)
  }
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped lang="scss">
.questions-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2 {
    margin: 0;
  }
}

.question-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  h4 {
    margin: 0 0 4px;
  }
  .author {
    font-size: 12px;
    color: #999;
  }
}

.question-content {
  margin: 0 0 16px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .tags {
    display: flex;
    gap: 8px;
  }
  .stats {
    display: flex;
    gap: 16px;
    color: #999;
    font-size: 12px;
  }
}
</style>
