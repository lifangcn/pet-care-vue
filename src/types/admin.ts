/** 审核状态枚举 */
export type AuditStatusOfContent = 'PENDING' | 'APPROVED' | 'REJECTED'

/** 管理后台用户信息 */
export interface AdminUserResponse {
  id: number
  username: string
  phone: string
  nickname: string
  avatar: string
  enabled: number
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

/** 启用/禁用用户请求 */
export interface AdminUserEnabledUpdateRequest {
  enabled: boolean
}

/** 设置用户角色请求 */
export interface AdminUserRoleUpdateRequest {
  isAdmin: boolean
}

/** 积分券模板创建/编辑请求 */
export interface PointsCouponTemplateRequest {
  name: string
  faceValue: number
  validDays: number
  totalCount: number
  perUserLimit: number
  sourceType: 'SYSTEM' | 'ACTIVITY' | 'NEWCOMER'
  status: number
}

/** 积分券模板 */
export interface PointsCouponTemplate {
  id: number
  name: string
  faceValue: number
  validDays: number
  totalCount: number
  issuedCount: number
  perUserLimit: number
  sourceType: string
  status: number
  createdAt: string
  updatedAt: string
}

/** 批量发放积分券请求 */
export interface CouponIssueRequest {
  userIds: number[]
}

/** 知识库文档响应 */
export interface KnowledgeDocumentResponse {
  id: number
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  processingStatus: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  chunkCount: number
  processingError: string
  createdAt: string
}
