<template>
  <div class="rag-chat-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>RAG 智能问答</h2>
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
          </div>
        </div>
        <div class="knowledge-hint">
          <el-icon><InfoFilled /></el-icon>
          <span>基于知识库回答，提供专业的宠物护理建议</span>
        </div>
      </template>

      <div class="chat-container">
        <div ref="messagesContainer" class="messages-container">
          <div v-if="messages.length === 0" class="empty-state">
            <el-icon :size="64"><ChatDotRound /></el-icon>
            <p>开始对话吧！我会基于知识库为您提供专业的宠物护理建议。</p>
          </div>
          <div
            v-for="message in messages"
            :key="message.id || message.timestamp"
            :class="['message-item', message.role]"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :size="32">
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-avatar v-else :size="32" style="background: #409eff">
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
              <el-avatar :size="32" style="background: #409eff">
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
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="输入您的问题..."
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
import { User, Service, ChatDotRound, InfoFilled, Promotion } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ragChat } from '@/services/aiService'
import type { ChatMessage } from '@/types/ai'

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

const handleSend = async () => {
  if (!inputMessage.value.trim() || isStreaming.value) return

  const userMessage: ChatMessage = {
    id: `msg_${Date.now()}`,
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date().toISOString(),
  }

  messages.value.push(userMessage)
  const question = inputMessage.value.trim()
  inputMessage.value = ''

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

onUnmounted(() => {
  if (closeConnection.value) {
    closeConnection.value()
  }
})
</script>

<style scoped lang="scss">
.rag-chat-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .knowledge-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f0f9ff;
    border-radius: 4px;
    color: #409eff;
    font-size: 14px;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    height: 600px;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f5f7fa;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;

      p {
        margin-top: 16px;
        font-size: 14px;
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
      }

      .message-content {
        flex: 1;
        max-width: 70%;

        .message-bubble {
          padding: 12px 16px;
          border-radius: 8px;
          word-wrap: break-word;

          &.user {
            background: #409eff;
            color: #fff;
            margin-left: auto;
          }

          &.assistant {
            background: #fff;
            color: #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

        .message-time {
          margin-top: 4px;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .input-container {
    padding: 16px;
    background: #fff;
    border-top: 1px solid #e4e7ed;

    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>

