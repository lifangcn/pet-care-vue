import { defineStore } from 'pinia'
import { fetchPets, savePet, removePet } from '@/services/petService'
import type { CreatePetPayload, Pet } from '@/types/pet'
import { ElMessage } from 'element-plus'

interface PetState {
  pets: Pet[]
  loading: boolean
  searchText: string
  lastLoadTime: number | null // 上次加载时间，用于防止频繁请求
}

export const usePetStore = defineStore('pet', {
  state: (): PetState => ({
    pets: [],
    loading: false,
    searchText: '',
    lastLoadTime: null,
  }),
  getters: {
    filteredPets: (state) => {
      if (!state.searchText) return state.pets
      const keyword = state.searchText.toLowerCase()
      return state.pets.filter(
        (pet) =>
          (pet.name || '').toLowerCase().includes(keyword) ||
          (pet.breed || '').toLowerCase().includes(keyword) ||
          (pet.type || '').toLowerCase().includes(keyword),
      )
    },
  },
  actions: {
    /**
     * [API调用] 加载宠物列表
     * 调用 GET /pet/list 接口获取当前用户的宠物列表（后端通过token获取用户信息）
     * @param {boolean} force - 是否强制刷新，默认 false
     */
    async loadPets(force: boolean = false) {
      // 如果正在加载中，避免重复请求
      if (this.loading) {
        return
      }

      const now = Date.now()
      // 如果不是强制刷新，且距离上次加载不足 30 秒，则不重复请求（防止频繁请求）
      if (!force && this.lastLoadTime && (now - this.lastLoadTime < 30000)) {
        return
      }

      try {
        this.loading = true
        // [API调用] GET /pet/list - 获取当前用户的宠物列表（后端通过token获取用户信息）
        const { data } = await fetchPets()
        // 转换后端数据格式为前端期望的格式
        this.pets = (Array.isArray(data) ? data : []).map((pet: any) => this.normalizePetData(pet))
        this.lastLoadTime = now
      } catch (error) {
        console.error('[Pet Store] 获取宠物列表失败:', error)
        ElMessage.error('获取宠物列表失败')
      } finally {
        this.loading = false
      }
    },
    /**
     * 标准化宠物数据格式，将后端返回的数据转换为前端期望的格式
     */
    normalizePetData(pet: any): Pet {
      return {
        id: pet.id,
        userId: pet.userId,
        name: pet.name || '',
        type: this.convertType(pet.type),
        breed: pet.breed ?? '',
        gender: this.convertGender(pet.gender),
        birthday: pet.birthday ?? '',
        weight: pet.weight ?? null,
        avatar: pet.avatar ?? '',
        healthNotes: pet.healthNotes ?? '',
        createdAt: pet.createdAt,
      }
    },
    /**
     * 转换宠物类型：后端可能返回布尔值或其他格式，转换为 1|2|3
     */
    convertType(type: any): string {
      if (typeof type === 'string') return type
      if (type === 1 || type === '1') return 'dog'
      if (type === 2 || type === '2') return 'cat'
      if (type === 3 || type === '3') return 'other'
      return ''
    },
    /**
     * 转换性别：后端可能返回布尔值或其他格式，转换为 0|1|2
     */
    convertGender(gender: any): 0 | 1 {
      if (gender === true || gender === 1 || gender === '1') return 1
      return 0
    },
    /**
     * [API调用] 保存宠物
     * 调用 POST /pet/save 接口保存宠物信息（新增或更新）
     * @param {CreatePetPayload & { id?: string | number }} payload - 宠物数据（包含id则为更新，不包含则为新增）
     */
    async savePet(payload: CreatePetPayload & { id?: string | number }) {
      try {
        // [API调用] POST /pet/save - 保存宠物信息
        const { data } = await savePet(payload)
        // 标准化返回的数据
        const normalizedPet = this.normalizePetData(data)
        if (payload.id) {
          // 更新
          const index = this.pets.findIndex((pet) => pet.id === payload.id)
          if (index !== -1) {
            this.pets[index] = normalizedPet
          }
          ElMessage.success('更新宠物成功')
        } else {
          // 新增
          this.pets.unshift(normalizedPet)
          ElMessage.success('添加宠物成功')
        }
        return normalizedPet
      } catch (error) {
        ElMessage.error(payload.id ? '更新宠物失败' : '添加宠物失败')
        throw error
      }
    },
    /**
     * [API调用] 删除宠物
     * 调用 POST /pet/remove/{id} 接口删除宠物
     * @param {string | number} id - 宠物ID
     */
    async deletePet(id: string | number) {
      try {
        // [API调用] POST /pet/remove/{id} - 删除宠物
        await removePet(id)
        this.pets = this.pets.filter((pet) => String(pet.id) !== String(id))
        ElMessage.success('删除宠物成功')
      } catch (error) {
        ElMessage.error('删除宠物失败')
        throw error
      }
    },
    setSearch(text: string) {
      this.searchText = text
    },
  },
})

