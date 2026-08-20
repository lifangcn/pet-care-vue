import { defineStore } from 'pinia'
import { fetchPointsAccount } from '@/services/pointsService'
import type { PointsAccount, PointsLevel } from '@/types/points'

/** 等级阈值配置（根据累计积分计算） */
const LEVEL_THRESHOLDS = [
  { level: 1,  min: 0,      max: 99,       title: '萌新铲屎官' },
  { level: 2,  min: 100,    max: 499,      title: '入门铲屎官' },
  { level: 3,  min: 500,    max: 1499,     title: '熟练铲屎官' },
  { level: 4,  min: 1500,   max: 3499,     title: '资深铲屎官' },
  { level: 5,  min: 3500,   max: 6999,     title: '专家铲屎官' },
  { level: 6,  min: 7000,   max: 14999,    title: '宠物达人' },
  { level: 7,  min: 15000,  max: 29999,    title: '圈内红人' },
  { level: 8,  min: 30000,  max: 59999,    title: '宠物大师' },
  { level: 9,  min: 60000,  max: 119999,   title: '社区领袖' },
  { level: 10, min: 120000, max: Infinity,  title: '宠物宗师' },
]

/** 根据累计积分计算等级信息 */
function calcLevel(totalPoints: number): PointsLevel {
  const threshold = LEVEL_THRESHOLDS.find(t => totalPoints >= t.min && totalPoints <= t.max)
    || LEVEL_THRESHOLDS[0]

  const isMaxLevel = threshold.level === 10
  const nextThreshold = isMaxLevel ? null : LEVEL_THRESHOLDS[threshold.level] // level 是 1-based，刚好作为下一级的 index

  // 当前等级区间内的进度
  const rangeTotal = isMaxLevel ? 1 : (nextThreshold!.min - threshold.min)
  const rangeCurrent = totalPoints - threshold.min
  const progress = isMaxLevel ? 100 : Math.min(Math.floor((rangeCurrent / rangeTotal) * 100), 100)

  return {
    level: threshold.level,
    title: threshold.title,
    currentPoints: totalPoints,
    nextLevelPoints: isMaxLevel ? -1 : nextThreshold!.min,
    progress,
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

interface PointsState {
  account: PointsAccount | null
  lastFetchTime: number | null    // 缓存时间戳，避免重复请求
}

/** 强制刷新轮询的共享 Promise，避免并发重复请求 */
let refreshPromise: Promise<PointsAccount | null> | null = null

export const usePointsStore = defineStore('points', {
  state: (): PointsState => ({
    account: null,
    lastFetchTime: null,
  }),

  getters: {
    /** 可用积分 */
    availablePoints: (state): number => state.account?.availablePoints ?? 0,

    /** 累计积分 */
    totalPoints: (state): number => state.account?.totalPoints ?? 0,

    /** 等级信息（实时计算） */
    level(): PointsLevel {
      return calcLevel(this.totalPoints)
    },
  },

  actions: {
    /**
     * 获取积分账户信息
     * @param force 是否强制刷新（忽略缓存）
     */
    async fetchAccount(force = false) {
      // 5分钟内不重复请求
      const CACHE_TTL = 5 * 60 * 1000
      if (!force && this.account && this.lastFetchTime && Date.now() - this.lastFetchTime < CACHE_TTL) {
        return this.account
      }

      try {
        const { data } = await fetchPointsAccount()
        this.account = data
        this.lastFetchTime = Date.now()
        return data
      } catch (error) {
        console.error('[Points Store] 获取积分账户失败:', error)
        throw error
      }
    },

    /**
     * 强制刷新积分账户，若 totalPoints 为 0 则有界轮询等待到账
     * @param maxAttempts 最大尝试次数（默认 6 次，约 5 秒）
     * @param intervalMs 轮询间隔（默认 1000ms）
     * @returns 最终获取到的账户信息或 null
     */
    async fetchAccountWithRetry(maxAttempts = 6, intervalMs = 1000) {
      if (refreshPromise) {
        return refreshPromise
      }

      refreshPromise = (async () => {
        let account: PointsAccount | null = null

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          try {
            account = await this.fetchAccount(true)
          } catch (error) {
            console.error('[Points Store] 强制刷新积分账户失败:', error)
            account = null
          }

          if (account && account.totalPoints > 0) {
            break
          }

          if (attempt < maxAttempts - 1) {
            await delay(intervalMs)
          }
        }

        return account
      })()

      try {
        return await refreshPromise
      } finally {
        refreshPromise = null
      }
    },

    /** 本地扣减积分（发送AI消息后立即更新，无需等待接口刷新） */
    deductPoints(amount: number) {
      if (this.account) {
        this.account.availablePoints = Math.max(0, this.account.availablePoints - amount)
      }
    },

    /** 本地增加积分（领取代金券后立即更新，无需等待接口刷新） */
    addPoints(amount: number) {
      if (this.account) {
        this.account.availablePoints += amount
      }
    },
  },
})
