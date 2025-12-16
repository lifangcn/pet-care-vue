/**
 * 头像工具函数
 * 根据用户名生成默认头像，或使用上传的头像
 */

/**
 * 根据用户名生成默认头像 URL
 * 使用 UI Avatars API 生成彩色头像
 * @param name 用户名或昵称
 * @returns 头像 URL
 */
export const generateAvatarByUsername = (name: string): string => {
  if (!name || name.trim() === '') {
    name = '用户'
  }
  
  // 使用 UI Avatars API 生成头像
  // 从用户名中提取首字符，如果包含中文则取第一个字符，否则取前两个字母
  const displayName = name.trim()
  
  // 生成一个基于用户名的稳定颜色（使用简单的哈希算法）
  const colors = [
    '54A0FF', // 蓝色
    '1DD1A1', // 绿色
    'FF9F43', // 橙色
    'FF6B9C', // 粉色
    'A855F7', // 紫色
    '14B8A6', // 青色
    'F59E0B', // 黄色
    'EF4444', // 红色
  ]
  
  // 简单的哈希函数，根据用户名生成稳定的颜色索引
  let hash = 0
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colorIndex = Math.abs(hash) % colors.length
  const backgroundColor = colors[colorIndex]
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${backgroundColor}&color=fff&size=200&bold=true`
}

/**
 * 获取用户头像 URL
 * 如果提供了自定义头像，使用自定义头像；否则根据用户名生成
 * @param customAvatar 自定义头像 URL（可选）
 * @param username 用户名或昵称
 * @returns 头像 URL
 */
export const getUserAvatar = (customAvatar?: string | null, username?: string): string => {
  if (customAvatar && customAvatar.trim() !== '') {
    return customAvatar
  }
  
  if (username) {
    return generateAvatarByUsername(username)
  }
  
  // 如果都没有，返回默认头像
  return generateAvatarByUsername('用户')
}

