<template>
  <div class="question-detail-page">
    <el-card>
      <div class="question-header">
        <div class="author-info">
          <el-avatar :src="question.authorAvatar" />
          <div>
            <h2>{{ question.title }}</h2>
            <span class="author">{{ question.authorName }}</span>
            <span class="time">{{ formatTime(question.createdAt) }}</span>
          </div>
        </div>
        <el-tag>{{ question.category }}</el-tag>
      </div>
      <div class="question-content">
        <p>{{ question.content }}</p>
        <div v-if="question.images && question.images.length > 0" class="question-images">
          <el-image v-for="(img, idx) in question.images" :key="idx" :src="img" class="question-image" />
        </div>
        <div class="tags">
          <el-tag v-for="tag in question.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
      </div>
      <div class="question-stats">
        <span>浏览 {{ question.viewCount }}</span>
        <span>回答 {{ question.answerCount }}</span>
      </div>
    </el-card>

    <el-card class="answers-card">
      <template #header>
        <h3>回答 ({{ question.answers.length }})</h3>
      </template>
      <div class="answer-list">
        <el-empty v-if="question.answers.length === 0" description="暂无回答" />
        <div v-for="answer in question.answers" :key="answer.id" class="answer-item" :class="{ best: answer.isBest }">
          <div class="answer-header">
            <div class="author-info">
              <el-avatar :src="answer.authorAvatar" />
              <div>
                <h4>{{ answer.authorName }}</h4>
                <el-tag v-if="answer.isExpert" type="success" size="small">专家</el-tag>
                <el-tag v-if="answer.isBest" type="warning" size="small">最佳答案</el-tag>
              </div>
            </div>
            <div class="answer-actions">
              <el-button type="text" @click="likeAnswer(answer.id)">点赞 ({{ answer.likeCount }})</el-button>
            </div>
          </div>
          <div class="answer-content">
            <p>{{ answer.content }}</p>
            <div v-if="answer.images && answer.images.length > 0" class="answer-images">
              <el-image v-for="(img, idx) in answer.images" :key="idx" :src="img" class="answer-image" />
            </div>
          </div>
          <div class="answer-footer">
            <span class="time">{{ formatTime(answer.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div class="answer-input">
        <el-input v-model="answerContent" type="textarea" :rows="4" placeholder="写下你的回答..." />
        <div class="input-actions">
          <el-button type="primary" @click="submitAnswer">提交回答</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchQuestionById, createAnswer, likeAnswer } from '@/services/communityService'
import type { Question } from '@/services/communityService'

const route = useRoute()
const question = ref<Question>({
  id: '',
  title: '',
  content: '',
  authorId: '',
  authorName: '',
  authorAvatar: '',
  category: '',
  tags: [],
  viewCount: 0,
  answerCount: 0,
  answers: [],
  createdAt: '',
})
const answerContent = ref('')

const loadQuestion = async () => {
  try {
    const id = route.params.id as string
    const res = await fetchQuestionById(id)
    question.value = res.data
  } catch (error) {
    console.error('加载问题详情失败:', error)
  }
}

const submitAnswer = async () => {
  if (!answerContent.value.trim()) return
  try {
    await createAnswer(question.value.id, { content: answerContent.value })
    answerContent.value = ''
    loadQuestion()
  } catch (error) {
    console.error('提交回答失败:', error)
  }
}

const likeAnswerHandler = async (answerId: string) => {
  try {
    await likeAnswer(answerId)
    loadQuestion()
  } catch (error) {
    console.error('点赞失败:', error)
  }
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  loadQuestion()
})
</script>

<style scoped lang="scss">
.question-detail-page {
  padding: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  h2 {
    margin: 0 0 4px;
  }
  .author,
  .time {
    font-size: 12px;
    color: #999;
    margin-right: 16px;
  }
}

.question-content {
  margin-bottom: 24px;
  p {
    margin: 0 0 16px;
    line-height: 1.8;
  }
  .question-images {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    .question-image {
      width: 120px;
      height: 120px;
    }
  }
  .tags {
    display: flex;
    gap: 8px;
  }
}

.question-stats {
  display: flex;
  gap: 24px;
  color: #999;
  font-size: 14px;
}

.answers-card {
  margin-top: 24px;
}

.answer-list {
  margin-bottom: 24px;
}

.answer-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
  &.best {
    background: #fff9e6;
    border-color: #ffd700;
  }
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.answer-content {
  margin-bottom: 12px;
  p {
    margin: 0 0 8px;
    line-height: 1.8;
  }
  .answer-images {
    display: flex;
    gap: 8px;
    .answer-image {
      width: 100px;
      height: 100px;
    }
  }
}

.answer-footer {
  .time {
    font-size: 12px;
    color: #999;
  }
}

.answer-input {
  margin-top: 24px;
  .input-actions {
    margin-top: 8px;
    text-align: right;
  }
}
</style>
