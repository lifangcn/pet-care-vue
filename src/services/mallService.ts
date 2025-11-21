import apiClient from './api'
import type {
  Product,
  ProductCategory,
  ProductFilter,
  ProductDetail,
  ProductReview,
  ReviewFilter,
} from '@/types/mall'

/**
 * [API调用] GET /products/categories
 * 获取商品分类列表
 * @returns {Promise} 返回商品分类列表数据
 */
export const fetchCategories = () => {
  return apiClient.get<ProductCategory[]>('/products/categories')
}

/**
 * [API调用] GET /products
 * 获取商品列表
 * @param {ProductFilter} params - 筛选参数
 * @returns {Promise} 返回商品列表数据和分页信息
 */
export const fetchProducts = (params?: ProductFilter) => {
  return apiClient.get<{ data: Product[]; total: number; page: number; pageSize: number }>('/products', { params })
}

/**
 * [API调用] GET /products/:id
 * 根据ID获取商品详情
 * @param {string} id - 商品ID
 * @returns {Promise} 返回商品详情数据
 */
export const fetchProductById = (id: string) => {
  return apiClient.get<ProductDetail>(`/products/${id}`)
}

/**
 * [API调用] GET /products/:id/reviews
 * 获取商品评价列表
 * @param {ReviewFilter} params - 评价筛选参数
 * @returns {Promise} 返回评价列表数据和分页信息
 */
export const fetchProductReviews = (params: ReviewFilter) => {
  return apiClient.get<{ data: ProductReview[]; total: number; page: number; pageSize: number }>(
    `/products/${params.productId}/reviews`,
    { params },
  )
}

/**
 * [API调用] GET /products/brands
 * 获取品牌列表
 * @returns {Promise} 返回品牌列表数据
 */
export const fetchBrands = () => {
  return apiClient.get<string[]>('/products/brands')
}

