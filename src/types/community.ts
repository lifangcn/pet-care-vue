export interface CommunityUser {
  id: string
  nickname: string
  avatar: string
  verified?: boolean
  verifiedType?: 'official' | 'vip'
}

export interface PostMedia {
  type: 'image' | 'video'
  url: string
  thumbnail?: string
}

export interface PostComment {
  id: string
  userId: string
  user: CommunityUser
  content: string
  createdAt: string
  replyTo?: string
  replyToUser?: CommunityUser
}

export interface CommunityPost {
  id: string
  userId: string
  user: CommunityUser
  content: string
  media?: PostMedia[]
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  commentsList?: PostComment[]
  createdAt: string
}

export interface CreatePostPayload {
  content: string
  media?: string[]
}

export interface PostFilter {
  page?: number
  pageSize?: number
  userId?: string
}

