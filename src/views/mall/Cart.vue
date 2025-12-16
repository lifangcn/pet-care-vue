<template>
  <div class="cart-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>购物车</h2>
          <el-button v-if="selectedItems.length > 0" type="danger" @click="clearSelected">清空选中</el-button>
        </div>
      </template>
      <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
      <div class="cart-list">
        <el-empty v-if="cartItems.length === 0" description="购物车是空的" />
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <el-checkbox v-model="item.selected" />
          <el-image :src="item.productImage" class="product-image" />
          <div class="product-info">
            <h4 @click="$router.push(`/mall/products/${item.productId}`)">{{ item.productName }}</h4>
            <p class="spec">{{ item.spec }}</p>
            <p class="price">¥{{ item.price.toFixed(2) }}</p>
          </div>
          <div class="quantity-control">
            <el-button @click="updateQuantity(item.id, item.quantity - 1)">-</el-button>
            <el-input-number v-model="item.quantity" :min="1" :max="item.stock" @change="(val) => updateQuantity(item.id, val)" />
            <el-button @click="updateQuantity(item.id, item.quantity + 1)">+</el-button>
          </div>
          <div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          <el-button type="text" @click="removeItem(item.id)">删除</el-button>
        </div>
      </div>
      <div class="cart-footer">
        <div class="total-info">
          <span>已选 {{ selectedItems.length }} 件</span>
          <span class="total-amount">合计：¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <el-button type="primary" size="large" :disabled="selectedItems.length === 0" @click="checkout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCart, updateCartItem, deleteCartItem, clearCart } from '@/services/mallService'
import type { CartItem } from '@/services/mallService'

const router = useRouter()
const cartItems = ref<(CartItem & { selected: boolean })[]>([])
const selectAll = ref(false)

const selectedItems = computed(() => cartItems.value.filter(item => item.selected))

const totalAmount = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const loadCart = async () => {
  try {
    const res = await fetchCart()
    cartItems.value = (res.data || []).map(item => ({ ...item, selected: false }))
  } catch (error) {
    console.error('加载购物车失败:', error)
  }
}

const handleSelectAll = (val: boolean) => {
  cartItems.value.forEach(item => {
    item.selected = val
  })
}

const updateQuantity = async (id: string, quantity: number) => {
  try {
    await updateCartItem(id, { quantity })
    loadCart()
  } catch (error) {
    console.error('更新数量失败:', error)
  }
}

const removeItem = async (id: string) => {
  try {
    await deleteCartItem(id)
    loadCart()
  } catch (error) {
    console.error('删除商品失败:', error)
  }
}

const clearSelected = async () => {
  try {
    const ids = selectedItems.value.map(item => item.id)
    for (const id of ids) {
      await deleteCartItem(id)
    }
    loadCart()
  } catch (error) {
    console.error('清空选中失败:', error)
  }
}

const checkout = () => {
  router.push('/orders?from=cart')
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped lang="scss">
.cart-page {
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

.cart-list {
  margin-top: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.product-image {
  width: 80px;
  height: 80px;
}

.product-info {
  flex: 1;
  h4 {
    margin: 0 0 8px;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
  .spec {
    margin: 0 0 8px;
    color: #666;
    font-size: 12px;
  }
  .price {
    margin: 0;
    color: #f56c6c;
    font-weight: bold;
  }
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-total {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  min-width: 100px;
  text-align: right;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.total-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  .total-amount {
    font-size: 24px;
    font-weight: bold;
    color: #f56c6c;
  }
}
</style>
