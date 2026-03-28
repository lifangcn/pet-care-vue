<template>
  <div class="rag-chat-page paw-print top-left" :class="`mode-${chatMode}`">
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
            <el-button @click="createNewSession" :loading="sessionsLoading">新建会话</el-button>
            <el-select v-if="sessions.length > 0" v-model="currentSessionId" style="width: 200px" placeholder="选择会话" @change="loadSession" :loading="sessionsLoading">
              <el-option
                v-for="session in sessions"
                :key="session.id"
                :label="session.name || `会话 ${session.id?.substring(0, 8)}...` || '未命名会话'"
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
                  <el-dropdown-item divided command="clearHistory" :disabled="clearHistoryLoading">
                    {{ clearHistoryLoading ? '清除中...' : '清除历史记录' }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <!-- 模式切换 + 提示信息 -->
        <div class="mode-section">
          <div class="mode-switcher">
            <span class="mode-label">对话模式</span>
            <el-segmented v-model="chatMode" :options="modeOptions" size="default">
              <template #default="{ item }">
                <div class="mode-option">
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.label }}</span>
                </div>
              </template>
            </el-segmented>
          </div>
          <div class="knowledge-hint" :class="`hint-${chatMode}`">
            <el-icon><InfoFilled /></el-icon>
            <span v-if="chatMode === 'rag'">基于知识库快速回答，适合简单问题</span>
            <span v-else>多步推理工具调用，适合复杂查询（消耗更多积分）</span>
            <span class="points-badge">
              <span class="points-icon">✦</span>
              {{ pointsStore.availablePoints }} 积分
            </span>
          </div>
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
            <span class="points-hint-value" :class="{ 'points-low': pointsStore.availablePoints < currentCost }">{{ pointsStore.availablePoints }}</span>
            <span class="points-hint-cost">本次提问消耗 {{ currentCost }} 积分</span>
            <span v-if="chatMode === 'agent'" class="mode-badge">Agent 模式</span>
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
import { ref, onMounted, nextTick, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { User, Service, ChatDotRound, InfoFilled, Promotion, MoreFilled, MagicStick } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ragChat, agentChat, syncPostsMigrate, syncActivitiesMigrate, clearChatHistory, fetchSessions, createSession, fetchSessionMessages } from '@/services/aiService'
import { usePointsStore } from '@/store/points'
import type { ChatMessage } from '@/types/ai'

const router = useRouter()
const pointsStore = usePointsStore()

/** 聊天模式 */
type ChatMode = 'rag' | 'agent'
const chatMode = ref<ChatMode>('rag')

/** 模式选项 */
const modeOptions = [
  { label: 'RAG', value: 'rag', icon: ChatDotRound },
  { label: 'Agent', value: 'agent', icon: MagicStick },
]

/** 根据模式获取积分消耗 */
const getCostPerQuery = (mode: ChatMode): number => {
  return mode === 'agent' ? 25 : 10
}

/** 当前模式的积分消耗 */
const currentCost = computed(() => getCostPerQuery(chatMode.value))

const messages = ref<ChatMessage[]>([])
const inputMessage = ref(localStorage.getItem('rag_chat_input') || '')
const isStreaming = ref(false)
const streamingContent = ref('')
const closeConnection = ref<(() => void) | null>(null)
const messagesContainer = ref<HTMLElement>()

const sessions = ref<Array<{ id: string; name: string }>>([])
const currentSessionId = ref('')
const sessionsLoading = ref(false)

watch(inputMessage, (newValue) => {
  localStorage.setItem('rag_chat_input', newValue)
})

/**
 * @description 创建新会话
 * @author Michael
 * @date 2026-03-02
 */
const createNewSession = async () => {
  try {
    const response = await createSession()
    // 拦截器返回 { ...response, data: response.data.data }
    // 所以实际数据在 response.data 中
    const newSession = response.data || response
    const sessionId = newSession?.id
    if (!sessionId) {
      throw new Error('创建会话返回的 ID 为空')
    }
    sessions.value.unshift({
      id: sessionId,
      name: newSession.name || '',
    })
    currentSessionId.value = sessionId
    messages.value = []
  } catch (e) {
    console.error('创建会话失败', e)
    // 降级：使用本地临时会话
    const tempId = `temp_${Date.now()}`
    currentSessionId.value = tempId
    messages.value = []
  }
}

/**
 * @description 加载会话历史消息
 * @author Michael
 * @date 2026-03-02
 */
const loadSession = async () => {
  if (!currentSessionId.value) return
  try {
    const history = await fetchSessionMessages(currentSessionId.value)
    messages.value = history
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error('加载会话历史失败', e)
    // 降级：清空消息，开始新对话
    messages.value = []
  }
}

/**
 * @description 加载会话列表
 * @author Michael
 * @date 2026-03-02
 */
const loadSessions = async () => {
  try {
    sessionsLoading.value = true
    const result = await fetchSessions()
    const sessionList = result.items || []

    if (sessionList.length > 0) {
      sessions.value = sessionList
      currentSessionId.value = sessionList[0].id
      await loadSession()
    } else {
      await createNewSession()
    }
  } catch (e) {
    console.error('加载会话列表失败', e)
    await createNewSession()
  } finally {
    sessionsLoading.value = false
  }
}

const goToDocuments = () => {
  router.push('/ai/documents')
}

const syncPostsLoading = ref(false)
const syncActivitiesLoading = ref(false)
const clearHistoryLoading = ref(false)

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

/**
 * @description 清除聊天历史记录
 * @author Michael
 * @date 2026-03-02
 */
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有对话历史吗？此操作不可恢复。',
      '清除历史记录',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    clearHistoryLoading.value = true
    const result = await clearChatHistory()
    ElMessage.success(`已清除 ${result.deletedCount} 条历史记录`)
    // 重新加载会话列表
    await loadSessions()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e?.message || '清除失败')
    }
  } finally {
    clearHistoryLoading.value = false
  }
}

/** 后台管理下拉菜单命令分发 */
const handleAdminCommand = (command: string) => {
  switch (command) {
    case 'syncPosts': handleSyncPosts(); break
    case 'syncActivities': handleSyncActivities(); break
    case 'documents': goToDocuments(); break
    case 'clearHistory': handleClearHistory(); break
  }
}

const handleSend = async () => {
  if (!inputMessage.value.trim() || isStreaming.value) return

  // 确保 sessionId 存在，如果为空则创建新会话
  if (!currentSessionId.value) {
    await createNewSession()
  }

  // 积分校验：余额不足时弹窗拦截
  const requiredPoints = currentCost.value
  if (pointsStore.availablePoints < requiredPoints) {
    try {
      await ElMessageBox.confirm(
        `当前积分余额 ${pointsStore.availablePoints}，本次咨询需要 ${requiredPoints} 积分。\n发帖、评论、签到都可以获取积分。`,
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

    // 根据模式选择 API
    const chatApi = chatMode.value === 'rag' ? ragChat : agentChat

    const closeFn = chatApi(
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
        console.error(`${chatMode.value.toUpperCase()} chat error:`, error)
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
        pointsStore.deductPoints(requiredPoints)
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

// 页面加载时获取积分账户和会话列表
pointsStore.fetchAccount()
loadSessions()

onUnmounted(() => {
  if (closeConnection.value) {
    closeConnection.value()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

// ========== 主题变量定义 ==========
$rag-primary: #E07A5F;
$rag-secondary: #FFB366;
$rag-accent: #FFD6A5;
$rag-bg-1: rgba(255, 251, 247, 0.85);
$rag-bg-2: rgba(255, 248, 240, 0.85);
$rag-glow: rgba(255, 138, 76, 0.15);

$agent-primary: #8B5CF6;
$agent-secondary: #A78BFA;
$agent-accent: #C4B5FD;
$agent-bg-1: rgba(248, 245, 255, 0.85);
$agent-bg-2: rgba(243, 238, 255, 0.85);
$agent-glow: rgba(139, 92, 246, 0.15);

// 平滑过渡
$theme-transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

.rag-chat-page {
  position: relative;
  padding: 24px;
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, $rag-bg-1, $rag-bg-2);
  transition: $theme-transition;

  // Agent 模式覆盖
  &.mode-agent {
    background: linear-gradient(135deg, $agent-bg-1, $agent-bg-2);
  }

  .pet-decorations {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    transition: $theme-transition;

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      animation: gentleFloat 18s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      transition: $theme-transition;

      // RAG 模式装饰
      &.deco-1 {
        width: 180px;
        height: 180px;
        top: 8%;
        left: 4%;
        background: linear-gradient(135deg, $rag-primary, $rag-accent);
        animation-delay: 0s;
        filter: blur(40px);
      }

      &.deco-2 {
        width: 160px;
        height: 160px;
        bottom: 12%;
        right: 4%;
        background: linear-gradient(135deg, $rag-secondary, $rag-accent);
        animation-delay: 6s;
        filter: blur(35px);
      }

      &.deco-3 {
        width: 120px;
        height: 120px;
        top: 45%;
        right: 8%;
        background: linear-gradient(135deg, $rag-accent, #FFF5EB);
        animation-delay: 12s;
        filter: blur(30px);
        display: block;
      }

      &.deco-4 {
        width: 100px;
        height: 100px;
        bottom: 25%;
        left: 8%;
        background: linear-gradient(135deg, $rag-secondary, $rag-accent);
        animation-delay: 3s;
        filter: blur(25px);
        display: block;
      }
    }

    // Agent 模式装饰
    .mode-agent & .deco-1 {
      background: linear-gradient(135deg, $agent-primary, $agent-accent);
      filter: blur(50px);
    }

    .mode-agent & .deco-2 {
      background: linear-gradient(135deg, $agent-secondary, $agent-accent);
      filter: blur(45px);
    }

    .mode-agent & .deco-3 {
      background: linear-gradient(135deg, $agent-accent, #EDE9FE);
      filter: blur(40px);
    }

    .mode-agent & .deco-4 {
      background: linear-gradient(135deg, $agent-secondary, $agent-accent);
      filter: blur(35px);
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
    border-radius: 24px;
    box-shadow:
      0 8px 32px $rag-glow,
      0 0 0 1px rgba(255, 255, 255, 0.5) inset;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    transition: $theme-transition;

    .mode-agent & {
      box-shadow:
        0 8px 32px $agent-glow,
        0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      background: rgba(255, 255, 255, 0.88);
    }

    :deep(.el-card__header) {
      border-bottom: 1px solid rgba(224, 122, 95, 0.1);
      transition: $theme-transition;
    }

    .mode-agent & :deep(.el-card__header) {
      border-bottom-color: rgba(139, 92, 246, 0.1);
    }
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
        width: 52px;
        height: 52px;
        background: linear-gradient(135deg, $rag-primary, $rag-accent);
        border-radius: 16px;
        animation: wave 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        color: #fff;
        box-shadow: 0 4px 16px rgba(224, 122, 95, 0.3);
        transition: $theme-transition;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        background: linear-gradient(135deg, $rag-primary, $rag-secondary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transition: $theme-transition;
      }

      .mode-agent & .header-icon {
        background: linear-gradient(135deg, $agent-primary, $agent-accent);
        box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
      }

      .mode-agent & h2 {
        background: linear-gradient(135deg, $agent-primary, $agent-secondary);
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

  .mode-section {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .mode-switcher {
      display: flex;
      align-items: center;
      gap: 12px;

      .mode-label {
        font-size: 13px;
        font-weight: 600;
        color: #606266;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      :deep(.el-segmented) {
        --el-segmented-bg-color: rgba(255, 255, 255, 0.8);
        --el-border-radius-base: 12px;
        transition: $theme-transition;

        .el-segmented__item {
          padding: 8px 16px;
          font-weight: 500;
          transition: $theme-transition;

          &.is-selected {
            background: linear-gradient(135deg, $rag-primary, $rag-secondary);
            color: #fff;
          }
        }
      }

      .mode-option {
        display: flex;
        align-items: center;
        gap: 6px;

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }

  // Agent 模式下 segmented 的选中样式
  &.mode-agent .mode-section .mode-switcher {
    :deep(.el-segmented) .el-segmented__item.is-selected {
      background: linear-gradient(135deg, $agent-primary, $agent-secondary);
    }
  }

  .knowledge-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    border-radius: 14px;
    font-size: 14px;
    border: 1px solid;
    transition: $theme-transition;

    &.hint-rag {
      background: linear-gradient(135deg, rgba(255, 209, 166, 0.25), rgba(255, 235, 220, 0.25));
      color: $rag-primary;
      border-color: rgba(224, 122, 95, 0.2);
    }

    &.hint-agent {
      background: linear-gradient(135deg, rgba(199, 181, 253, 0.3), rgba(237, 233, 254, 0.3));
      color: $agent-primary;
      border-color: rgba(139, 92, 246, 0.2);
    }

    .points-badge {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 14px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      transition: $theme-transition;

      .hint-rag & {
        border-color: rgba(224, 122, 95, 0.25);
        color: $rag-primary;
        box-shadow: 0 2px 8px rgba(224, 122, 95, 0.15);
      }

      .hint-agent & {
        border-color: rgba(139, 92, 246, 0.25);
        color: $agent-primary;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
      }

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
    border-radius: 16px;
    transition: $theme-transition;

    .mode-agent & {
      background: linear-gradient(180deg, rgba(248, 245, 255, 0.5), rgba(243, 238, 255, 0.5));
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(224, 122, 95, 0.2);
      border-radius: 3px;
      transition: $theme-transition;
    }

    .mode-agent &::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.2);
    }

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
          background: linear-gradient(135deg, $rag-primary, $rag-accent);
          border: 2px solid rgba(224, 122, 95, 0.3);
          box-shadow: 0 2px 8px rgba(224, 122, 95, 0.2);
          transition: $theme-transition;
        }

        .assistant-avatar {
          background: linear-gradient(135deg, #BFD9F2, #D7CCFF);
          border: 2px solid rgba(191, 217, 242, 0.3);
          box-shadow: 0 2px 8px rgba(191, 217, 242, 0.2);
          transition: $theme-transition;
        }

        .mode-agent & .assistant-avatar {
          background: linear-gradient(135deg, $agent-secondary, $agent-accent);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
        }
      }

      .message-content {
        flex: 1;
        max-width: 70%;

        .message-bubble {
          padding: 14px 18px;
          border-radius: 18px;
          word-wrap: break-word;
          position: relative;
          animation: fadeInUp 0.3s ease-out;
          transition: $theme-transition;

          &.user {
            background: linear-gradient(145deg, $rag-primary, $rag-secondary);
            color: #fff;
            margin-left: auto;
            box-shadow:
              0 4px 12px rgba(224, 122, 95, 0.3),
              inset -1px -1px 4px rgba(0, 0, 0, 0.15),
              inset 1px 1px 4px rgba(255, 255, 255, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.25);
          }

          .mode-agent & .message-bubble.user {
            background: linear-gradient(145deg, $agent-primary, $agent-secondary);
            box-shadow:
              0 4px 12px rgba(139, 92, 246, 0.3),
              inset -1px -1px 4px rgba(0, 0, 0, 0.15),
              inset 1px 1px 4px rgba(255, 255, 255, 0.3);
          }

          &.assistant {
            background: linear-gradient(145deg, #FFFFFF, #FAFAFA);
            color: #1f2d3d;
            box-shadow:
              0 4px 12px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
            border: 2px solid rgba(212, 163, 115, 0.15);
          }

          .mode-agent & .message-bubble.assistant {
            border-color: rgba(139, 92, 246, 0.15);
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
    border-top: 1px solid rgba(224, 122, 95, 0.12);
    border-radius: 0 0 16px 16px;
    transition: $theme-transition;

    .mode-agent & {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 245, 255, 0.95));
      border-top-color: rgba(139, 92, 246, 0.12);
    }

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
        font-size: 15px;
        transition: $theme-transition;

        &:not(.points-low) {
          color: $rag-primary;
        }

        &.points-low {
          color: #E07A5F;
          animation: pulse 1.5s infinite;
        }

        .mode-agent & &:not(.points-low) {
          color: $agent-primary;
        }
      }

      .points-hint-cost {
        font-size: 12px;
        color: #bbb;
      }

      .mode-badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 12px;
        margin-left: 8px;
        background: linear-gradient(135deg, $agent-primary, $agent-secondary);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        letter-spacing: 0.3px;
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    :deep(.el-textarea__inner) {
      border: 2px solid rgba(212, 163, 115, 0.25);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.95);
      transition: all 0.25s ease-out;

      &:focus {
        border-color: rgba(224, 122, 95, 0.5);
        box-shadow:
          0 0 0 4px rgba(224, 122, 95, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }
    }

    .mode-agent & :deep(.el-textarea__inner) {
      border-color: rgba(139, 92, 246, 0.2);

      &:focus {
        border-color: rgba(139, 92, 246, 0.5);
        box-shadow:
          0 0 0 4px rgba(139, 92, 246, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.9);
      }
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;

      .el-button {
        border-radius: 14px;
        padding: 12px 28px;
        font-weight: 600;
        transition: all 0.25s ease-out;

        &.el-button--primary {
          background: linear-gradient(145deg, $rag-primary, $rag-secondary);
          border: 2px solid rgba(224, 122, 95, 0.3);
          box-shadow:
            inset -1px -1px 4px rgba(0, 0, 0, 0.1),
            inset 1px 1px 4px rgba(255, 255, 255, 0.3),
            0 4px 12px rgba(224, 122, 95, 0.3);
          transition: $theme-transition;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow:
              inset -1px -1px 4px rgba(0, 0, 0, 0.1),
              inset 1px 1px 4px rgba(255, 255, 255, 0.3),
              0 6px 16px rgba(224, 122, 95, 0.35);
          }

          &:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            box-shadow:
              inset 2px 2px 6px rgba(0, 0, 0, 0.15),
              inset -1px -1px 4px rgba(255, 255, 255, 0.1),
              0 2px 6px rgba(224, 122, 95, 0.3);
          }
        }

        .mode-agent & .el-button--primary {
          background: linear-gradient(145deg, $agent-primary, $agent-secondary);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow:
            inset -1px -1px 4px rgba(0, 0, 0, 0.1),
            inset 1px 1px 4px rgba(255, 255, 255, 0.3),
            0 4px 12px rgba(139, 92, 246, 0.3);

          &:hover:not(:disabled) {
            box-shadow:
              inset -1px -1px 4px rgba(0, 0, 0, 0.1),
              inset 1px 1px 4px rgba(255, 255, 255, 0.3),
              0 6px 16px rgba(139, 92, 246, 0.35);
          }

          &:active:not(:disabled) {
            box-shadow:
              inset 2px 2px 6px rgba(0, 0, 0, 0.15),
              inset -1px -1px 4px rgba(255, 255, 255, 0.1),
              0 2px 6px rgba(139, 92, 246, 0.3);
          }
        }

        &:not(.el-button--primary) {
          border-color: rgba(0, 0, 0, 0.08);
          color: #606266;

          &:hover {
            border-color: rgba(0, 0, 0, 0.12);
            background: rgba(0, 0, 0, 0.02);
          }
        }
      }
    }
  }
}
</style>

