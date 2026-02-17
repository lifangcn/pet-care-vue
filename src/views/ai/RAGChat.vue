<template>
  <div class="rag-chat-page paw-print top-left">
    <div class="pet-decorations">
      <div class="deco-circle deco-1"></div>
      <div class="deco-circle deco-2"></div>
      <div class="deco-circle deco-3"></div>
      <div class="deco-circle deco-4"></div>
    </div>
    <el-card class="chat-card">
      <template #header>
        <div class="header">
          <div class="header-left">
            <div class="header-icon">
              <el-icon :size="32"><ChatDotRound /></el-icon>
            </div>
            <h2>AI助手</h2>
          </div>
          <div class="header-actions">
            <el-button @click="createNewSession">新建会话</el-button>
            <el-select v-model="currentSessionId" style="width: 200px" placeholder="选择会话" @change="loadSession">
              <el-option
                v-for="session in sessions"
                :key="session.id"
                :label="session.name"
                :value="session.id"
              />
            </el-select>
            <!-- 后台管理操作收纳 -->
            <el-dropdown trigger="click" @command="handleAdminCommand">
              <el-button class="admin-more-btn" text>
                <el-icon :size="18"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="syncPosts" :disabled="syncPostsLoading">
                    {{ syncPostsLoading ? '同步中...' : '同步动态' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="syncActivities" :disabled="syncActivitiesLoading">
                    {{ syncActivitiesLoading ? '同步中...' : '同步活动' }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="documents">文档管理</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="knowledge-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>基于知识库回答，提供专业的宠物护理建议</span>
          <span class="points-badge">
            <span class="points-icon">✦</span>
            {{ pointsStore.availablePoints }} 积分
          </span>
        </div>
      </template>

      <div class="chat-container">
        <div ref="messagesContainer" class="messages-container">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">
              <el-icon :size="64" color="#FF8A4C"><ChatDotRound /></el-icon>
            </div>
            <h3>你好！我是你的宠物护理助手</h3>
            <p>有什么关于宠物的问题都可以问我哦～我会基于知识库为你提供专业的建议</p>
            <div class="suggestions">
              <div class="suggestion-item" @click="inputMessage = '如何照顾刚出生的小猫？'; handleSend()">
                <el-icon color="#FF8A4C"><ChatDotRound /></el-icon> 如何照顾刚出生的小猫？
              </div>
              <div class="suggestion-item" @click="inputMessage = '狗狗需要打哪些疫苗？'; handleSend()">
                <el-icon color="#FF8A4C"><ChatDotRound /></el-icon> 狗狗需要打哪些疫苗？
              </div>
              <div class="suggestion-item" @click="inputMessage = '宠物日常饮食需要注意什么？'; handleSend()">
                <el-icon color="#FF8A4C"><ChatDotRound /></el-icon> 宠物日常饮食需要注意什么？
              </div>
            </div>
          </div>
          <div
            v-for="message in messages"
            :key="message.id || message.timestamp"
            :class="['message-item', message.role]"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :size="40" class="user-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar v-else :size="40" class="assistant-avatar">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble" :class="message.role">
                <div v-if="message.role === 'assistant' && message.content" class="markdown-content" v-html="formatMarkdown(message.content)"></div>
                <div v-else>{{ message.content }}</div>
              </div>
              <div v-if="message.timestamp" class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>
          <div v-if="isStreaming" class="message-item assistant">
            <div class="message-avatar">
              <el-avatar :size="40" class="assistant-avatar">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-bubble assistant">
                <div class="streaming-content">
                  {{ streamingContent }}
                  <span class="cursor">|</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="input-container">
          <!-- 积分余额提示 -->
          <div class="points-hint">
            <span class="points-hint-label">当前积分</span>
            <span class="points-hint-value" :class="{ 'points-low': pointsStore.availablePoints < 10 }">{{ pointsStore.availablePoints }}</span>
            <span class="points-hint-cost">每次提问消耗 10 积分</span>
          </div>
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入您的问题，我会尽力帮助您..."
            :disabled="isStreaming"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="() => {}"
          />
          <div class="input-actions">
            <el-button type="primary" :disabled="!inputMessage.trim() || isStreaming" @click="handleSend">
              <el-icon><Promotion /></el-icon>
              发送
            </el-button>
            <el-button :disabled="isStreaming" @click="clearMessages">清空</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { User, Service, ChatDotRound, InfoFilled, Promotion, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ragChat, syncPostsMigrate, syncActivitiesMigrate } from '@/services/aiService'
import { usePointsStore } from '@/store/points'
import type { ChatMessage } from '@/types/ai'

const router = useRouter()
const pointsStore = usePointsStore()

/** AI咨询每次消耗积分 */
const AI_COST_PER_QUERY = 10

const messages = ref<ChatMessage[]>([])
const inputMessage = ref(localStorage.getItem('rag_chat_input') || '')
const isStreaming = ref(false)
const streamingContent = ref('')
const closeConnection = ref<(() => void) | null>(null)
const messagesContainer = ref<HTMLElement>()

const sessions = ref<Array<{ id: string; name: string }>>([
  { id: 'default', name: '默认会话' },
])
const currentSessionId = ref('default')

watch(inputMessage, (newValue) => {
  localStorage.setItem('rag_chat_input', newValue)
})

const createNewSession = () => {
  const newSessionId = `session_${Date.now()}`
  const newSession = {
    id: newSessionId,
    name: `会话 ${sessions.value.length}`,
  }
  sessions.value.push(newSession)
  currentSessionId.value = newSessionId
  messages.value = []
}

const loadSession = () => {
  messages.value = []
}

const goToDocuments = () => {
  router.push('/ai/documents')
}

const syncPostsLoading = ref(false)
const syncActivitiesLoading = ref(false)

const handleSyncPosts = async () => {
  try {
    syncPostsLoading.value = true
    await syncPostsMigrate()
    ElMessage.success('动态同步完成')
  } catch (e: any) {
    ElMessage.error(e?.message || '同步动态失败')
  } finally {
    syncPostsLoading.value = false
  }
}

const handleSyncActivities = async () => {
  try {
    syncActivitiesLoading.value = true
    await syncActivitiesMigrate()
    ElMessage.success('活动同步完成')
  } catch (e: any) {
    ElMessage.error(e?.message || '同步活动失败')
  } finally {
    syncActivitiesLoading.value = false
  }
}

/** 后台管理下拉菜单命令分发 */
const handleAdminCommand = (command: string) => {
  switch (command) {
    case 'syncPosts': handleSyncPosts(); break
    case 'syncActivities': handleSyncActivities(); break
    case 'documents': goToDocuments(); break
  }
}

const handleSend = async () => {
  if (!inputMessage.value.trim() || isStreaming.value) return

  // 积分校验：余额不足时弹窗拦截
  if (pointsStore.availablePoints < AI_COST_PER_QUERY) {
    try {
      await ElMessageBox.confirm(
        `当前积分余额 ${pointsStore.availablePoints}，本次咨询需要 ${AI_COST_PER_QUERY} 积分。\n发帖、评论、签到都可以获取积分。`,
        '积分不足',
        {
          confirmButtonText: '去赚积分',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      // 跳转到社区页面引导用户赚积分
      router.push('/club/posts')
    } catch {
      // 用户点取消，不做任何操作
    }
    return
  }

  const userMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date().toISOString(),
  }

  messages.value.push(userMessage)
  const question = inputMessage.value.trim()
  inputMessage.value = ''

  // 更新AI问答统计
  const currentCount = parseInt(localStorage.getItem('ai_chat_count') || '0', 10)
  localStorage.setItem('ai_chat_count', String(currentCount + 1))

  await nextTick()
  scrollToBottom()

  try {
    isStreaming.value = true
    streamingContent.value = ''

    let assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    const closeFn = ragChat(
      question,
      currentSessionId.value,
      (data: string) => {
        if (data) {
          streamingContent.value += data
          assistantMessage.content = streamingContent.value
          scrollToBottom()
        }
      },
      (error: Error) => {
        console.error('RAG chat error:', error)
        isStreaming.value = false
        closeConnection.value = null
        
        if (assistantMessage.content) {
          messages.value.push(assistantMessage)
        } else {
          ElMessage.error(`对话失败: ${error.message || '请重试'}`)
        }
      },
      () => {
        // 流式响应结束，确保最终内容被保存
        if (streamingContent.value) {
          assistantMessage.content = streamingContent.value
        }
        if (assistantMessage.content) {
          messages.value.push(assistantMessage)
        }
        // 本地扣减积分（后端已自动扣分，此处同步前端状态）
        pointsStore.deductPoints(AI_COST_PER_QUERY)
        isStreaming.value = false
        streamingContent.value = ''
        closeConnection.value = null
        scrollToBottom()
      }
    )

    closeConnection.value = closeFn
  } catch (error) {
    ElMessage.error('发送失败，请重试')
    isStreaming.value = false
    streamingContent.value = ''
  }
}

const clearMessages = () => {
  messages.value = []
  streamingContent.value = ''
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMarkdown = (text: string) => {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

// 页面加载时获取积分账户
pointsStore.fetchAccount()

onUnmounted(() => {
  if (closeConnection.value) {
    closeConnection.value()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.rag-chat-page {
  position: relative;
  padding: 24px;
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, rgba(255, 251, 247, 0.8), rgba(255, 248, 240, 0.8));

  .pet-decorations {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      animation: gentleFloat 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;

      &.deco-1 {
        width: 120px;
        height: 120px;
        top: 10%;
        left: 5%;
        background: linear-gradient(135deg, #FF8A4C, #FFD1A6);
        animation-delay: 0s;
      }

      &.deco-2 {
        width: 80px;
        height: 80px;
        top: 30%;
        right: 8%;
        background: linear-gradient(135deg, #BFD9F2, #D7CCFF);
        animation-delay: 3s;
      }

      &.deco-3 {
        width: 100px;
        height: 100px;
        bottom: 25%;
        left: 3%;
        background: linear-gradient(135deg, #FFD1A6, #BFD9F2);
        animation-delay: 6s;
      }

      &.deco-4 {
        width: 90px;
        height: 90px;
        bottom: 15%;
        right: 5%;
        background: linear-gradient(135deg, #D7CCFF, #FF8A4C);
        animation-delay: 9s;
      }
    }
  }

  @keyframes gentleFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(15px, -20px) rotate(5deg); }
    66% { transform: translate(-10px, -15px) rotate(-5deg); }
  }

  .chat-card {
    position: relative;
    z-index: 1;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(255, 138, 76, 0.15);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #FF8A4C, #FFD1A6);
        border-radius: 12px;
        animation: wave 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        color: #fff;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        background: linear-gradient(135deg, #FF8A4C, #FFD1A6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;

      .admin-more-btn {
        padding: 6px;
        color: #999;
        border-radius: 8px;

        &:hover {
          color: #FF8A4C;
          background: rgba(255, 138, 76, 0.08);
        }
      }
    }
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-8deg); }
    75% { transform: rotate(8deg); }
  }

  .knowledge-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(255, 209, 166, 0.2), rgba(191, 217, 242, 0.2));
    border-radius: 12px;
    color: #FF8A4C;
    font-size: 14px;
    border: 1px solid rgba(255, 138, 76, 0.2);

    .points-badge {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(255, 138, 76, 0.25);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      color: #FF8A4C;
      white-space: nowrap;

      .points-icon {
        font-size: 12px;
      }
    }
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: linear-gradient(180deg, rgba(255, 251, 247, 0.5), rgba(255, 248, 240, 0.5));
    border-radius: 12px;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 40px 20px;

      .empty-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 96px;
        height: 96px;
        margin: 0 auto 16px;
        background: linear-gradient(135deg, rgba(255, 138, 76, 0.1), rgba(191, 217, 242, 0.1));
        border-radius: 24px;
        animation: bounce 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
      }

      h3 {
        margin: 0 0 12px;
        font-size: 20px;
        color: #1f2d3d;
        font-weight: 600;
      }

      p {
        margin: 0 0 32px;
        font-size: 15px;
        color: #606266;
        line-height: 1.6;
      }

      .suggestions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        max-width: 420px;

        .suggestion-item {
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 251, 247, 0.9));
          border: 2px solid rgba(255, 138, 76, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease-out;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #606266;
          white-space: nowrap;
          text-align: left;

          .el-icon {
            flex-shrink: 0;
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 138, 76, 0.2);
            border-color: rgba(255, 138, 76, 0.4);
            background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 251, 247, 1));
          }
        }
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes blink {
      0%, 50% {
        opacity: 1;
      }
      51%, 100% {
        opacity: 0;
      }
    }

    .message-item {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.user {
        flex-direction: row-reverse;
      }

      .message-avatar {
        flex-shrink: 0;

        .user-avatar {
          background: linear-gradient(135deg, #FF8A4C, #FFD1A6);
          border: 2px solid rgba(255, 138, 76, 0.3);
        }

        .assistant-avatar {
          background: linear-gradient(135deg, #BFD9F2, #D7CCFF);
          border: 2px solid rgba(191, 217, 242, 0.3);
        }
      }

      .message-content {
        flex: 1;
        max-width: 70%;

        .message-bubble {
          padding: 14px 18px;
          border-radius: 16px;
          word-wrap: break-word;
          position: relative;
          animation: fadeInUp 0.3s ease-out;

          &.user {
            background: linear-gradient(135deg, #FF8A4C, #FFB366);
            color: #fff;
            margin-left: auto;
            box-shadow: 0 4px 12px rgba(255, 138, 76, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          &.assistant {
            background: linear-gradient(135deg, #fff, #fafafa);
            color: #1f2d3d;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 138, 76, 0.1);
          }

          .markdown-content {
            line-height: 1.6;

            :deep(code) {
              background: #f5f5f5;
              padding: 2px 6px;
              border-radius: 3px;
              font-family: 'Courier New', monospace;
            }

            :deep(strong) {
              font-weight: 600;
            }
          }

          .streaming-content {
            .cursor {
              animation: blink 1s infinite;
            }
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-time {
          margin-top: 4px;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .input-container {
    padding: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 251, 247, 0.95));
    border-top: 1px solid rgba(255, 138, 76, 0.15);
    border-radius: 0 0 12px 12px;

    .points-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 13px;
      color: #999;

      .points-hint-label {
        color: #999;
      }

      .points-hint-value {
        font-weight: 700;
        font-family: 'SF Mono', 'Consolas', monospace;
        color: #FF8A4C;
        font-size: 15px;

        &.points-low {
          color: #E07A5F;
          animation: pulse 1.5s infinite;
        }
      }

      .points-hint-cost {
        margin-left: auto;
        font-size: 12px;
        color: #bbb;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    :deep(.el-textarea__inner) {
      border: 2px solid rgba(255, 138, 76, 0.2);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.9);
      transition: all 0.3s ease;

      &:focus {
        border-color: #FF8A4C;
        box-shadow: 0 0 0 3px rgba(255, 138, 76, 0.1);
      }
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;

      .el-button {
        border-radius: 12px;
        padding: 10px 24px;
        font-weight: 500;
        transition: all 0.3s ease;

        &.el-button--primary {
          background: linear-gradient(135deg, #FF8A4C, #FFB366);
          border: none;
          box-shadow: 0 4px 12px rgba(255, 138, 76, 0.3);

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 138, 76, 0.4);
          }
        }
      }
    }
  }
}
</style>

