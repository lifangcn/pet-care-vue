import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import type { CartItem, Product } from '@/types/mall'

interface CartState {
  items: CartItem[]
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
  }),
  getters: {
    totalItems: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice: (state) => {
      return state.items
        .filter((item) => item.selected)
        .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    },
    selectedItems: (state) => {
      return state.items.filter((item) => item.selected)
    },
  },
  actions: {
    /**
     * [API调用] 添加商品到购物车
     * 注意：这里暂时使用本地存储，后续需要调用 POST /cart/items 接口
     * @param {Product} product - 商品信息
     * @param {number} quantity - 数量，默认为1
     */
    addToCart(product: Product, quantity: number = 1) {
      const existingItem = this.items.find((item) => item.productId === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
        ElMessage.success(`已更新购物车，${product.name} 数量：${existingItem.quantity}`)
      } else {
        const newItem: CartItem = {
          id: `cart_${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          selected: true,
        }
        this.items.push(newItem)
        ElMessage.success(`已添加 ${product.name} 到购物车`)
      }
    },
    /**
     * [API调用] 从购物车移除商品
     * 注意：这里暂时使用本地操作，后续需要调用 DELETE /cart/items/:id 接口
     * @param {string} itemId - 购物车项ID
     */
    removeFromCart(itemId: string) {
      this.items = this.items.filter((item) => item.id !== itemId)
      ElMessage.success('已从购物车移除')
    },
    /**
     * [API调用] 更新购物车商品数量
     * 注意：这里暂时使用本地操作，后续需要调用 PUT /cart/items/:id 接口
     * @param {string} itemId - 购物车项ID
     * @param {number} quantity - 新数量
     */
    updateQuantity(itemId: string, quantity: number) {
      const item = this.items.find((item) => item.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },
    /**
     * 切换商品选中状态
     * @param {string} itemId - 购物车项ID
     */
    toggleSelect(itemId: string) {
      const item = this.items.find((item) => item.id === itemId)
      if (item) {
        item.selected = !item.selected
      }
    },
    /**
     * 清空购物车
     * 注意：这里暂时使用本地操作，后续需要调用 DELETE /cart/items 接口
     */
    clearCart() {
      this.items = []
      ElMessage.success('购物车已清空')
    },
  },
})

