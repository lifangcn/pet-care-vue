<template>
  <div class="product-list-page">
    <el-container>
      <el-aside width="240px" class="category-sidebar">
        <el-menu
          :default-active="activeCategory"
          class="category-menu"
          @select="handleCategorySelect"
        >
          <el-menu-item index="all">
            <span>全部商品</span>
          </el-menu-item>
          <el-menu-item
            v-for="category in categories"
            :key="category.id"
            :index="category.id"
          >
            <span>{{ category.name }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="product-main">
        <div class="filter-bar">
          <div class="filter-left">
            <el-select v-model="filters.sortBy" placeholder="排序方式" style="width: 160px" @change="handleFilterChange">
              <el-option label="默认排序" value="" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
              <el-option label="销量最高" value="sales_desc" />
              <el-option label="评分最高" value="rating_desc" />
            </el-select>

            <div class="price-filter">
              <span class="filter-label">价格区间：</span>
              <el-slider
                v-model="priceRange"
                :min="0"
                :max="1000"
                :step="10"
                range
                style="width: 200px"
                @change="handlePriceChange"
              />
              <span class="price-display">¥{{ priceRange[0] }} - ¥{{ priceRange[1] }}</span>
            </div>
          </div>

          <div class="filter-right">
            <span class="filter-label">品牌：</span>
            <el-checkbox-group v-model="filters.brand" @change="handleFilterChange">
              <el-checkbox
                v-for="brand in brands"
                :key="brand"
                :label="brand"
                style="margin-right: 16px"
              >
                {{ brand }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <div class="product-grid">
          <el-row :gutter="20">
            <el-col
              v-for="product in products"
              :key="product.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card
                shadow="hover"
                class="product-card"
                @mouseenter="hoveredProduct = product.id"
                @mouseleave="hoveredProduct = null"
                @click="viewProductDetail(product.id)"
              >
                <div class="product-image-wrapper">
                  <el-image
                    :src="product.image"
                    fit="cover"
                    lazy
                    class="product-image"
                    :lazy="true"
                  />
                  <div v-if="hoveredProduct === product.id" class="product-actions" @click.stop>
                    <el-button
                      type="primary"
                      :icon="ShoppingCart"
                      @click.stop="handleAddToCart(product)"
                    >
                      加入购物车
                    </el-button>
                    <el-button
                      circle
                      :icon="isFavorited(product.id) ? StarFilled : Star"
                      :type="isFavorited(product.id) ? 'warning' : 'default'"
                      @click.stop="toggleFavorite(product.id)"
                    />
                  </div>
                </div>
                <div class="product-info">
                  <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
                  <div class="product-price">
                    <span class="current-price">¥{{ product.price }}</span>
                    <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
                  </div>
                  <div class="product-meta">
                    <span class="sales">销量：{{ product.sales }}</span>
                    <el-rate
                      :model-value="product.rating"
                      disabled
                      show-score
                      text-color="#ff9900"
                      score-template="{value}"
                      :max="5"
                    />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <el-empty v-if="!loading && products.length === 0" description="暂无商品" />

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48, 96]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Star, StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { fetchCategories, fetchProducts, fetchBrands } from '@/services/mallService'
import { useCartStore } from '@/store/cart'
import type { Product, ProductCategory, ProductFilter } from '@/types/mall'

const router = useRouter()

const cartStore = useCartStore()

const loading = ref(false)
const categories = ref<ProductCategory[]>([])
const products = ref<Product[]>([])
const brands = ref<string[]>([])
const activeCategory = ref('all')
const hoveredProduct = ref<string | null>(null)
const favorites = ref<string[]>([])

const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const priceRange = ref([0, 1000])

const filters = reactive<ProductFilter>({
  categoryId: undefined,
  brand: [],
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: undefined,
})

/**
 * [API调用] GET /products/categories
 * 加载商品分类列表
 */
const loadCategories = async () => {
  try {
    // [API调用] GET /products/categories - 获取商品分类列表
    const { data } = await fetchCategories()
    categories.value = data
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

/**
 * [API调用] GET /products
 * 加载商品列表
 */
const loadProducts = async () => {
  try {
    loading.value = true
    const params: ProductFilter = {
      ...filters,
      page: currentPage.value,
      pageSize: pageSize.value,
      minPrice: priceRange.value[0],
      maxPrice: priceRange.value[1],
    }

    // [API调用] GET /products - 获取商品列表
    const { data } = await fetchProducts(params)
    products.value = data.data
    total.value = data.total
  } catch (error) {
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

/**
 * [API调用] GET /products/brands
 * 加载品牌列表
 */
const loadBrands = async () => {
  try {
    // [API调用] GET /products/brands - 获取品牌列表
    const { data } = await fetchBrands()
    brands.value = data
  } catch (error) {
    ElMessage.error('加载品牌失败')
  }
}

const handleCategorySelect = (categoryId: string) => {
  activeCategory.value = categoryId
  filters.categoryId = categoryId === 'all' ? undefined : categoryId
  currentPage.value = 1
  loadProducts()
}

const handlePriceChange = () => {
  filters.minPrice = priceRange.value[0]
  filters.maxPrice = priceRange.value[1]
  currentPage.value = 1
  loadProducts()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadProducts()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadProducts()
}

const handleAddToCart = (product: Product) => {
  // [API调用] 通过store调用添加商品到购物车
  cartStore.addToCart(product, 1)
}

const isFavorited = (productId: string) => {
  return favorites.value.includes(productId)
}

const toggleFavorite = (productId: string) => {
  const index = favorites.value.indexOf(productId)
  if (index > -1) {
    favorites.value.splice(index, 1)
    ElMessage.success('已取消收藏')
  } else {
    favorites.value.push(productId)
    ElMessage.success('已添加收藏')
  }
}

const viewProductDetail = (productId: string) => {
  router.push(`/mall/products/${productId}`)
}

onMounted(async () => {
  await loadCategories()
  await loadProducts()
  await loadBrands()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as vars;

.product-list-page {
  min-height: 100vh;
  background: #f6f7fb;
  font-family: vars.$font-family-base;
}

.category-sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  padding: 16px 0;
}

.category-menu {
  border: none;

  .el-menu-item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #606266;

    &:hover {
      background-color: #f5f7fa;
    }

    &.is-active {
      color: vars.$pet-color-blue;
      background-color: #ecf5ff;
    }
  }
}

.product-main {
  padding: 24px;
}

.filter-bar {
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .filter-left {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .filter-right {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .filter-label {
    color: #606266;
    font-size: 14px;
    margin-right: 8px;
  }

  .price-filter {
    display: flex;
    align-items: center;
    gap: 12px;

    .price-display {
      color: vars.$pet-color-blue;
      font-weight: 600;
      min-width: 120px;
    }
  }
}

.product-grid {
  margin-bottom: 24px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .product-image-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 12px;

    .product-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .product-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      gap: 8px;
      padding: 12px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .product-actions {
      opacity: 1;
    }
  }

  .product-info {
    .product-name {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1f2d3d;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .product-price {
      margin-bottom: 8px;

      .current-price {
        font-size: 20px;
        font-weight: 700;
        color: vars.$pet-color-orange;
        margin-right: 8px;
      }

      .original-price {
        font-size: 14px;
        color: #909399;
        text-decoration: line-through;
      }
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #909399;

      .sales {
        flex: 1;
      }

      :deep(.el-rate) {
        height: auto;
      }
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  background: #fff;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .category-sidebar {
    width: 100% !important;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .filter-bar {
    flex-direction: column;
    align-items: flex-start;

    .filter-left,
    .filter-right {
      width: 100%;
    }
  }
}
</style>

