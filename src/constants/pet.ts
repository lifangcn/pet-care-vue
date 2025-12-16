/**
 * 宠物类型常量定义
 * 1-狗 2-猫 3-其他
 */
export const PET_TYPE = {
  DOG: 1, // 狗
  CAT: 2, // 猫
  OTHER: 3, // 其他
} as const

/**
 * 宠物类型标签映射
 */
export const PET_TYPE_LABELS: Record<typeof PET_TYPE[keyof typeof PET_TYPE], string> = {
  [PET_TYPE.DOG]: '狗',
  [PET_TYPE.CAT]: '猫',
  [PET_TYPE.OTHER]: '其他',
}

/**
 * 获取宠物类型标签
 * @param type 宠物类型值
 * @returns 类型标签
 */
export const getPetTypeLabel = (type: number): string => {
  return PET_TYPE_LABELS[type as keyof typeof PET_TYPE_LABELS] || '未知'
}

/**
 * 宠物类型选项（用于下拉框等）
 */
export const PET_TYPE_OPTIONS = [
  { label: PET_TYPE_LABELS[PET_TYPE.DOG], value: PET_TYPE.DOG },
  { label: PET_TYPE_LABELS[PET_TYPE.CAT], value: PET_TYPE.CAT },
  { label: PET_TYPE_LABELS[PET_TYPE.OTHER], value: PET_TYPE.OTHER },
] as const

