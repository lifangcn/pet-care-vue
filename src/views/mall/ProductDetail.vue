<template>
  <div class="product-detail-page">
    <el-skeleton :loading="loading" animated>
      <template #template>
        <el-skeleton-item variant="image" style="width: 100%; height: 400px" />
        <el-skeleton-item variant="h1" style="width: 60%" />
        <el-skeleton-item variant="text" style="width: 80%" />
      </template>
      <template #default>
        <div v-if="product" class="product-container">
          <div class="product-main">
            <div class="product-images">
              <el-image
                :src="currentImage"
                fit="cover"
                lazy
                class="main-image"
                :preview-src-list="product.images"
                :initial-index="currentImageIndex"
                preview-teleported
              />
              <div class="image-thumbnails">
                <el-image
                  v-for="(img, index) in product.images"
                  :key="index"
                  :src="img"
                  fit="cover"
                  lazy
                  class="thumbnail"
                  :class="{ active: currentImageIndex === index }"
                  @click="currentImageIndex = index"
                />
              </div>
            </div>

            <div class="product-info">
              <h1 class="product-name">{{ product.name }}</h1>
              <div class="product-meta">
                <span class="sales">销量：{{ product.sales }}</span>
                <span class="stock">库存：{{ product.stock }} 件</span>
              </div>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
                <el-tag v-if="product.promotion" type="danger" class="promotion-tag">
                  {{ product.promotion.title }}
                </el-tag>
              </div>
              <div v-if="product.promotion" class="promotion-info">
                <el-alert :title="product.promotion.description" type="info" :closable="false" />
              </div>

              <div v-if="product.specs && product.specs.length > 0" class="product-specs">
                <div v-for="spec in product.specs" :key="spec.name" class="spec-item">
                  <div class="spec-label">{{ spec.name }}：</div>
                  <el-radio-group
                    v-if="spec.type === 'radio'"
                    v-model="selectedSpecs[spec.name]"
                    @change="handleSpecChange"
                  >
                    <el-radio-button
                      v-for="option in spec.options"
                      :key="option.value"
                      :label="option.value"
                      :disabled="option.stock === 0"
                    >
                      {{ option.label }}
                      <span v-if="option.price" class="spec-price">(+¥{{ option.price }})</span>
                    </el-radio-button>
                  </el-radio-group>
                  <el-checkbox-group
                    v-else
                    v-model="selectedSpecs[spec.name]"
                    @change="handleSpecChange"
                  >
                    <el-checkbox
                      v-for="option in spec.options"
                      :key="option.value"
                      :label="option.value"
                      :disabled="option.stock === 0"
                    >
                      {{ option.label }}
                      <span v-if="option.price" class="spec-price">(+¥{{ option.price }})</span>
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>

              <div class="quantity-selector">
                <span class="label">购买数量：</span>
                <el-input-number
                  v-model="quantity"
                  :min="1"
                  :max="product.stock"
                  :disabled="product.stock === 0"
                />
                <span class="stock-hint">(库存 {{ product.stock }} 件)</span>
              </div>

              <div class="product-actions">
                <el-button
                  type="primary"
                  size="large"
                  :icon="ShoppingCart"
                  :disabled="product.stock === 0"
                  @click="handleAddToCart"
                >
                  加入购物车
                </el-button>
                <el-button
                  type="danger"
                  size="large"
                  :icon="CreditCard"
                  :disabled="product.stock === 0"
                  @click="handleBuyNow"
                >
                  立即购买
                </el-button>
                <el-button
                  circle
                  size="large"
                  :icon="isFavorited ? StarFilled : Star"
                  :type="isFavorited ? 'warning' : 'default'"
                  @click="toggleFavorite"
                />
              </div>
            </div>
          </div>

          <div class="product-detail-tabs">
            <el-tabs v-model="activeTab">
              <el-tab-pane label="商品详情" name="detail">
                <div class="detail-content" v-html="product.detail || '暂无详情'"></div>
              </el-tab-pane>
              <el-tab-pane label="规格参数" name="parameters">
                <div class="parameters-content">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item
                      v-for="param in product.parameters"
                      :key="param.name"
                      :label="param.name"
                    >
                      {{ param.value }}
                    </el-descriptions-item>
                  </el-descriptions>
                  <el-empty v-if="!product.parameters || product.parameters.length === 0" description="暂无规格参数" />
                </div>
              </el-tab-pane>
              <el-tab-pane label="用户评价" name="reviews">
                <div class="reviews-content">
                  <div class="reviews-header">
                    <div class="reviews-summary">
                      <span class="summary-label">总体评分：</span>
                      <el-rate :model-value="product.rating" disabled show-score text-color="#ff9900" />
                      <span class="review-count">({{ reviewTotal }} 条评价)</span>
                    </div>
                    <el-select v-model="reviewFilter.rating" placeholder="筛选评分" style="width: 150px" @change="loadReviews">
                      <el-option label="全部" :value="undefined" />
                      <el-option label="5星" :value="5" />
                      <el-option label="4星" :value="4" />
                      <el-option label="3星" :value="3" />
                      <el-option label="2星" :value="2" />
                      <el-option label="1星" :value="1" />
                    </el-select>
                  </div>

                  <div class="reviews-list">
                    <div v-for="review in reviews" :key="review.id" class="review-item">
                      <div class="review-header">
                        <el-avatar :size="48" :src="review.userAvatar" />
                        <div class="review-user-info">
                          <div class="user-name">{{ review.userName }}</div>
                          <div class="review-meta">
                            <el-rate :model-value="review.rating" disabled size="small" />
                            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="review-content">
                        <p>{{ review.content }}</p>
                        <div v-if="review.images && review.images.length > 0" class="review-images">
                          <el-image
                            v-for="(img, idx) in review.images"
                            :key="idx"
                            :src="img"
                            fit="cover"
                            class="review-image"
                            :preview-src-list="review.images"
                            :initial-index="idx"
                            preview-teleported
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <el-empty v-if="!loadingReviews && reviews.length === 0" description="暂无评价" />

                  <div class="reviews-pagination">
                    <el-pagination
                      v-model:current-page="reviewPage"
                      v-model:page-size="reviewPageSize"
                      :page-sizes="[10, 20, 50]"
                      :total="reviewTotal"
                      layout="total, sizes, prev, pager, next"
                      @size-change="handleReviewSizeChange"
                      @current-change="handleReviewPageChange"
                    />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
        </div>
      </template>
    </el-skeleton>

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart, CreditCard, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchProductById, fetchProductReviews } from '@/services/mallService'
import { useCartStore } from '@/store/cart'
import type { ProductDetail, ProductReview, ReviewFilter } from '@/types/mall'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const productId = route.params.id as string
const loading = ref(true)
const product = ref<ProductDetail | null>(null)
const activeTab = ref('detail')
const quantity = ref(1)
const selectedSpecs = reactive<Record<string, string | string[]>>({})
const isFavorited = ref(false)

const currentImageIndex = ref(0)
const favorites = ref<string[]>([])

const reviews = ref<ProductReview[]>([])
const loadingReviews = ref(false)
const reviewPage = ref(1)
const reviewPageSize = ref(10)
const reviewTotal = ref(0)

const reviewFilter = reactive<ReviewFilter>({
  productId,
  page: 1,
  pageSize: 10,
  rating: undefined,
})

const currentImage = computed(() => {
  if (!product.value || !product.value.images || product.value.images.length === 0) return ''
  return product.value.images[currentImageIndex.value] || product.value.images[0]
})

/**
 * [API调用] GET /products/:id
 * 加载商品详情
 */
const loadProduct = async () => {
  try {
    loading.value = true
    // [API调用] GET /products/:id - 获取商品详情
    const { data } = await fetchProductById(productId)
    product.value = data

    // 初始化规格选择
    if (data.specs) {
      data.specs.forEach((spec) => {
        if (spec.type === 'radio' && spec.options.length > 0) {
          selectedSpecs[spec.name] = spec.options[0].value
        } else if (spec.type === 'checkbox') {
          selectedSpecs[spec.name] = []
        }
      })
    }

    // 检查是否已收藏
    isFavorited.value = favorites.value.includes(productId)
  } catch (error) {
    ElMessage.error('加载商品详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

/**
 * [API调用] GET /products/:id/reviews
 * 加载商品评价列表
 */
const loadReviews = async () => {
  try {
    loadingReviews.value = true
    reviewFilter.page = reviewPage.value
    reviewFilter.pageSize = reviewPageSize.value

    // [API调用] GET /products/:id/reviews - 获取商品评价列表
    const { data } = await fetchProductReviews(reviewFilter)
    reviews.value = data.records
    reviewTotal.value = data.totalRow
  } catch (error) {
    ElMessage.error('加载评价失败')
  } finally {
    loadingReviews.value = false
  }
}

const handleSpecChange = () => {
  // 规格变化时的处理逻辑
}

const handleAddToCart = () => {
  if (!product.value) return

  // [API调用] 通过store调用添加商品到购物车
  cartStore.addToCart(product.value, quantity.value)
}

const handleBuyNow = () => {
  if (!product.value) return

  // 立即购买：先加入购物车，然后跳转到结算页面
  cartStore.addToCart(product.value, quantity.value)
  router.push('/cart/checkout')
}

const toggleFavorite = () => {
  const index = favorites.value.indexOf(productId)
  if (index > -1) {
    favorites.value.splice(index, 1)
    isFavorited.value = false
    ElMessage.success('已取消收藏')
  } else {
    favorites.value.push(productId)
    isFavorited.value = true
    ElMessage.success('已添加收藏')
  }
}

const handleReviewSizeChange = (size: number) => {
  reviewPageSize.value = size
  reviewPage.value = 1
  loadReviews()
}

const handleReviewPageChange = (page: number) => {
  reviewPage.value = page
  loadReviews()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  await loadProduct()
  await loadReviews()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.product-detail-page {
  min-height: 100vh;
  background: #f6f7fb;
  padding: 24px;
  font-family: vars.$font-family-base;
}

.product-container {
  max-width: 1200px;
  margin: 0 auto;
}

.product-main {
  display: flex;
  gap: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-images {
  flex: 0 0 480px;

  .main-image {
    width: 100%;
    height: 480px;
    border-radius: 8px;
    margin-bottom: 12px;
    cursor: pointer;
  }

  .image-thumbnails {
    display: flex;
    gap: 8px;
    overflow-x: auto;

    .thumbnail {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;

      &.active {
        border-color: vars.$pet-color-blue;
      }

      &:hover {
        border-color: vars.$pet-color-blue;
      }
    }
  }
}

.product-info {
  flex: 1;

  .product-name {
    margin: 0 0 16px;
    font-size: 24px;
    font-weight: 700;
    color: #1f2d3d;
  }

  .product-meta {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    font-size: 14px;
    color: #909399;

    .sales,
    .stock {
      display: flex;
      align-items: center;
    }
  }

  .product-price {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 16px;

    .current-price {
      font-size: 32px;
      font-weight: 700;
      color: vars.$pet-color-orange;
    }

    .original-price {
      font-size: 18px;
      color: #909399;
      text-decoration: line-through;
    }

    .promotion-tag {
      margin-left: 8px;
    }
  }

  .promotion-info {
    margin-bottom: 24px;
  }

  .product-specs {
    margin-bottom: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    .spec-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .spec-label {
        margin-bottom: 8px;
        font-weight: 600;
        color: #606266;
      }

      .spec-price {
        color: vars.$pet-color-orange;
        font-size: 12px;
        margin-left: 4px;
      }
    }
  }

  .quantity-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .label {
      font-weight: 600;
      color: #606266;
    }

    .stock-hint {
      color: #909399;
      font-size: 14px;
    }
  }

  .product-actions {
    display: flex;
    gap: 12px;
  }
}

.product-detail-tabs {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.detail-content {
  padding: 24px 0;
  line-height: 1.8;
  color: #606266;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

.parameters-content {
  padding: 24px 0;
}

.reviews-content {
  padding: 24px 0;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;

  .reviews-summary {
    display: flex;
    align-items: center;
    gap: 12px;

    .summary-label {
      font-weight: 600;
      color: #606266;
    }

    .review-count {
      color: #909399;
      font-size: 14px;
    }
  }
}

.reviews-list {
  margin-bottom: 24px;
}

.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .review-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;

    .review-user-info {
      flex: 1;

      .user-name {
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 4px;
      }

      .review-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .review-date {
          color: #909399;
          font-size: 12px;
        }
      }
    }
  }

  .review-content {
    padding-left: 60px;

    p {
      margin: 0 0 12px;
      color: #606266;
      line-height: 1.6;
    }

    .review-images {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .review-image {
        width: 100px;
        height: 100px;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

@media (max-width: 768px) {
  .product-main {
    flex-direction: column;
  }

  .product-images {
    flex: none;
    width: 100%;
  }

  .reviews-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .review-content {
    padding-left: 0;
  }
}
</style>

