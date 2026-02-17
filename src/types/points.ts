/** 积分账户 */
export interface PointsAccount {
  availablePoints: number   // 可用积分
  totalPoints: number       // 累计积分（用于等级计算，只增不减）
}

/** 等级信息（前端根据 totalPoints 计算） */
export interface PointsLevel {
  level: number             // 1-10
  title: string             // 等级称号
  currentPoints: number     // 当前累计积分
  nextLevelPoints: number   // 下一级所需积分（满级为 -1）
  progress: number          // 进度百分比 0-100
}

/** 积分行为类型 */
export type PointsActionType =
  | 'REGISTER'        // 注册赠送
  | 'CHECK_IN'        // 签到
  | 'PUBLISH'         // 发布内容
  | 'COMMENT'         // 评论
  | 'LIKE'            // 点赞他人
  | 'LIKED'           // 被点赞
  | 'COMMENTED'       // 被评论
  | 'AI_CONSULT'      // AI健康咨询
  | 'COUPON_REDEEM'   // 代金券兑换

/** 代金券状态 */
export type PointsCouponStatus = 'UNUSED' | 'USED' | 'EXPIRED'

/** 积分流水记录 */
export interface PointsRecord {
  id: number
  points: number            // 积分变动值（正为获取，负为消耗）
  pointsBefore: number      // 变动前积分
  pointsAfter: number       // 变动后积分
  actionType: PointsActionType  // 行为类型
  bizType?: string          // 关联业务类型
  bizId?: number            // 关联业务ID
  couponId?: number         // 使用的代金券ID
  couponDeduct?: number     // 代金券抵扣积分数
  remark?: string           // 备注说明
  createdAt: string
}

/** 用户代金券 */
export interface PointsCoupon {
  id: number
  templateId: number        // 券模板ID
  faceValue: number         // 面值（可抵扣积分数）
  status: PointsCouponStatus // UNUSED-未使用 USED-已使用 EXPIRED-已过期
  startTime: string         // 生效时间
  endTime: string           // 失效时间
  usedTime?: string         // 使用时间
  createdAt: string
}

/** 积分流水查询参数 */
export interface PointsRecordQuery {
  actionType?: PointsActionType  // 行为类型筛选
  startTime?: string             // 开始时间
  endTime?: string               // 结束时间
  pageNumber: number
  pageSize: number
}

/** 券模板（抢劵活动用） */
export interface CouponTemplate {
  id: number                  // 模板ID
  name: string                // 券名称
  faceValue: number           // 面值（可抵扣积分数）
  stock: number               // 剩余库存（Redis实时）
  perUserLimit: number        // 每人限领数量
  validDesc: string           // 有效期描述，如"领取后30天有效"
}

/** 代金券查询参数 */
export interface PointsCouponQuery {
  status?: PointsCouponStatus    // 状态筛选
  pageNumber: number
  pageSize: number
}
