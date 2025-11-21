export interface Product {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  sales: number
  rating: number
  categoryId: string
  brand: string
  description?: string
  stock: number
}

export interface ProductCategory {
  id: string
  name: string
  icon?: string
  children?: ProductCategory[]
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selected: boolean
}

export interface ProductFilter {
  categoryId?: string
  brand?: string[]
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'sales_desc' | 'rating_desc'
  page?: number
  pageSize?: number
}

export interface ProductSpec {
  name: string
  type: 'radio' | 'checkbox'
  options: Array<{
    label: string
    value: string
    price?: number
    stock?: number
  }>
}

export interface ProductDetail extends Product {
  images: string[]
  specs?: ProductSpec[]
  detail?: string
  parameters?: Array<{
    name: string
    value: string
  }>
  promotion?: {
    title: string
    description: string
  }
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  content: string
  images?: string[]
  createdAt: string
}

export interface ReviewFilter {
  productId: string
  page?: number
  pageSize?: number
  rating?: number
}

