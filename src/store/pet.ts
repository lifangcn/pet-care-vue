import { defineStore } from 'pinia'
import { fetchPets, createPet, updatePet, removePet } from '@/services/petService'
import type { CreatePetPayload, Pet } from '@/types/pet'
import { ElMessage } from 'element-plus'

interface PetState {
  pets: Pet[]
  loading: boolean
  searchText: string
}

export const usePetStore = defineStore('pet', {
  state: (): PetState => ({
    pets: [],
    loading: false,
    searchText: '',
  }),
  getters: {
    filteredPets: (state) => {
      if (!state.searchText) return state.pets
      const keyword = state.searchText.toLowerCase()
      return state.pets.filter(
        (pet) =>
          pet.name.toLowerCase().includes(keyword) ||
          pet.breed.toLowerCase().includes(keyword) ||
          pet.healthStatus.toLowerCase().includes(keyword),
      )
    },
  },
  actions: {
    /**
     * [API调用] 加载宠物列表
     * 调用 GET /pets 接口获取所有宠物数据
     */
    async loadPets() {
      try {
        this.loading = true
        // [API调用] GET /pets - 获取宠物列表
        const { data } = await fetchPets()
        this.pets = data
      } catch (error) {
        ElMessage.error('获取宠物列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    /**
     * [API调用] 添加宠物
     * 调用 POST /pets 接口创建新宠物
     * @param {CreatePetPayload} payload - 宠物创建数据
     */
    async addPet(payload: CreatePetPayload) {
      try {
        // [API调用] POST /pets - 创建新宠物
        const { data } = await createPet(payload)
        this.pets.unshift(data)
        ElMessage.success('添加宠物成功')
      } catch (error) {
        ElMessage.error('添加宠物失败')
        console.error(error)
      }
    },
    /**
     * [API调用] 编辑宠物
     * 调用 PUT /pets/:id 接口更新宠物信息
     * @param {string} id - 宠物ID
     * @param {Partial<CreatePetPayload>} payload - 要更新的宠物数据
     */
    async editPet(id: string, payload: Partial<CreatePetPayload>) {
      try {
        // [API调用] PUT /pets/:id - 更新宠物信息
        const { data } = await updatePet(id, payload)
        const index = this.pets.findIndex((pet) => pet.id === id)
        if (index !== -1) {
          this.pets[index] = { ...this.pets[index], ...data }
        }
        ElMessage.success('更新宠物成功')
      } catch (error) {
        ElMessage.error('更新宠物失败')
        console.error(error)
      }
    },
    /**
     * [API调用] 删除宠物
     * 调用 DELETE /pets/:id 接口删除宠物
     * @param {string} id - 宠物ID
     */
    async deletePet(id: string) {
      try {
        // [API调用] DELETE /pets/:id - 删除宠物
        await removePet(id)
        this.pets = this.pets.filter((pet) => pet.id !== id)
        ElMessage.success('删除宠物成功')
      } catch (error) {
        ElMessage.error('删除宠物失败')
        console.error(error)
      }
    },
    setSearch(text: string) {
      this.searchText = text
    },
  },
})

