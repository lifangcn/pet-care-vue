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
  // TODO: 后端接口地址 GET /products/categories
  return apiClient.get<ProductCategory[]>('/products/categories')
}

/**
 * [API调用] GET /products
 * 获取商品列表
 * @param {ProductFilter} params - 筛选参数
 * @returns {Promise} 返回商品列表数据和分页信息
 */
export const fetchProducts = (params?: ProductFilter) => {
  // TODO: 后端接口地址 GET /products
  return apiClient.get<{ records: Product[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/products', { params })
}

/**
 * [API调用] GET /products/:id
 * 根据ID获取商品详情
 * @param {string} id - 商品ID
 * @returns {Promise} 返回商品详情数据
 */
export const fetchProductById = (id: string) => {
  // TODO: 后端接口地址 GET /products/:id
  return apiClient.get<ProductDetail>(`/products/${id}`)
}

/**
 * [API调用] GET /products/:id/reviews
 * 获取商品评价列表
 * @param {ReviewFilter} params - 评价筛选参数
 * @returns {Promise} 返回评价列表数据和分页信息
 */
export const fetchProductReviews = (params: ReviewFilter) => {
  // TODO: 后端接口地址 GET /products/:id/reviews
  return apiClient.get<{ records: ProductReview[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>(
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
  // TODO: 后端接口地址 GET /products/brands
  return apiClient.get<string[]>('/products/brands')
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  spec: string
  stock: number
}

export const fetchCart = () => {
  // TODO: 后端接口地址 GET /cart
  return apiClient.get<CartItem[]>('/cart')
}

export const addToCart = (payload: { productId: string; quantity: number; spec?: string }) => {
  // TODO: 后端接口地址 POST /cart
  return apiClient.post<CartItem>('/cart', payload)
}

export const updateCartItem = (id: string, payload: { quantity: number }) => {
  // TODO: 后端接口地址 PUT /cart/:id
  return apiClient.put<CartItem>(`/cart/${id}`, payload)
}

export const deleteCartItem = (id: string) => {
  // TODO: 后端接口地址 DELETE /cart/:id
  return apiClient.delete(`/cart/${id}`)
}

export const clearCart = () => {
  // TODO: 后端接口地址 DELETE /cart
  return apiClient.delete('/cart')
}

export interface Order {
  id: string
  orderNo: string
  status: 'PENDING_PAYMENT' | 'PENDING_SHIPMENT' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDING'
  totalAmount: number
  items: OrderItem[]
  address: { name: string; phone: string; address: string }
  createdAt: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  price: number
  quantity: number
  spec: string
}

export const createOrder = (payload: { items: any[]; paymentMethod: string; couponId?: string }) => {
  // TODO: 后端接口地址 POST /orders
  return apiClient.post<Order>('/orders', payload)
}

export const fetchOrders = (params?: { status?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /orders
  return apiClient.get<{ records: Order[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/orders', { params })
}

export const fetchOrderById = (id: string) => {
  // TODO: 后端接口地址 GET /orders/:id
  return apiClient.get<Order>(`/orders/${id}`)
}

export const cancelOrder = (id: string) => {
  // TODO: 后端接口地址 PUT /orders/:id/cancel
  return apiClient.put(`/orders/${id}/cancel`)
}

export const payOrder = (id: string, payload: { paymentMethod: string }) => {
  // TODO: 后端接口地址 POST /orders/:id/pay
  return apiClient.post(`/orders/${id}/pay`, payload)
}

export const confirmReceipt = (id: string) => {
  // TODO: 后端接口地址 PUT /orders/:id/confirm
  return apiClient.put(`/orders/${id}/confirm`)
}

export const applyRefund = (id: string, payload: { reason: string; images?: string[] }) => {
  // TODO: 后端接口地址 POST /orders/:id/refund
  return apiClient.post(`/orders/${id}/refund`, payload)
}

export const createOrderReview = (orderId: string, payload: { items: any[] }) => {
  // TODO: 后端接口地址 POST /orders/:orderId/reviews
  return apiClient.post(`/orders/${orderId}/reviews`, payload)
}

export interface Coupon {
  id: string
  name: string
  type: 'discount' | 'cash'
  value: number
  minAmount: number
  validFrom: string
  validTo: string
  description: string
  used: boolean
}

export const fetchCoupons = (params?: { status?: string; page?: number; pageSize?: number }) => {
  // TODO: 后端接口地址 GET /coupons
  return apiClient.get<{ records: Coupon[]; pageNumber: number; pageSize: number; totalPage: number; totalRow: number }>('/coupons', { params })
}

export const receiveCoupon = (id: string) => {
  // TODO: 后端接口地址 POST /coupons/:id/receive
  return apiClient.post(`/coupons/${id}/receive`)
}

export const fetchAvailableCoupons = (amount: number) => {
  // TODO: 后端接口地址 GET /coupons/available?amount=xxx
  return apiClient.get<Coupon[]>('/coupons/available', { params: { amount } })
}

