export type PostType = 1 | 2 | 3 | 4 | 5

export interface PostMediaItem {
  url: string
  type?: 1 | 2
  thumbnail?: string
}

export interface LocationInfo {
  address?: string
  city?: string
  district?: string
}

export interface Label {
  id: string | number
  name: string
  type?: 1 | 2 | 3
  icon?: string
  color?: string
  useCount?: number
  isRecommended?: 0 | 1
  createdAt?: string
}

export interface Post {
  id: string | number
  userId?: string | number
  title?: string
  content?: string
  postType: PostType
  mediaUrls?: PostMediaItem[] | string
  externalLink?: string
  locationInfo?: LocationInfo | string
  priceRange?: string
  likeCount?: number
  ratingCount?: number
  ratingTotal?: number
  ratingAvg?: number
  viewCount?: number
  status?: 1 | 2 | 3
  createdAt?: string
  updatedAt?: string
  labels?: Label[]
  activityId?: string | number | null
}

export interface PostRating {
  postId: string | number
  ratingAvg: number
  ratingCount: number
  ratingTotal: number
}

export interface CreatePostPayload {
  title?: string
  content?: string
  postType: PostType
  mediaUrls?: PostMediaItem[]
  externalLink?: string
  locationInfo?: LocationInfo
  priceRange?: string
  labelIds?: Array<string | number>
  activityId?: string | number
}

export interface Activity {
  id: string | number
  userId?: string | number
  title: string
  description?: string
  coverImage?: string
  activityType: 1 | 2
  activityTime: string
  endTime?: string
  address?: string
  onlineLink?: string
  maxParticipants?: number
  currentParticipants?: number
  status?: 1 | 2 | 3
  labels?: string[] | Label[]
  checkInEnabled?: 0 | 1
  checkInCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateActivityPayload {
  title: string
  description?: string
  coverImage?: string
  activityType: 1 | 2
  activityTime: string
  endTime?: string
  address?: string
  onlineLink?: string
  maxParticipants?: number
  labels?: string[]
  checkInEnabled?: 0 | 1
}

export interface PageResult<T> {
  records: T[]
  pageNumber: number
  pageSize: number
  totalPage?: number
  totalRow?: number
}


